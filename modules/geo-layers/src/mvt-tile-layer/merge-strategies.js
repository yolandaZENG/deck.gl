import polygonUnion from '@turf/union';

const mergePoint = function mergePoint(originalGeometry) {
  return originalGeometry
};

const mergeLine = function mergeLine(originalGeometry) {
  return originalGeometry
};

const mergeMultiLineStringWithLine = function mergeMultiLineStringWithLine(multiLineString, lineString) {
  return {
    type: 'MultiLineString',
    coordinates: [
      ...multiLineString.coordinates,
      ...lineString.coordinates
    ]
  };
};

const mergeMultiLineStringWithMultiLineString = function mergeMultiLineStringWithMultiLineString(originalGeometry, newGeometry) {
  return {
    type: 'MultiLineString',
    coordinates: [
      ...originalGeometry.coordinates,
      ...newGeometry.coordinates
    ]
  };
};

const mergePolygonWithPolygon = function mergePolygonWithPolygon(originalGeometry, newGeometry) {
  return polygonUnion(originalGeometry, newGeometry).geometry;
};

const mergePolygonWithMultiPolygon = function mergePolygonWithMultiPolygon(originalGeometry, newGeometry) {
  let mergedGeometry = originalGeometry;

  for (const coords in newGeometry.coordinates) {
    mergedGeometry = polygonUnion(mergedGeometry, {
      coordinates: [newGeometry.coordinates[coords]]
    }).geometry;
  }

  return mergedGeometry;
};

const mergeStrategies = {
  Point: {
    Point: mergePoint
  },
  LineString: {
    LineString: mergeLine,
    MultiLineString: (lineString, multiLineString) => mergeMultiLineStringWithLine(multiLineString, lineString)
  },
  MultiLineString: {
    LineString: mergeMultiLineStringWithLine,
    MultiLineString: mergeMultiLineStringWithMultiLineString
  },
  Polygon: {
    Polygon: mergePolygonWithPolygon,
    MultiPolygon: mergePolygonWithMultiPolygon
  },
  MultiPolygon: {
    Polygon: mergePolygonWithMultiPolygon,
    MultiPolygon: mergePolygonWithPolygon
  }
};

export default mergeStrategies;
