import FeatureManager from './feature-manager';

export default class CompositeTile {
  constructor({tileset = [], zoomLevel, uniquePropertyName, onTileLoad}) {
    this.tileset = convertArrayToMap(tileset, getTileId);
    this.tileLoadStatus = new Map();
    this.zoomLevel = zoomLevel;
    this._onTileLoad = onTileLoad;

    this._featureManager = new FeatureManager({
      uniquePropertyName
    });

    this.addTiles(tileset);
  }

  getData() {
    if (this._featureManager.hasFeatures()) {
      return this._featureManager.getData();
    }

    return [];
  }

  getZoomLevel() {
    return this.zoomLevel;
  }

  addTiles(tiles) {
    tiles.forEach(tile => {
      this.tileset.set(getTileId(tile), tile);
      this.tileLoadStatus.set(getTileId(tile), false);
    });
    // console.log('adding new tiles and marked as not loaded');

    return this._waitForDataInTiles(tiles)
    .then(() => {
      this.resetLayer();
      this._onTileLoad(this);
    })
    .catch(console.error);
  }

  addDifferentialTiles(tileset) {
    // We'd need to set as new tiles that have not been loaded yet :(
    const newTiles = tileset.filter(tile => !this.tileset.has(getTileId(tile)));

    if (newTiles.length <= 0) {
      return Promise.resolve();
    }

    return this.addTiles(tileset);
  }

  isEveryTileLoaded() {
    return Array.from(this.tileLoadStatus.values()).every(isLoaded => isLoaded);
  }

  _waitForDataInTiles(pendingTiles) {
    return Promise.all(
      pendingTiles.map(pendingTile => {
        const tileId = getTileId(pendingTile);
        const tileData = pendingTile.data;
        const dataStillPending = Boolean(tileData.then);

        if (!dataStillPending) {
          this._featureManager.add(tileData);
          this.tileLoadStatus.set(tileId, true);
          return Promise.resolve();
        }

        return tileData.then(loadedData => {
          if (!loadedData) {
            this.tileLoadStatus.set(getTileId(pendingTile), true);
            return;
          }

          this._featureManager.add(loadedData);
          this.tileLoadStatus.set(getTileId(pendingTile), true);
        });
      })
    );
  }

  addLayer(layer) {
    this._layer = layer;
  }

  getLayer() {
    return this._layer;
  }

  hasLayer() {
    return Boolean(this._layer);
  }

  resetLayer() {
    // console.log('resetting layer in zoom level:', this.getZoomLevel())
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
