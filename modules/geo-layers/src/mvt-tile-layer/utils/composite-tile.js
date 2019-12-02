import FeatureManager from './feature-manager';

export default class CompositeTile {
  constructor({tileset = [], zoomLevel, uniquePropertyName, onTileLoad}) {
    this.tileset = convertArrayToMap(tileset, getTileId);
    this.tilesLoaded = new Map();
    this.zoomLevel = zoomLevel;
    this._onTileLoad = onTileLoad;

    this._featureManager = new FeatureManager({
      uniquePropertyName
    });

    tileset.map(tile => this.tilesLoaded.set(getTileId(tile), false));
    this.waitForDataInTiles(tileset);
  }

  getData() {
    if (this._featureManager.hasFeatures()) {
      return this._featureManager.getData();
    }

    return Promise.all(Array.from(this.tileset.values()).map(tile => tile.data)).then(allData => allData.flat());
  }

  getZoomLevel() {
    return this.zoomLevel;
  }

  waitForDataInTiles(pendingTiles) {
    return Promise.all(pendingTiles.map(pendingTile => {
      const tileID = getTileId(pendingTile);
      const tileData = pendingTile.data;
      const dataStillPending = Boolean(tileData.then);

      if (!dataStillPending) {
        this._featureManager.add(tileData);
        this.tilesLoaded.set(tileID, true);
        this._onTileLoad();
        return Promise.resolve();
      }

      return tileData.then(loadedData => {
        if (!loadedData) {
          this.tilesLoaded.set(getTileId(pendingTile), true);
          this._onTileLoad();
          return;
        }

        this._featureManager.add(loadedData);
        this.tilesLoaded.set(getTileId(pendingTile), true);
        this._onTileLoad();
      });
    }));
  }

  addDifferentialTiles(tileset) {
    const newTiles = tileset.filter(tile => !this.tileset.has(getTileId(tile)));

    if (this._layer && (newTiles.length > 0)) {
      this._layer = null;
    }

    newTiles.forEach(tile => {
      this.tileset.set(getTileId(tile), tile)
      this.tilesLoaded.set(getTileId(tile), false);
    });

    return this.waitForDataInTiles(newTiles);
  }

  isEveryTileLoaded() {
    return Array.from(this.tilesLoaded.values()).every(isLoaded => isLoaded);
  }

  // Methods for rendered layer caching
  addLayer(layer) {
    this._layer = layer;
  }

  getLayer() {
    return this._layer;
  }

  resetLayer() {
    this._layer = null;
  }
}

function getTileId(tile) {
  return `${tile.x}-${tile.y}-${tile.z}`;
}

function convertArrayToMap(arrayInstance, propertyInterpolator) {
  const arrayToMap = function arrayToMap(mapInstance, currentObject) {
    mapInstance.set(propertyInterpolator(currentObject), currentObject);

    return mapInstance;
  };

  return arrayInstance.reduce(arrayToMap, new Map());
}
