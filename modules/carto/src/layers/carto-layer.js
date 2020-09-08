import {CompositeLayer} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';
import {getMapTileJSON} from '../api/maps-api-client';

const BQ_TILEJSON_ENDPOINT =
  'https://thingproxy.freeboard.io/fetch/https://bq1.cartocdn.com/tilesjson';

const defaultProps = {
  data: null,
  credentials: null,
  // Valid types are SQL or 'BigQuery'
  type: null
};

export default class CartoLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      tilejson: null
    };
  }

  updateState({changeFlags}) {
    const {data} = this.props;
    if (changeFlags.dataChanged && data) {
      this._updateTileJSON();
    }
  }

  async _updateTileJSON() {
    const {type} = this.props;
    let tilejson;

    switch (type) {
      case 'SQL':
        tilejson = await getMapTileJSON(this.props);
        break;

      case 'BigQuery':
        /* global fetch */
        /* eslint no-undef: "error" */
        const response = await fetch(`${BQ_TILEJSON_ENDPOINT}?t=${this.props.data}`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        });
        tilejson = await response.json();
        break;

      default:
        throw new Error(`Unsupported type ${type}`);
    }

    this.setState({tilejson});
  }

  renderLayers() {
    if (!this.state.tilejson) return [];

    const props = {
      ...this.getSubLayerProps(this.props),
      data: this.state.tilejson.tiles
    };

    return new MVTLayer(props);
  }
}

CartoLayer.layerName = 'CartoLayer';
CartoLayer.defaultProps = defaultProps;
