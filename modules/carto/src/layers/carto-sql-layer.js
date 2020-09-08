import CartoLayer from './carto-layer';

const defaultProps = {
  // Either a sql query or a name of dataset
  data: null,
  // Credentials to connect with CARTO's platform
  credentials: null,
  // MVT buffersize in pixels,
  bufferSize: 1,
  // MapConfig Version
  version: '1.3.1',
  // Tile extent in tile coordinate space as defined by MVT specification.
  extent: 4096,
  // Simplify extent in tile coordinate space as defined by MVT specification.
  simplifyExtent: 4096
};

export default class CartoSQLLayer extends CartoLayer {
  constructor(props) {
    super({
      ...props,
      type: 'SQL'
    });
  }
}

CartoSQLLayer.layerName = 'CartoSQLLayer';
CartoSQLLayer.defaultProps = defaultProps;
