// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import test from 'tape-catch';
import {WebMercatorViewport} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {generateLayerTests, testLayerAsync} from '@deck.gl/test-utils';
import {TileLayer} from '@deck.gl/geo-layers';

test('TileLayer', async t => {
  const testCases = generateLayerTests({
    Layer: TileLayer,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });
  await testLayerAsync({Layer: TileLayer, testCases, onError: t.notOk});
  t.end();
});

test('TileLayer', async t => {
  let getTileDataCalled = 0;
  const getTileData = () => {
    getTileDataCalled++;
    return [];
  };

  const renderSubLayers = props => {
    return new ScatterplotLayer(props, {id: `${props.id}-fill`});
  };
  const renderNestedSubLayers = props => {
    return [
      new ScatterplotLayer(props, {id: `${props.id}-fill`, filled: true, stroked: false}),
      new ScatterplotLayer(props, {id: `${props.id}-stroke`, filled: false, stroked: true})
    ];
  };

  const testViewport1 = new WebMercatorViewport({
    width: 100,
    height: 100,
    longitude: 0,
    latitude: 60,
    zoom: 2
  });
  const testViewport2 = new WebMercatorViewport({
    width: 100,
    height: 100,
    longitude: -90,
    latitude: -60,
    zoom: 3
  });

  const testCases = [
    {
      props: {
        data: 'http://echo.jsontest.com/key/value'
      },
      onBeforeUpdate: () => {
        t.comment('Default getTileData');
      },
      onAfterUpdate: ({layer, subLayers}) => {
        if (!layer.isLoaded) {
          t.ok(subLayers.length < 2);
        } else {
          t.is(subLayers.length, 2, 'Rendered sublayers');
          t.ok(layer.isLoaded, 'Layer is loaded');
        }
      }
    },
    {
      props: {
        getTileData,
        renderSubLayers
      },
      onBeforeUpdate: () => {
        t.comment('Custom getTileData');
      },
      onAfterUpdate: ({layer, subLayers}) => {
        if (!layer.isLoaded) {
          t.ok(subLayers.length < 2);
        } else {
          t.is(subLayers.length, 2, 'Rendered sublayers');
          t.is(getTileDataCalled, 2, 'Fetched tile data');
          t.ok(layer.isLoaded, 'Layer is loaded');
          t.ok(subLayers.every(l => l.props.visible), 'Sublayers at z=2 are visible');
        }
      }
    },
    {
      viewport: testViewport2,
      onAfterUpdate: ({layer, subLayers}) => {
        if (layer.isLoaded) {
          t.is(subLayers.length, 4, 'Rendered new sublayers');
          t.is(getTileDataCalled, 4, 'Fetched tile data');
          t.ok(
            subLayers.filter(l => l.props.tile.z === 3).every(l => l.props.visible),
            'Sublayers at z=3 are visible'
          );
        }
      }
    },
    {
      viewport: testViewport1,
      onAfterUpdate: ({layer, subLayers}) => {
        if (layer.isLoaded) {
          t.is(subLayers.length, 4, 'Rendered cached sublayers');
          t.is(getTileDataCalled, 4, 'Used cached data');
          t.ok(
            subLayers.filter(l => l.props.tile.z === 3).every(l => !l.props.visible),
            'Sublayers at z=3 are hidden'
          );
        }
      }
    },
    {
      updateProps: {
        renderSubLayers: renderNestedSubLayers
      },
      onAfterUpdate: ({subLayers}) => {
        t.is(subLayers.length, 4, 'Should rendered cached sublayers without prop change');
      }
    },
    {
      updateProps: {
        minWidthPixels: 1
      },
      onAfterUpdate: ({subLayers}) => {
        t.is(subLayers.length, 8, 'Invalidated cached sublayers with prop change');
      }
    },
    {
      updateProps: {
        updateTriggers: {
          getTileData: 1
        }
      },
      onAfterUpdate: ({layer, subLayers}) => {
        if (layer.isLoaded) {
          t.is(getTileDataCalled, 6, 'Refetched tile data');
          t.is(subLayers.length, 4, 'Invalidated cached sublayers with prop change');
        }
      }
    }
  ];
  await testLayerAsync({Layer: TileLayer, viewport: testViewport1, testCases, onError: t.notOk});
  t.end();
});

