import {Deck} from '@deck.gl/core';
import {CartoSQLLayer, CartoBQTilerLayer} from '@deck.gl/carto';
import mapboxgl from 'mapbox-gl';

const INITIAL_VIEW_STATE = {
  latitude: 0,
  longitude: 0,
  zoom: 1
};

const map = new mapboxgl.Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  interactive: false,
  center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
  zoom: INITIAL_VIEW_STATE.zoom
});

const styleProperties = {
  getLineColor: [0, 0, 0, 0.75],
  getFillColor: [238, 77, 90],
  lineWidthMinPixels: 1
}

export const deck = new Deck({
  canvas: 'deck-canvas',
  width: '100%',
  height: '100%',
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  onViewStateChange: ({viewState}) => {
    map.jumpTo({
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      bearing: viewState.bearing,
      pitch: viewState.pitch
    });
  },
  layers: [
    new CartoSQLLayer({
      data: 'SELECT * FROM world_population_2015',
      pointRadiusMinPixels: 6,
      ...styleProperties
    }),
    new CartoBQTilerLayer({
      data: 'cartobq.maps.nyc_taxi_points_demo_id',
      pointRadiusMinPixels: 2,
      ...styleProperties,
    })
  ]
});
