import polygonUnion from '@turf/union';

export default class Feature {
  constructor({ type, geometry, properties }) {
    // TODO: Geometry ID should not be cartodb_id
    this._id = properties.cartodb_id;
    this._properties = {...properties};

    this._geometryType = geometry.type;
    this._geometryCoordinates = [...geometry.coordinates];
  }

  combine(feature) {
    // TODO: Implement strategies for lines to merge
    if (this._id !== feature.properties.cartodb_id) {
      throw new Error('Features don\'t have same id');
    }

    this._geometryCoordinates = this._mergeCoordinates(feature.geometry.coordinates);
  }

  _mergeCoordinates(polygonCoordinates) {
    return polygonUnion(
      { coordinates: this._geometryCoordinates },
      { coordinates: polygonCoordinates }
    ).geometry.coordinates;
  }

  toGeoJSON() {
    return {
      type: 'Feature',
      geometry: {
        type: this._geometryType,
        coordinates: this._geometryCoordinates
      },
      properties: { ...this._properties }
    }
  }
}
