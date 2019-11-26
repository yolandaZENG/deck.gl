import TileLayer from '../tile-layer/tile-layer';
import TileCache from '../tile-layer/utils/tile-cache';
import CompositeTile from './utils/composite-tile';

/* global Worker */

const defaultProps = {
  ...TileLayer.defaultProps,
  uniquePropertyName: ''
};

export default class MVTTileLayer extends TileLayer {
  initializeState() {
    const {urlTemplate, uniquePropertyName} = this.props;

    this.state = {
      tiles: [],
      urlTemplate,
      uniquePropertyName,
      isLoaded: false,
      worker: this.createWorker(),
      pendingTileRequests: {}
    };
  }

  getTileData(tileProperties) {
    const {worker} = this.state;
    const templateReplacer = (_, property) => tileProperties[property];
    const tileURL = this.state.urlTemplate.replace(/\{ *([\w_-]+) *\}/g, templateReplacer);

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
    }

    const {viewport} = context;
    if (changeFlags.viewportChanged && viewport.id !== 'DEFAULT-INITIAL-VIEWPORT') {
      const {uniquePropertyName} = props;
      const z = this.getLayerZoomLevel();
      tileCache.update(viewport);
      // The tiles that should be displayed at this zoom level
      const currTiles = tileCache.tiles.filter(tile => tile.z === z);

      const compositeTile = new CompositeTile({
        tileset: currTiles,
        zoomLevel: this.getLayerZoomLevel(),
        uniquePropertyName
      });

      this.setState({isLoaded: false, tiles: currTiles, compositeTile});
      this._onTileLoad();
    }
  }

  renderLayers() {
    const {renderSubLayers, visible} = this.props;
    const z = this.getLayerZoomLevel();
    const data = this.state.compositeTile.getData();

    return renderSubLayers(
      Object.assign({}, this.props, {
        id: `${this.id}-${this.state.compositeTile.getZoomLevel()}`,
        visible: visible && (!this.state.isLoaded || this.state.compositeTile.getZoomLevel() === z),
        data,
        tile: this.state.tiles
      })
    );
  }

  createWorker() {
    const worker = new Worker('./workers/worker.js', {type: 'module'});
    worker.onmessage = this.onMessageReceived.bind(this);

    return worker;
  }
}

MVTTileLayer.layerName = 'MVTTileLayer';
MVTTileLayer.defaultProps = defaultProps;
