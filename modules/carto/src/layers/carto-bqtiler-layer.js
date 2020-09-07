import CartoLayer from './carto-layer';

const defaultProps = CartoLayer.defaultProps;
delete defaultProps.type;

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
