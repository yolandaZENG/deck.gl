import Feature from './feature';

export default class FeatureManager {
  constructor({uniquePropertyName}) {
    this._features = new Map();
    this._uniquePropertyName = uniquePropertyName;
  }

  hasFeatures() {
    return Boolean(this._features.size);
  }

  add(geojsonFeatures) {
    geojsonFeatures.forEach(geojsonFeature => {
      const featureId = geojsonFeature.properties[this._uniquePropertyName];

      if (this._features.has(featureId)) {
        this._features.get(featureId).combine(featureId, geojsonFeature);
        return;
      }

      this._features.set(featureId, new Feature(featureId, geojsonFeature));
    });
  }

  getData() {
    return Array.from(this._features.values()).map(feature => feature.toGeoJSON());
  }
}
