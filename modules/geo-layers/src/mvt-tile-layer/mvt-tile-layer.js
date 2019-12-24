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
      compositeTileCache: new CompositeTileCache(),
      compositeTileLoadStatus: {},

      urlTemplates,
      uniquePropertyName,

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
      // TODO: Implement better worker orchestration
      const {pendingTileRequests} = this.state;
      pendingTileRequests[tileURL] = {resolve, reject};

      worker.postMessage({tileURL, tileProperties});
    });
  }

  onMessageReceived(message) {
    const {pendingTileRequests} = this.state;
    pendingTileRequests[message.data.url].resolve(message.data.features);
  }

  updateState({props, context, changeFlags}) {
    const {compositeTileCache} = this.state;
    let {tileCache} = this.state;

    if (
      !tileCache ||
      (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.all)
    ) {
      const {maxZoom, minZoom, maxCacheSize} = props;

      if (tileCache) {
        tileCache.finalize();
      }
      tileCache = new TileCache({
        getTileData: this.getTileData.bind(this),
        maxSize: maxCacheSize,
        maxZoom,
        minZoom,
        onTileLoad: () => {},
        onTileError: this._onTileError.bind(this)
      });
      this.setState({tileCache});
    } else if (changeFlags.propsChanged) {
      compositeTileCache.resetLayers();
    }

    const {viewport} = context;
    if (changeFlags.viewportChanged && viewport.id !== 'DEFAULT-INITIAL-VIEWPORT') {
      this._onViewportChanged(viewport);
    }
  }

  _onViewportChanged(viewport) {
    const {compositeTileCache, tileCache, compositeTileLoadStatus} = this.state;
    const {uniquePropertyName} = this.props;
    const zoomLevel = this.getLayerZoomLevel();

    tileCache.update(viewport);

    // The tiles that should be displayed at this zoom level
    const currTiles = tileCache.tiles.filter(tile => tile.z === zoomLevel);

    let compositeTile;
    if (compositeTileCache.hasTile(zoomLevel)) {
      compositeTile = compositeTileCache.getTile(zoomLevel);
      compositeTile.addDifferentialTiles(currTiles);
    } else {
      compositeTile = new CompositeTile({
        tileset: currTiles,
        zoomLevel,
        uniquePropertyName,
        onTileLoad: this._onTileLoad.bind(this)
      });
      compositeTileCache.addTile(zoomLevel, compositeTile);
    }

    this.setState({
      compositeTile,
      compositeTileLoadStatus: {
        ...compositeTileLoadStatus,
        [compositeTile.getZoomLevel()]: compositeTile.isEveryTileLoaded()
      }
    });
  }

  _onTileLoad(compositeTile) {
    // console.log('_onTileLoad');
    const {onViewportLoaded} = this.props;
    const {compositeTileLoadStatus} = this.state;

    if (compositeTile.getZoomLevel() !== this.getLayerZoomLevel()) {
      return;
    }

    const areTilesLoaded = compositeTile.isEveryTileLoaded();
    const wasCompositeTileLoaded = compositeTileLoadStatus[compositeTile.getZoomLevel()] || false;
    // console.log({areTilesLoaded, wasCompositeTileLoaded});

    if (wasCompositeTileLoaded !== areTilesLoaded) {
      this.setState({
        compositeTileLoadStatus: {
          ...compositeTileLoadStatus,
          [compositeTile.getZoomLevel()]: areTilesLoaded
        }
      });

      // console.log('Tiles have just finished loading');

      if (areTilesLoaded && onViewportLoaded) {
        onViewportLoaded(compositeTile.getData());
      }
    }
  }

  renderLayers() {
    // console.log('***************** NEW RENDER *****************')
    const {renderSubLayers, visible: layerVisible} = this.props;
    const {compositeTileCache, compositeTileLoadStatus} = this.state;
    const z = this.getLayerZoomLevel();

    const compositeTiles = compositeTileCache.getTiles();
    const latestVisibleLayer = compositeTiles.filter(tile => {
      const layer = tile.getLayer();

      return (tile.getZoomLevel() < z) &&
        (layer && layer.props.visible);
        // &&tile.isEveryTileLoaded();
    });

    const latestVisibleLayerZL = latestVisibleLayer[0] && latestVisibleLayer[0].getZoomLevel() || -Infinity;

    return compositeTiles.map(compositeTile => {
      // console.group(`Layer with Zoom: ${compositeTile.getZoomLevel()}`);
      const currentZoomLevelTileLoaded = compositeTileLoadStatus[z] || false;
      const isSameZoomLevel = compositeTile.getZoomLevel() === z;
      const isMaxRenderedZoomLevelTile = latestVisibleLayerZL === compositeTile.getZoomLevel();

      const visible = layerVisible && (
        (!currentZoomLevelTileLoaded && isMaxRenderedZoomLevelTile) || isSameZoomLevel
      );

      // console.log('Visible:', visible);
      // console.log({ layerVisible });
      // console.log({ isCompositeTileLoaded });
      // console.log({ isMaxRenderedZoomLevelTile });
      // console.log({ isSameZoomLevel });

      let layer = compositeTile.getLayer();
      if (!layer) {
        // console.log(`Layer ${compositeTile.getZoomLevel()}: rendering a new layer`)
        const data = this.state.compositeTile.getData();

        layer = renderSubLayers(
          Object.assign({}, this.props, {
            id: `${this.id}-${compositeTile.getZoomLevel()}`,
            visible,
            data,
            tile: compositeTile
          })
        );

        if (compositeTile.isEveryTileLoaded()) {
          compositeTile.addLayer(layer);
        }
      } else if (layer.props.visible !== visible) {
        // console.log(`Layer ${compositeTile.getZoomLevel()}: changing visibility to layer`)
        layer = compositeTile.getLayer().clone({ visible });

        if (compositeTile.isEveryTileLoaded()) {
          compositeTile.addLayer(layer);
        }
      } else {
        // console.log(`Layer ${compositeTile.getZoomLevel()}: rendering cached layer`);
      }
      // console.log(`Layer ${compositeTile.getZoomLevel()}: visibility ${layer.props.visible}`);
      // console.groupEnd(`Layer with Zoom: ${compositeTile.getZoomLevel()}`);
      return layer;
    });
    // console.log('***************** RENDER END *****************')
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
