import FeatureManager from './FeatureManager';
export default class CompositeTile {
  constructor({tileset = [], zoomLevel}) {
    this.tileset = tileset;
    this.zoomLevel = zoomLevel;

    this._featureManager = new FeatureManager('cartodb_id');

    this.waitForDataInTiles(this.tileset);
  }

  getData() {
    if (this._featureManager.hasFeatures()) {
      return this._featureManager.getData();
    }

    return Promise.all(this.tileset.map(tile => tile.data)).then(() => this._featureManager.getData());
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
        this._featureManager.add(loadedData);
      });
    });
  }
}
