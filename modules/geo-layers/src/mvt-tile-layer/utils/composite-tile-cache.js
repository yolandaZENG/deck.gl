export default class CompositeTileCache {
  constructor({maximumTilesInCache = 3} = {}) {
    this._tiles = new Map();
    this._maximumTilesInCache = maximumTilesInCache;
  }

  getTiles() {
    return Array.from(this._tiles.values());
  }

  addTile(compositeTileName, compositeTile) {
    this.resizeCache();

    this._tiles.set(compositeTileName, compositeTile);
  }

  getTile(compositeTileZoomLevel) {
    return this._tiles.get(compositeTileZoomLevel);
  }

  getCacheSize() {
    return this._tiles.size;
  }

  hasTile(compositeTileName) {
    return this._tiles.has(compositeTileName);
  }

  resetLayers() {
    this._tiles.forEach(tile => {
      tile.resetLayer();
    });
  }

  resetLayer(zoomLevel) {
    this._tiles.get(zoomLevel).resetLayer();
  }

  resizeCache() {
    if (this._maximumTilesInCache < this.getCacheSize()) {
      return;
    }

    const cachedTiles = Array.from(this._tiles.keys());
    const numberOfTilesToDelete = this.getCacheSize() - this._maximumTilesInCache;

    for (let i = 0; i <= numberOfTilesToDelete; i++) {
      this._tiles.delete(cachedTiles[i]);
    }
  }
}
