import type { LayerSpecification } from 'maplibre-gl';
import type { SoilType } from '../types';

/**
 * StyleEngine Service
 * 
 * Provides MapLibre GL styling specifications for cable routes and markers
 * with data-driven styling based on soil type properties.
 */

/**
 * Maps soil type to corresponding color
 * 
 * @param soilType - The soil type classification
 * @returns Hex color code for the soil type
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export function getSoilTypeColor(soilType: SoilType | string): string {
  const colorMap: Record<string, string> = {
    'Pasir': '#FFFF00',        // Yellow - Requirement 2.1
    'Tanah Liat': '#8B4513',   // Brown - Requirement 2.2
    'Batuan': '#808080',       // Gray - Requirement 2.3
  };

  // Return mapped color or default black for invalid/missing types - Requirement 2.4
  return colorMap[soilType] || '#000000';
}

/**
 * Returns MapLibre layer specification for cable routes with data-driven styling
 * 
 * @returns LayerSpecification for cable line layer
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
export function getCableLineStyle(): LayerSpecification {
  return {
    id: 'cable-routes',
    type: 'line',
    source: 'cables',
    paint: {
      // Data-driven styling expression - Requirement 2.5
      'line-color': [
        'match',
        ['get', 'soilType'],
        'Pasir', '#FFFF00',        // Yellow - Requirement 2.1
        'Tanah Liat', '#8B4513',   // Brown - Requirement 2.2
        'Batuan', '#808080',       // Gray - Requirement 2.3
        '#000000'                  // Default black - Requirement 2.4
      ],
      'line-width': 3,
      'line-opacity': 0.8
    },
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    }
  };
}

/**
 * Returns MapLibre layer specification for marker points with flag icon styling
 * 
 * @returns LayerSpecification for marker symbol layer
 * 
 * Requirements: 3.3
 */
export function getMarkerStyle(): LayerSpecification {
  return {
    id: 'cable-markers',
    type: 'symbol',
    source: 'markers',
    layout: {
      'icon-image': 'marker-flag',
      'icon-size': 0.8,
      'icon-allow-overlap': true,
      'icon-ignore-placement': false,
      'icon-anchor': 'bottom'
    },
    paint: {
      'icon-opacity': 0.9
    }
  };
}

/**
 * StyleEngine service interface
 */
export const StyleEngine = {
  getSoilTypeColor,
  getCableLineStyle,
  getMarkerStyle
};

export default StyleEngine;
