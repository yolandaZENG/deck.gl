import {CompositeLayer} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';
import {instantiateMap, getTilesFromInstance} from '../api/maps-api-client';

const defaultProps = {
  data: null,
  credentials: null
};

export default class CartoSQLLayer extends CompositeLayer {
  updateState({changeFlags}) {
    const {data} = this.props;
    if (changeFlags.dataChanged && data) {
      this._instantiateMap();
    }
  }

  async _instantiateMap() {
    const {data} = this.props;
    const isSQL = data.search(' ') > -1;
    const sql = isSQL ? data : `SELECT * FROM ${data}`;

    const credentials = {...defaultProps.credentials, ...this.props.credentials};
    const instance = await instantiateMap(sql, credentials);
    this.setState({mapInstance: instance});
  }

  renderLayers() {
    if (!this.state.mapInstance) return [];

    const props = {
      ...this.props,
      data: getTilesFromInstance(this.state.mapInstance)
    };

    return new MVTLayer(props);
  }
}

CartoSQLLayer.layerName = 'CartoSQLLayer';
CartoSQLLayer.defaultProps = defaultProps;
