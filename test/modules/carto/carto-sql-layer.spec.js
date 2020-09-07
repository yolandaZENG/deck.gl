import test from 'tape-catch';

import {testLayer, generateLayerTests} from '@deck.gl/test-utils';

import {CartoSQLLayer} from '@deck.gl/carto';

// import { MVTLayer } from '@deck.gl/geo-layers';
// import * as mapsResponse from './mocks/maps.number.json';

test('CartoSQLLayer', t => {
  const testCases = generateLayerTests({
    Layer: CartoSQLLayer,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });

  testLayer({Layer: CartoSQLLayer, testCases, onError: t.notOk});
  t.end();
});

test('CartoSQLLayer#_instantiateMap', t => {
  const testCases = [
    {
      spies: ['_instantiateMap'],
      onAfterUpdate({spies}) {
        t.notOk(spies._instantiateMap.called, 'no data, no map instantiation');
        t.ok(spies._instantiateMap.callCount === 0);
      }
    },
    {
      updateProps: {data: 'table_name'},
      spies: ['_instantiateMap'],
      onAfterUpdate({spies}) {
        t.ok(spies._instantiateMap.called, 'initial data sets map instantiation');
        t.ok(spies._instantiateMap.callCount === 1);
      }
    },
    {
      updateProps: {data: 'table_name'},
      spies: ['_instantiateMap'],
      onAfterUpdate({spies}) {
        t.ok(
          spies._instantiateMap.callCount === 0,
          'same data does not trigger a new map instantiation'
        );
      }
    },
    {
      updateProps: {data: 'ANOTHER_TABLE'},
      spies: ['_instantiateMap'],
      onAfterUpdate({spies}) {
        t.ok(
          spies._instantiateMap.callCount === 1,
          'different data triggers a new map instantiation'
        );
      }
    }
  ];

  testLayer({Layer: CartoSQLLayer, testCases, onError: t.notOk});
  t.end();
});

// failing on brower
// test('CartoSQLLayer#renderSubLayer', t => {
//   // polyfill/hijack fetch
//   /* global global, window */
//   const _global = typeof global !== 'undefined' ? global : window;
//   const fetch = _global.fetch;

//   _global.fetch = _url =>
//     Promise.resolve({
//       json: () => mapsResponse
//     });

//   const cartoSQLLayer = new CartoSQLLayer({
//     data: 'table_name'
//   });

//   testInitializeLayer({layer: cartoSQLLayer, onError: t.notOk});

//   // Wait for fetch to resolve
//   _global.setTimeout(() => {
//     const subLayers = cartoSQLLayer.renderLayers();

//     const {mapInstance} = cartoSQLLayer.state;
//     t.ok(mapInstance, 'should have a map instance');

//     t.ok(subLayers[0] instanceof MVTLayer, 'Sublayer MVTLayer created');
//     t.ok(subLayers[0].props.data.length > 0, 'Sublayer MVTLayer has tileset url templates');

//     // t.deepEqual(
//     //   subLayers[0].props.data,
//     //   [
//     //     {
//     //       position: [-122.45, 37.8],
//     //       text: 'Hello World'
//     //     }
//     //   ],
//     //   'JSON parsed successfully'
//     // );
//     // t.deepEqual(
//     //   subLayers[1].props.data,
//     //   [[-122.45, 37.78, 'Hello World']],
//     //   'CSV parsed successfully'
//     // );

//     t.end();
//   }, 0);

//   // restore fetcch
//   _global.fetch = fetch;

//   // const testCases = [
//   //   {
//   //     props: {data: 'table_name'},
//   //     onAfterUpdate: ({layer, subLayer}) => {
//   //       const {mapInstance} = layer.state;

//   //       t.ok(mapInstance, 'should have a map instance');
//   //       t.ok(subLayer instanceof MVTLayer, 'Sublayer MVTLayer created');
//   //       t.ok(subLayer.props.data.length > 0, 'Sublayer MVTLayer has tileset url templates');
//   //     }
//   //   }
//   // ];

//   // testLayer({
//   //   Layer: TestCartoSQLLayer,
//   //   testCases,
//   //   onError: t.notOk
//   // });

//   // t.end();
// });
