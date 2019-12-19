import polygonClipping from 'polygon-clipping';

const mergePoint = function mergePoint(originalGeometry) {
  return originalGeometry;
};

const mergeLine = function mergeLine(originalGeometry, newGeometry) {
  return {
    type: 'MultiLineString',
    coordinates: [originalGeometry.coordinates, newGeometry.coordinates]
  };
};

const mergeMultiLineStringWithLine = function mergeMultiLineStringWithLine(
  multiLineString,
  lineString
) {
  return {
    type: 'MultiLineString',
    coordinates: [...multiLineString.coordinates, lineString.coordinates]
  };
};

const mergeMultiLineStringWithMultiLineString = function mergeMultiLineStringWithMultiLineString(
  originalGeometry,
  newGeometry
) {
  return {
    type: 'MultiLineString',
    coordinates: [...originalGeometry.coordinates, ...newGeometry.coordinates]
  };
};

const mergePolygonWithPolygon = function mergePolygonWithPolygon(originalGeometry, newGeometry) {
  return {
    type: 'MultiPolygon',
    coordinates: polygonClipping.union(originalGeometry.coordinates, newGeometry.coordinates)
  };
};

const mergePolygonWithMultiPolygon = function mergePolygonWithMultiPolygon(
  originalGeometry,
  newGeometry
) {
  let mergedGeometry = [originalGeometry.coordinates];
  mergedGeometry = polygonClipping.union(mergedGeometry, newGeometry.coordinates);

  return {
    type: 'MultiPolygon',
    coordinates: mergedGeometry
  };
};

const mergeStrategies = {
  Point: {
    Point: mergePoint
  },
  LineString: {
    LineString: mergeLine,
    MultiLineString: (lineString, multiLineString) =>
      mergeMultiLineStringWithLine(multiLineString, lineString)
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
    Polygon: (multiPolygon, polygon) => mergePolygonWithMultiPolygon(polygon, multiPolygon),
    MultiPolygon: mergePolygonWithPolygon
  }
};

export default mergeStrategies;
