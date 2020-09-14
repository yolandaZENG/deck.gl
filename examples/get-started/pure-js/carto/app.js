import mapboxgl from 'mapbox-gl';
import {Deck} from '@deck.gl/core';
import {CartoSQLLayer, CartoBQTilerLayer, setDefaultCredentials} from '@deck.gl/carto';

const INITIAL_VIEW_STATE = {
  latitude: 0,
  longitude: 0,
  zoom: 1
};

setDefaultCredentials({
  username: 'public',
  apiKey: 'default_public'
});

// Add Mapbox GL for the basemap. It's not a requirement if you don't need a basemap.
const map = new mapboxgl.Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  interactive: false,
  center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
  zoom: INITIAL_VIEW_STATE.zoom
});

const sqlLayer = new CartoSQLLayer({
  data: 'SELECT * FROM ne_10m_airports',
  pointRadiusMinPixels: 4,
  getLineColor: [0, 0, 0, 0.75],
  getFillColor: [238, 77, 90],
  lineWidthMinPixels: 1
});

const bqTileLayer = new CartoBQTilerLayer({
  data: 'cartobq.maps.osm_buildings',
  getLineColor: [255, 0, 0, 0.75],
  getFillColor: [238, 77, 90]
});

export const deck = new Deck({
  canvas: 'deck-canvas',
  width: '100%',
  height: '100%',
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  onViewStateChange: ({viewState}) => {
    // Synchronize Deck.gl view with Mapbox
    map.jumpTo({
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      bearing: viewState.bearing,
      pitch: viewState.pitch
    });
  },
  layers: [sqlLayer, bqTileLayer]
});

// an exported render func?
