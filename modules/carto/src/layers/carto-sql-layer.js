import CartoLayer from './carto-layer';

const defaultProps = CartoLayer.defaultProps;
delete defaultProps.type;

export default class cartoSQLLayer extends CartoLayer { 
  constructor(props) {
    super({
      ...props,
      type: 'SQL'
    })
  }
}

cartoSQLLayer.layerName = 'cartoSQLLayer';
cartoSQLLayer.defaultProps = defaultProps;
