import polygonUnion from '@turf/union';

const mergePolygons = function mergePolygons(originalGeometry, newGeometry) {
  if (newGeometry.type === 'MultiPolygon') {
    let mergedGeometry = originalGeometry;

    for (const coords in newGeometry.coordinates) {
      mergedGeometry = polygonUnion(mergedGeometry, {
        coordinates: [newGeometry.coordinates[coords]]
      }).geometry;
    }

    return mergedGeometry;
  }

  return polygonUnion(originalGeometry, newGeometry).geometry;
};

const mergeMultiPolygon = function mergeMultiPolygon(originalGeometry, newGeometry) {
  if (newGeometry.type === 'MultiPolygon') {
    originalGeometry.coordinates.push(...newGeometry.coordinates);
    return originalGeometry;
  }

  let mergedGeometry = originalGeometry;
  for (const coords in newGeometry.coordinates) {
    mergedGeometry = polygonUnion(mergedGeometry, {coordinates: [newGeometry.coordinates[coords]]})
      .geometry;
  }
  return mergedGeometry;
};

const mergeStrategies = {
  Polygon: mergePolygons,
  MultiPolygon: mergeMultiPolygon
};

export default mergeStrategies;
