import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';

export class MVTWorker {
  processEvent(event) {
    const eventData = event.data;

    return this.getGeoJSONFromTile(eventData)
        .then(
          geoJSONData => ({
            url: eventData.tileURL,
            features: geoJSONData
          })
        );
  }

  getGeoJSONFromTile({ tileURL, tileProperties }) {
    return this.requestMVTTile(tileURL)
               .then(response => this.convertMVTToGeoJSON(response, tileProperties));
  }

  requestMVTTile(tileURL) {
    return fetch(tileURL);
  }

  async convertMVTToGeoJSON(response, tileProperties) {
    const arrayBuffer = await response.arrayBuffer();

    if (!response || arrayBuffer.byteLength === 0) {
      return [];
    }

    const tile = new VectorTile(new Protobuf(arrayBuffer));
    const features = [];

    for (const layerName in tile.layers) {
      const vectorTileLayer = tile.layers[layerName];

      for (let i = 0; i < vectorTileLayer.length; i++) {
        const vectorTileFeature = vectorTileLayer.feature(i);
        const feature = vectorTileFeature.toGeoJSON(tileProperties.x, tileProperties.y, tileProperties.z);

        features.push(feature);
      }
    }

    return features;
  }
}
