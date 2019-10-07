import mergeStrategies from '../merge-strategies';

export default class Feature {
  constructor(featureId, {geometry, properties}) {
    this._id = featureId;
    this._properties = {...properties};

    this._geometryType = geometry.type;
    this._geometryCoordinates = geometry.coordinates;
  }

  combine(featureId, feature) {
    if (this._id !== featureId) {
      throw new Error("Features don't have same id");
    }

    const {type, coordinates} = this._mergeGeometries(feature.geometry);
    this._geometryType = type;
    this._geometryCoordinates = coordinates;
  }

  _mergeGeometries(geometry) {
    const thisGeometry = {
      type: this._geometryType,
      coordinates: this._geometryCoordinates
    };

    return mergeStrategies[this._geometryType](thisGeometry, geometry);
  }

  toGeoJSON() {
    return {
      type: 'Feature',
      geometry: {
        type: this._geometryType,
        coordinates: this._geometryCoordinates
      },
      properties: {...this._properties}
    };
  }
}
