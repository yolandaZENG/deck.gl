import CartoLayer from './carto-layer';

const defaultProps = {
  data: null,
  credentials: null,
  // MVT buffersize in pixels,
  bufferSize: 1,
  // MapConfig Version
  version: '1.3.1',
  // Tile extent in tile coordinate space as defined by MVT specification.
  extent: 4096,
  // Simplify extent
  simplifyExtent: 4096,
};

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
