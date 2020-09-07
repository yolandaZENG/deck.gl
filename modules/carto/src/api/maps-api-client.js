import {getDefaultCredentials} from '../auth';

const DEFAULT_USER_COMPONENT_IN_URL = '{user}';

export async function getMapTileJSON(props) {
  const {
    data, 
    credentials, 
    bufferSize,
    version,
    extent,
    simplifyExtent
   } = props;

  const isSQL = data.search(' ') > -1;
  const sql = isSQL ? data : `SELECT * FROM ${data}`;

  const mapConfig = {
    version,
    buffersize: {mvt: bufferSize},
    layers: [
      {
        type: 'mapnik',
        options: {
          sql,
          vector_extent: extent,
          vector_simplify_extent: simplifyExtent
        }
      }
    ]
  };

  // create request url
  const creds = {...getDefaultCredentials(), ...credentials};
  const encodedApiKey = encodeParameter('api_key', creds.apiKey);
  const encodedClient = encodeParameter('client', 'deck-gl-carto');
  const parameters = [encodedApiKey, encodedClient];
  const url = `${serverURL(creds)}api/v1/map?${parameters.join('&')}`;

  // Compose request
  const opts = {
    method: 'POST',
    headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
    body: JSON.stringify(mapConfig)
  };

  /* global fetch */
  /* eslint no-undef: "error" */
  let response = await fetch(url, opts);
  response = await response.json();
  return response.metadata.tilejson.vector;
}

function serverURL(credentials) {
  let url = credentials.serverUrlTemplate.replace(
    DEFAULT_USER_COMPONENT_IN_URL,
    credentials.username
  );

  if (!url.endsWith('/')) {
    url += '/';
  }

  return url;
}

function encodeParameter(name, value) {
  return `${name}=${encodeURIComponent(value)}`;
}
