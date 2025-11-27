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
 * Colors are chosen to be distinct and match typical Google Earth representations
 * 
 * @param soilType - The soil type classification
 * @returns Hex color code for the soil type
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export function getSoilTypeColor(soilType: SoilType | string): string {
  const colorMap: Record<string, string> = {
    'Pasir': '#FFC107',        // Amber/Orange - Sand (Google Earth yellow-ish) - Requirement 2.1
    'Tanah Liat': '#D32F2F',   // Red - Clay soil - Requirement 2.2
    'Batuan': '#616161',       // Dark Gray - Rock - Requirement 2.3
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
        'Pasir', '#FFC107',        // Amber/Orange - Sand - Requirement 2.1
        'Tanah Liat', '#D32F2F',   // Red - Clay - Requirement 2.2
        'Batuan', '#616161',       // Dark Gray - Rock - Requirement 2.3
        '#000000'                  // Default black - Requirement 2.4
      ],
      'line-width': 6,
      'line-opacity': 0.8
    },
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    }
  };
}

/**
 * Returns MapLibre layer specification for marker points with circle styling
 * Markers only visible at zoom level 15 and above (close zoom)
 * 
 * @returns LayerSpecification for marker circle layer
 * 
 * Requirements: 3.3
 */
export function getMarkerStyle(): LayerSpecification {
  return {
    id: 'cable-markers',
    type: 'circle',
    source: 'markers',
    minzoom: 15, // Only show markers when zoomed in close
    paint: {
      'circle-radius': 3,
      // Data-driven color based on parent cable's soilType
      'circle-color': [
        'match',
        ['get', 'soilType'],
        'Pasir', '#FFC107',        // Amber/Orange - matches cable color
        'Tanah Liat', '#D32F2F',   // Red - matches cable color
        'Batuan', '#616161',       // Dark Gray - matches cable color
        '#FF0000'                  // Default red
      ],
      'circle-opacity': 0.9,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#FFFFFF',
      'circle-stroke-opacity': 1
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
