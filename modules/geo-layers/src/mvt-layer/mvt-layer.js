/* global setTimeout clearTimeout */

import {Matrix4} from 'math.gl';
import {MVTLoader} from '@loaders.gl/mvt';
import {load} from '@loaders.gl/core';
import {COORDINATE_SYSTEM} from '@deck.gl/core';

import TileLayer from '../tile-layer/tile-layer';
import {getURLFromTemplate} from '../tile-layer/utils';
import ClipExtension from './clip-extension';

const WORLD_SIZE = 512;
const VIEWPORT_CHANGE_DEBOUNCE = 500; // milliseconds

const defaultProps = {
  uniqueIdProperty: {type: 'string', value: ''},
  highlightedFeatureId: null
};

export default class MVTLayer extends TileLayer {
  getTileData(tile) {
    const url = getURLFromTemplate(this.props.data, tile);
    if (!url) {
      return Promise.reject('Invalid URL');
    }
    return load(url, MVTLoader, this.getLoadOptions());
  }

  renderSubLayers(props) {
    const {tile} = props;

    const modelMatrix = new Matrix4().scale(this._getModelMatrixScale(tile));

    props.autoHighlight = false;
    props.modelMatrix = modelMatrix;
    props.coordinateOrigin = this._getCoordinateOrigin(tile);
    props.coordinateSystem = COORDINATE_SYSTEM.CARTESIAN;
    props.extensions = [...(props.extensions || []), new ClipExtension()];

    return super.renderSubLayers(props);
  }

  onHover(info, pickingEvent) {
    const {uniqueIdProperty, autoHighlight} = this.props;

    if (autoHighlight) {
      const {hoveredFeatureId} = this.state;
      const hoveredFeature = info.object;
      let newHoveredFeatureId;

      if (hoveredFeature) {
        newHoveredFeatureId = getFeatureUniqueId(hoveredFeature, uniqueIdProperty);
      }

      if (hoveredFeatureId !== newHoveredFeatureId) {
        this.setState({hoveredFeatureId: newHoveredFeatureId});
      }
    }

    return super.onHover(info, pickingEvent);
  }

  getHighlightedObjectIndex(tile) {
    const {hoveredFeatureId} = this.state;
    const {uniqueIdProperty, highlightedFeatureId} = this.props;
    const {data} = tile;

    const isFeatureIdPresent =
      isFeatureIdDefined(hoveredFeatureId) || isFeatureIdDefined(highlightedFeatureId);

    if (!isFeatureIdPresent || !Array.isArray(data)) {
      return -1;
    }

    const featureIdToHighlight = isFeatureIdDefined(highlightedFeatureId)
      ? highlightedFeatureId
      : hoveredFeatureId;

    return data.findIndex(
      feature => getFeatureUniqueId(feature, uniqueIdProperty) === featureIdToHighlight
    );
  }

  updateState({props, oldProps, context, changeFlags}) {
    super.updateState({props, oldProps, context, changeFlags});
    this._debouncedGetViewportFeatures();
  }

  _getModelMatrixScale(tile) {
    const worldScale = Math.pow(2, tile.z);
    const xScale = WORLD_SIZE / worldScale;
    const yScale = -xScale;

    return [xScale, yScale, 1];
  }

  _getCoordinateOrigin(tile) {
    const worldScale = Math.pow(2, tile.z);
    const xOffset = (WORLD_SIZE * tile.x) / worldScale;
    const yOffset = WORLD_SIZE * (1 - tile.y / worldScale);

    return [xOffset, yOffset, 0];
  }

  _debouncedGetViewportFeatures() {
    const {onViewportFeatures} = this.props;

    if (onViewportFeatures) {
      let {viewportChangeTimer} = this.state;
      clearTimeout(viewportChangeTimer);

      viewportChangeTimer = setTimeout(() => {
        const {tileset} = this.state;
        const {isLoaded} = tileset;

        if (isLoaded) {
          this._getViewportFeatures();
        }
      }, VIEWPORT_CHANGE_DEBOUNCE);

      this.setState({viewportChangeTimer});
    }
  }

  async _getViewportFeatures() {
    const {tileset} = this.state;
    const {onViewportFeatures} = this.props;
    const featureCache = new Set();
    const currentFrustumPlanes = this.context.viewport.getFrustumPlanes();
    let viewportFeatures = [];

    await tileset.selectedTiles.forEach(async tile => {
      const features = (await tile.data) || [];
      const transformationMatrix = new Matrix4()
        .translate(this._getCoordinateOrigin(tile))
        .scale(this._getModelMatrixScale(tile));

      viewportFeatures = viewportFeatures.concat(
        features.filter(f => {
          const featureId = getFeatureUniqueId(f, this.props.uniqueIdProperty);
          if (
            !featureCache.has(featureId) &&
            this._checkIfCoordinatesIsInsideFrustum(
              transformationMatrix,
              currentFrustumPlanes,
              f.geometry.coordinates
            )
          ) {
            featureCache.add(featureId);
            return true;
          }
          return false;
        })
      );
    });

    onViewportFeatures(viewportFeatures);
  }

  _checkIfCoordinatesIsInsideFrustum(matrix, frustumPlanes, coordinates) {
    if (Array.isArray(coordinates) && coordinates.length && typeof coordinates[0] === 'number') {
      return this._coordinateInPlanes(frustumPlanes, matrix.transform(coordinates).concat(0));
    }

    return coordinates.some(c => {
      if (Array.isArray(c) && Array.isArray(c[0])) {
        return this._checkIfCoordinatesIsInsideFrustum(matrix, frustumPlanes, c);
      }
      return this._coordinateInPlanes(frustumPlanes, matrix.transform(c).concat(0));
    });
  }

  _coordinateInPlanes(frustumPlanes, coordinates) {
    return Object.keys(frustumPlanes).every(plane => {
      const {normal, distance} = frustumPlanes[plane];
      return normal.dot(coordinates) < distance;
    });
  }

  finalizeState() {
    super.finalizeState();
    const {viewportChangeTimer} = this.state;
    /* eslint-disable no-unused-expressions */
    viewportChangeTimer && clearTimeout(viewportChangeTimer);
    /* eslint-enable no-unused-expressions */
  }
}

function getFeatureUniqueId(feature, uniqueIdProperty) {
  if (uniqueIdProperty) {
    return feature.properties[uniqueIdProperty];
  }

  if ('id' in feature) {
    return feature.id;
  }

  return -1;
}

function isFeatureIdDefined(value) {
  return value !== undefined && value !== null && value !== '';
}

MVTLayer.layerName = 'MVTLayer';
MVTLayer.defaultProps = defaultProps;
