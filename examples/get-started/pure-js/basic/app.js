import {Deck} from '@deck.gl/core';
import {GeoJsonLayer, ArcLayer, BitmapLayer} from '@deck.gl/layers';
import {TileLayer, MVTLayer} from '@deck.gl/geo-layers';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'; //eslint-disable-line
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const INITIAL_VIEW_STATE = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 4,
  bearing: 0,
  pitch: 30
};

export const deck = new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  layers: [
    // new GeoJsonLayer({
    //   id: 'base-map',
    //   data: COUNTRIES,
    //   // Styles
    //   stroked: true,
    //   filled: true,
    //   lineWidthMinPixels: 2,
    //   opacity: 0.4,
    //   getLineColor: [60, 60, 60],
    //   getFillColor: [200, 200, 200]
    // }),
    // new GeoJsonLayer({
    //   id: 'airports',
    //   data: AIR_PORTS,
    //   // Styles
    //   filled: true,
    //   pointRadiusMinPixels: 2,
    //   pointRadiusScale: 2000,
    //   getRadius: f => 11 - f.properties.scalerank,
    //   getFillColor: [200, 0, 80, 180],
    //   // Interactive props
    //   pickable: true,
    //   autoHighlight: true,
    //   onClick: info =>
    //     // eslint-disable-next-line
    //     info.object && alert(`${info.object.properties.name} (${info.object.properties.abbrev})`)
    // }),
    // new ArcLayer({
    //   id: 'arcs',
    //   data: AIR_PORTS,
    //   dataTransform: d => d.features.filter(f => f.properties.scalerank < 4),
    //   // Styles
    //   getSourcePosition: f => [-0.4531566, 51.4709959], // London
    //   getTargetPosition: f => f.geometry.coordinates,
    //   getSourceColor: [0, 128, 200],
    //   getTargetColor: [200, 0, 80],
    //   getWidth: 1
    // })
  //   new TileLayer({
  //   // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
  //   // data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
  //   tilejson: {
  //     "tilejson": "1.0.0",
  //   "name": "OpenStreetMap",
  //   "description": "A free editable map of the whole world.",
  //   "version": "1.0.0",
  //   "attribution": "(c) OpenStreetMap contributors, CC-BY-SA",
  //   "scheme": "xyz",
  //   "tiles": [
  //       "http://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
  //       "http://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
  //       "http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
  //   ],
  //   "minzoom": 0,
  //   "maxzoom": 18,
  //   "bounds": [ -180, -85, 180, 85 ]
  //   },
  //
  //   minZoom: 0,
  //   maxZoom: 19,
  //   tileSize: 256,
  //
  //   renderSubLayers: props => {
  //     const {
  //       bbox: {west, south, east, north}
  //     } = props.tile;
  //
  //     return new BitmapLayer(props, {
  //       data: null,
  //       image: props.data,
  //       bounds: [west, south, east, north]
  //     });
  //   }
  // })
    new MVTLayer({
      lineWidthMinPixels: 1,
      // data: ["https://bq1.cartocdn.com/tile?y={y}&x={x}&z={z}&p=0_14_0_16383_1077_16347_4000_1&t=cartobq.maps.osm_buildings","https://bq2.cartocdn.com/tile?y={y}&x={x}&z={z}&p=0_14_0_16383_1077_16347_4000_1&t=cartobq.maps.osm_buildings","https://bq3.cartocdn.com/tile?y={y}&x={x}&z={z}&p=0_14_0_16383_1077_16347_4000_1&t=cartobq.maps.osm_buildings","https://bq4.cartocdn.com/tile?y={y}&x={x}&z={z}&p=0_14_0_16383_1077_16347_4000_1&t=cartobq.maps.osm_buildings"]
      tilejson: 'https://us-central1-cartobq.cloudfunctions.net/tilejson?t=cartobq.maps.osm_buildings'
    //   tilejson: {
    //     "tilejson": "2.0.0",
    // "name": "`cartobq.maps.osm_buildings`",
    // "description": "",
    // "attribution": "&copy; <a href=\"https://carto.com/bigquery/beta/\" target=\"_blank\" rel=\"noopener\">Generated with CARTO</a>",
    // "tiles": ["https://bq1.cartocdn.com/tile?y={y}&x={x}&z={z}&p=0_14_0_16383_1077_16347_4000_1&t=cartobq.maps.osm_buildings","https://bq2.cartocdn.com/tile?y={y}&x={x}&z={z}&p=0_14_0_16383_1077_16347_4000_1&t=cartobq.maps.osm_buildings","https://bq3.cartocdn.com/tile?y={y}&x={x}&z={z}&p=0_14_0_16383_1077_16347_4000_1&t=cartobq.maps.osm_buildings","https://bq4.cartocdn.com/tile?y={y}&x={x}&z={z}&p=0_14_0_16383_1077_16347_4000_1&t=cartobq.maps.osm_buildings"],
    // "minzoom": 0,
    // "maxzoom": 14,
    // "bounds": [-179.99806144943742,-84.97955374350572,179.99355632475425,82.52576210835706],
    // "center": [21.36215321071737,29.96650884875381,3],
    // "vector_layers": [{"id":"default","minzoom":0,"maxzoom":14,"fields":{"aggregated_total":"Number"},"geometry_type":"Point"}],
    // "tilestats": {}
    //   }
    })
  ]
});

// For automated test cases
/* global document */
document.body.style.margin = '0px';
