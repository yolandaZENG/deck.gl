import CartoLayer from './carto-layer';

const defaultProps = {
  data: null,
  credentials: null
};

export default class CartoBQTilerLayer extends CartoLayer { 
  constructor(props) {
    super({
      ...props,
      type: 'BigQuery'
    })
  }
}

CartoBQTilerLayer.layerName = 'CartoBQTilerLayer';
CartoBQTilerLayer.defaultProps = defaultProps;
