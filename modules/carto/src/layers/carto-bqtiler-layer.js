import {CompositeLayer} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';

const BASE_URL = 'https://thingproxy.freeboard.io/fetch/https://bq1.cartocdn.com/tilesjson';

const defaultProps = {
  data: null
};

export default class CartoBQTilerLayer extends CompositeLayer {
  updateState({changeFlags}) {
    const {data} = this.props;
    if (changeFlags.dataChanged && data) {
      this._getTileJSON();
    }
  }

  async _getTileJSON() {
    const {data} = this.props;

    /* global fetch */
    /* eslint no-undef: "error" */
    const response = await fetch(`${BASE_URL}?t=${data}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });
    const r = await response.json();
    this.setState({tiles: r.tiles, maxZoom: r.maxzoom, minZoom: r.minzoom});
  }

  renderLayers() {
    if (!this.state.tiles) return [];

    const {tiles, maxZoom, minZoom} = this.state;
    const props = {
      ...this.props,
      id: this.props.data,
      data: tiles,
      maxZoom,
      minZoom
    };
    return new MVTLayer(props);
  }
}

CartoBQTilerLayer.layerName = 'CartoBQTilerLayer';
CartoBQTilerLayer.defaultProps = defaultProps;
