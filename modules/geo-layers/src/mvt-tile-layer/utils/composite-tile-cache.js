export default class CompositeTileCache {
  constructor({maximumTilesInCache = 5} = {}) {
    this._tiles = new Map();
    this._maximumTilesInCache = maximumTilesInCache;
  }

  size() {
    return this._tiles.size;
  }

  hasTile(compositeTileName) {
    return this._tiles.has(compositeTileName);
  }

  add(compositeTileName, compositeTile) {
    this.resetLayers();
    this.resizeCache();

    this._tiles.set(compositeTileName, compositeTile);
  }

  get(compositeTileName) {
    return this._tiles.get(compositeTileName);
  }

  resetLayers() {
    this._tiles.forEach(tile => {
      tile.resetLayer();
    });
  }

  resizeCache() {
    if (this._maximumTilesInCache < this.size()) {
      return;
    }

    const cachedTiles = Array.from(this._tiles.keys());
    const numberOfTilesToDelete = this.size() - this._maximumTilesInCache;

    for (let i = 0; i <= numberOfTilesToDelete; i++) {
      this._tiles.delete(cachedTiles[i]);
    }
  }
}
