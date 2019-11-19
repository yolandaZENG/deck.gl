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
    const {maxZoom, minZoom, urlTemplate, onTileError, uniquePropertyName} = this.props;
    const getTileData = this.getTileData.bind(this);

    this.state = {
      tiles: [],
      tileCache: new TileCache({getTileData, maxZoom, minZoom, onTileError}),
      urlTemplate,
      uniquePropertyName,
      isLoaded: false,
      worker: null,
      pendingTileRequests: {}
    };

    this.createWorker();
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

  updateState({props, context, changeFlags}) {
    const {onViewportLoaded, onTileError, uniquePropertyName} = props;

    if (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.all) {
      const {maxZoom, minZoom, maxCacheSize} = props;

      this.state.tileCache.finalize();
      this.setState({
        tileCache: new TileCache({
          getTileData: this.getTileData.bind(this),
          maxSize: maxCacheSize,
          maxZoom,
          minZoom,
          onTileError
        })
      });
    }

    if (changeFlags.viewportChanged) {
      const {viewport} = context;
      const z = this.getLayerZoomLevel();

      if (viewport.id !== 'DEFAULT-INITIAL-VIEWPORT') {
        this.state.tileCache.update(viewport, tiles => {
          const currTiles = tiles.filter(tile => tile.z === z);
          const allCurrTilesLoaded = currTiles.every(tile => tile.isLoaded);

          const compositeTile = new CompositeTile({
            tileset: currTiles,
            zoomLevel: z,
            uniquePropertyName
          });

          this.setState({tiles: compositeTile, isLoaded: allCurrTilesLoaded});

          if (!allCurrTilesLoaded) {
            Promise.all(currTiles.map(tile => tile.data)).then(() => {
              this.setState({isLoaded: true});
              onViewportLoaded(currTiles.filter(tile => tile._data).map(tile => tile._data));
            });
          } else {
            onViewportLoaded(currTiles.filter(tile => tile._data).map(tile => tile._data));
          }
        });
      }
    }
  }

  renderLayers() {
    const {renderSubLayers, visible} = this.props;
    const z = this.getLayerZoomLevel();
    const data = this.state.tiles.getData();

    return renderSubLayers(
      Object.assign({}, this.props, {
        id: `${this.id}-${this.state.tiles.zoomLevel}`,
        visible: visible && (!this.state.isLoaded || this.state.tiles.zoomLevel === z),
        data,
        tile: this.state.tiles
      })
    );
  }

  createWorker() {
    const worker = new Worker('./workers/worker.js', {type: 'module'});
    worker.onmessage = this.onMessageReceived.bind(this);

    this.setState({worker});
  }
}

MVTTileLayer.layerName = 'MVTTileLayer';
MVTTileLayer.defaultProps = defaultProps;
