import TileLayer from '../tile-layer/tile-layer';
import TileCache from '../tile-layer/utils/tile-cache';
import CompositeTile from './utils/composite-tile';
import CompositeTileCache from './utils/composite-tile-cache';

import createInlineWorker from 'webworkify-webpack';

const defaultProps = {
  ...TileLayer.defaultProps,
  uniquePropertyName: ''
};

export default class MVTTileLayer extends TileLayer {
  initializeState() {
    const {urlTemplates = [], uniquePropertyName} = this.props;

    this.state = {
      tiles: [],
      compositeTileCache: new CompositeTileCache(),
      urlTemplates,
      uniquePropertyName,
      isLoaded: false,
      worker: this.createWorker(),
      pendingTileRequests: {}
    };
  }

  getTileData(tileProperties) {
    const {worker} = this.state;
    const templateReplacer = (_, property) => tileProperties[property];

    const tileURLIndex = getTileURLIndex(tileProperties, this.state.urlTemplates.length);
    const tileURL = this.state.urlTemplates[tileURLIndex].replace(
      /\{ *([\w_-]+) *\}/g,
      templateReplacer
    );

    return new Promise((resolve, reject) => {
      worker.postMessage({tileURL, tileProperties});

      // TODO: Implement better worker orchestration
      const {pendingTileRequests} = this.state;
      pendingTileRequests[tileURL] = {resolve, reject};
    });
  }

  onMessageReceived(message) {
    const {pendingTileRequests} = this.state;
    pendingTileRequests[message.data.url].resolve(message.data.features);
  }

  updateState({props, oldProps, context, changeFlags}) {
    const {compositeTileCache} = this.state;
    let {tileCache} = this.state;

    if (
      !tileCache ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getTileData))
    ) {
      const {maxZoom, minZoom, maxCacheSize} = props;
      const getTileData = this.getTileData.bind(this);

      if (tileCache) {
        tileCache.finalize();
      }
      tileCache = new TileCache({
        getTileData,
        maxSize: maxCacheSize,
        maxZoom,
        minZoom,
        onTileLoad: this._onTileLoad.bind(this),
        onTileError: this._onTileError.bind(this)
      });
      this.setState({tileCache});
    } else if (changeFlags.updateTriggersChanged) {
      compositeTileCache.resetLayers();
    }

    const {viewport} = context;
    if (changeFlags.viewportChanged && viewport.id !== 'DEFAULT-INITIAL-VIEWPORT') {
      this._onViewportChanged(viewport);
    }
  }

  _onViewportChanged(viewport) {
    const {compositeTileCache, tileCache} = this.state;
    const {uniquePropertyName} = this.props;
    const z = this.getLayerZoomLevel();

    tileCache.update(viewport);

    // The tiles that should be displayed at this zoom level
    const currTiles = tileCache.tiles.filter(tile => tile.z === z);

    let compositeTile;
    if (compositeTileCache.hasTile(this.getLayerZoomLevel())) {
      compositeTile = compositeTileCache.get(this.getLayerZoomLevel());
      compositeTile.addDifferentialTiles(currTiles);
    } else {
      compositeTile = new CompositeTile({
        tileset: currTiles,
        zoomLevel: this.getLayerZoomLevel(),
        uniquePropertyName,
        onTileLoad: this._onTileLoad.bind(this)
      });
      compositeTileCache.add(this.getLayerZoomLevel(), compositeTile);
    }

    this.setState({isLoaded: false, tiles: currTiles, compositeTile});
  }

  _onTileLoad() {
    const {onViewportLoaded} = this.props;
    const {compositeTile, compositeTileCache} = this.state;

    compositeTileCache.resetLayers();

    const areTilesLoaded = compositeTile.isEveryTileLoaded();

    if (this.state.isLoaded !== areTilesLoaded) {
      this.setState({isLoaded: areTilesLoaded});
      if (areTilesLoaded && onViewportLoaded) {
        onViewportLoaded(compositeTile.getData());
      }
    }
  }

  renderLayers() {
    const z = this.getLayerZoomLevel();
    const {compositeTileCache} = this.state;
    const compositeTile = compositeTileCache.get(this.getLayerZoomLevel());

    if (compositeTile.getLayer()) {
      return [compositeTile.getLayer()];
    }

    compositeTileCache.resetLayers();

    const {renderSubLayers, visible} = this.props;
    const data = this.state.compositeTile.getData();

    const layer = renderSubLayers(
      Object.assign({}, this.props, {
        id: `${this.id}-${this.state.compositeTile.getZoomLevel()}`,
        visible: visible && (!this.state.isLoaded || this.state.compositeTile.getZoomLevel() === z),
        data,
        tile: this.state.tiles
      })
    );

    compositeTile.addLayer(layer);
    return [layer];
  }

  createWorker() {
    const worker = createInlineWorker(require.resolve('./workers/worker.js'));
    worker.onmessage = this.onMessageReceived.bind(this);

    return worker;
  }
}

function getTileURLIndex({x, y}, templatesLength) {
  return Math.abs(x + y) % templatesLength;
}

MVTTileLayer.layerName = 'MVTTileLayer';
MVTTileLayer.defaultProps = defaultProps;