test('TileLayer#MapView:repeat', async t => {
  const renderSubLayers = props => {
    return new ScatterplotLayer(props);
  };

  const testViewport = new WebMercatorViewport({
    width: 1200,
    height: 400,
    longitude: 0,
    latitude: 0,
    zoom: 1,
    repeat: true
  });

  t.is(testViewport.subViewports.length, 3, 'Viewport has more than one sub viewports');

  const testCases = [
    {
      props: {
        data: 'http://echo.jsontest.com/key/value',
        renderSubLayers
      },
      onAfterUpdate: ({layer, subLayers}) => {
        if (layer.isLoaded) {
          t.is(subLayers.filter(l => l.props.visible).length, 4, 'Should contain 4 visible tiles');
        }
      }
    }
  ];

  await testLayerAsync({Layer: TileLayer, viewport: testViewport, testCases, onError: t.notOk});

  t.end();
});

test.only('TileLayer#Tilejson', async t => {
  const testViewport = new WebMercatorViewport({
    width: 100,
    height: 100,
    longitude: 0,
    latitude: 60,
    zoom: 2
  });

  const renderSubLayers = props => {
    return new ScatterplotLayer(props, {id: `${props.id}-fill`});
  };

  const getTileData = () => {
    return [];
  };

  const tilejson = {
    tilejson: '2.2.0',
    name: 'OpenStreetMap',
    description: 'A free editable map of the whole world.',
    version: '1.0.0',
    attribution: '(c) OpenStreetMap contributors, CC-BY-SA',
    scheme: 'xyz',
    tiles: [
      'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
    ],
    minzoom: 0,
    maxzoom: 18,
    bounds: [-180, -85, 180, 85]
  };

  // polyfill/hijack fetch
  /* global global, window */
  const _global = typeof global !== 'undefined' ? global : window;
  const fetch = _global.fetch;

  _global.fetch = url => {
    return Promise.resolve(JSON.stringify(tilejson));
  };

  const testCases = [
    {
      props: {
        tilejson,
        getTileData,
        renderSubLayers
      },
      onBeforeUpdate: () => {
        t.comment('Default getTileData');
      },
      onAfterUpdate: ({layer, subLayers}) => {
        if (!layer.isLoaded) {
          t.ok(subLayers.length < 2);
        } else {
          t.is(subLayers.length, 2, 'Rendered sublayers');
          t.is(layer.state.data.length, 3, 'Data is loaded');
          t.is(layer.state.tileset.minZoom, tilejson.minZoom, 'Min zoom layer is correct');
          t.is(layer.state.tileset.minZoom, tilejson.maxZoom, 'Max zoom layer is correct');
          t.ok(layer.isLoaded, 'Layer is loaded');
        }
      }
    },
    {
      props: {
        tilejson: 'http://echo.jsontest.com/key/value',
        getTileData,
        renderSubLayers
      },
      onBeforeUpdate: () => {
        t.comment('Default getTileData');
      },
      onAfterUpdate: ({layer, subLayers}) => {
        if (!layer.isLoaded) {
          t.ok(subLayers.length < 2);
        } else {
          t.is(subLayers.length, 2, 'Rendered sublayers');
          t.is(layer.state.data.length, 3, 'Data is loaded');
          t.is(layer.state.tileset.minZoom, tilejson.minZoom, 'Min zoom layer is correct');
          t.is(layer.state.tileset.minZoom, tilejson.maxZoom, 'Max zoom layer is correct');
          t.ok(layer.isLoaded, 'Layer is loaded');
        }
      }
    }
  ];
  await testLayerAsync({Layer: TileLayer, viewport: testViewport, testCases, onError: t.notOk});
  t.end();

  // restore fetcch
  _global.fetch = fetch;
});
