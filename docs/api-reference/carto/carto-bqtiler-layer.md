import {CartoBQTilerLayerDemo} from 'website-components/doc-demos/geo-layers';

<CartoBQTilerLayerDemo />

# CartoBQTilerLayer

`CartoBQTilerLayer` is a layer to visualize large datasets (millions or billions rows) directly from [Google BigQuery](https://cloud.google.com/bigquery) without having to move data outside BigQuery.

You need first to genetare a tileset of your dataset in your BigQuery account using CARTO BigQuery Tiler. More info [here](https://carto.com/bigquery/beta/).

```js
import DeckGL from '@deck.gl/react';
import {CartoBQTilerLayer} from '@deck.gl/carto';


function App({viewState}) {
  const layer = new CartoBQTilerLayer({
          data: 'cartobq.maps.nyc_taxi_points_demo_id',
          getLineColor: [255, 255, 255],
          getFillColor: [238, 77, 90],
          pointRadiusMinPixels: 2,
          lineWidthMinPixels: 1
        });

  return <DeckGL viewState={viewState} layers={[layer]} />;
}
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/carto
```

```js
import {CartoBQTilerLayer} from '@deck.gl/carto';
new CartoBQTilerLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.2.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.2.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/carto@^8.2.0/dist.min.js"></script>
```

```js
new deck.carto.CartoBQTilerLayer({});
```


## Properties


##### `data` (String)

Required. Tileset id


## Source

[modules/carto/src/layers/carto-bqtiler-layer.js](https://github.com/visgl/deck.gl/tree/master/modules/carto/src/layers/carto-bqtiler-layer.js)
