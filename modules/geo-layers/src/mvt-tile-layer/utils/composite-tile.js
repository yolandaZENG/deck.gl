import FeatureManager from './feature-manager';

export default class CompositeTile {
  constructor({tileset = [], zoomLevel, uniquePropertyName}) {
    this.tileset = tileset;
    this.zoomLevel = zoomLevel;

    this._featureManager = new FeatureManager({
      uniquePropertyName
    });

    this.waitForDataInTiles(this.tileset);
  }

  getData() {
    if (this._featureManager.hasFeatures()) {
      return this._featureManager.getData();
    }

    const visibleTiles = this.tileset.filter(tile => tile.isVisible);
    return Promise.all(visibleTiles.map(tile => tile.data)).then(allData => allData.flat());
  }

  getZoomLevel() {
    return this.zoomLevel;
  }

  waitForDataInTiles(pendingTiles) {
    pendingTiles.forEach(pendingTile => {
      const tileData = pendingTile.data;
      const dataStillPending = Boolean(tileData.then);

      if (!dataStillPending) {
        this._featureManager.add(tileData);
        return;
      }

      tileData.then(loadedData => {
        if (!loadedData) return;

        this._featureManager.add(loadedData);
      });
    });
  }
}
