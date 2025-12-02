/**
 * KmlConverter Service
 * 
 * Converts KML files to GeoJSON format for cable route visualization
 * Maps KML line colors to soil types (Pasir, Tanah Liat, Batuan)
 */

import type { CableFeatureCollection, CableProperties } from '../types';
import type { Feature, LineString } from 'geojson';

/**
 * Color mapping from KML hex colors to soil types
 * KML colors are in ABGR format (Alpha-Blue-Green-Red)
 */
const COLOR_TO_SOIL_TYPE: Record<string, string> = {
  'ff2dc0fb': 'Pasir',        // Yellow/Orange
  'ff2f2fd3': 'Tanah Liat',   // Red
  'ff757575': 'Batuan',       // Gray
  'ff37405d': 'Batuan',       // Dark Gray
  'ff808080': 'Batuan',       // Medium Gray
};

/**
 * Depth mapping based on soil type
 */
const SOIL_TYPE_DEPTH: Record<string, number> = {
  'Pasir': 1.5,
  'Tanah Liat': 2.0,
  'Batuan': 2.5,
};

/**
 * Parse KML coordinates string to array of [lon, lat] tuples
 */
function parseCoordinates(coordString: string): [number, number][] {
  const coords = coordString.trim().split(/\s+/);
  return coords
    .map(coord => {
      const parts = coord.split(',');
      if (parts.length >= 2) {
        const lon = parseFloat(parts[0]);
        const lat = parseFloat(parts[1]);
        if (!isNaN(lon) && !isNaN(lat)) {
          return [lon, lat] as [number, number];
        }
      }
      return null;
    })
    .filter((coord): coord is [number, number] => coord !== null);
}

/**
 * Map KML color to soil type
 */
function mapColorToSoilType(color: string | null | undefined): string {
  if (!color) return 'Tanah Liat'; // Default
  return COLOR_TO_SOIL_TYPE[color] || 'Tanah Liat';
}

/**
 * Convert KML file content to GeoJSON
 * 
 * @param kmlContent - Raw KML file content as string
 * @returns CableFeatureCollection in GeoJSON format
 */
export function convertKmlToGeoJson(kmlContent: string): CableFeatureCollection {
  const features: Feature<LineString, CableProperties>[] = [];
  
  try {
    // Parse KML using DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlContent, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Failed to parse KML file');
    }
    
    // Extract all styles with their IDs and colors
    const styleMap = new Map<string, string>();
    const styles = xmlDoc.querySelectorAll('Style[id], gx\\:CascadingStyle[kml\\:id]');
    
    styles.forEach(style => {
      const styleId = style.getAttribute('id') || style.getAttribute('kml:id');
      if (styleId) {
        const lineStyle = style.querySelector('LineStyle');
        if (lineStyle) {
          const colorElement = lineStyle.querySelector('color');
          if (colorElement) {
            const color = colorElement.textContent?.toLowerCase() || null;
            if (color) {
              styleMap.set(styleId, color);
            }
          }
        }
      }
    });
    
    // Extract StyleMaps (they reference styles)
    const styleMaps = xmlDoc.querySelectorAll('StyleMap[id]');
    styleMaps.forEach(styleMapEl => {
      const styleMapId = styleMapEl.getAttribute('id');
      if (styleMapId) {
        // Get the normal style reference
        const pairs = styleMapEl.querySelectorAll('Pair');
        pairs.forEach(pair => {
          const key = pair.querySelector('key')?.textContent;
          if (key === 'normal' || key === 'highlight') {
            const styleUrl = pair.querySelector('styleUrl')?.textContent;
            if (styleUrl) {
              const referencedStyleId = styleUrl.replace('#', '');
              const color = styleMap.get(referencedStyleId);
              if (color) {
                styleMap.set(styleMapId, color);
              }
            }
          }
        });
      }
    });
    
    // Extract all Placemarks with LineString geometry
    const placemarks = xmlDoc.querySelectorAll('Placemark');
    let cableIndex = 1;
    
    placemarks.forEach(placemark => {
      const lineString = placemark.querySelector('LineString');
      if (!lineString) return; // Skip non-LineString placemarks
      
      const coordinatesEl = lineString.querySelector('coordinates');
      if (!coordinatesEl || !coordinatesEl.textContent) return;
      
      const coordinates = parseCoordinates(coordinatesEl.textContent);
      if (coordinates.length < 2) return; // Need at least 2 points
      
      // Get style reference
      const styleUrl = placemark.querySelector('styleUrl')?.textContent;
      const styleId = styleUrl ? styleUrl.replace('#', '') : null;
      const color = styleId ? styleMap.get(styleId) : null;
      
      // Map color to soil type
      const soilType = mapColorToSoilType(color);
      const depth = SOIL_TYPE_DEPTH[soilType] || 2.0;
      
      // Get placemark name
      const nameEl = placemark.querySelector('name');
      const name = nameEl?.textContent || `Cable Route ${cableIndex}`;
      
      // Create GeoJSON feature
      const feature: Feature<LineString, CableProperties> = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        },
        properties: {
          id: `cable-${String(cableIndex).padStart(3, '0')}`,
          soilType: soilType as 'Pasir' | 'Tanah Liat' | 'Batuan',
          depth: depth,
          name: `${name} (${soilType})`,
          installDate: new Date().toISOString().split('T')[0]
        }
      };
      
      features.push(feature);
      cableIndex++;
    });
    
    return {
      type: 'FeatureCollection',
      features: features
    };
    
  } catch (error) {
    console.error('Error converting KML to GeoJSON:', error);
    throw new Error(`Failed to convert KML: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Load and convert KML file to GeoJSON
 * 
 * @param kmlFilePath - Path to KML file
 * @returns Promise resolving to CableFeatureCollection
 */
export async function loadAndConvertKml(kmlFilePath: string): Promise<CableFeatureCollection> {
  try {
    const response = await fetch(kmlFilePath);
    if (!response.ok) {
      throw new Error(`Failed to load KML file: ${response.statusText}`);
    }
    
    const kmlContent = await response.text();
    return convertKmlToGeoJson(kmlContent);
  } catch (error) {
    console.error('Error loading KML file:', error);
    throw error;
  }
}

export const KmlConverter = {
  convertKmlToGeoJson,
  loadAndConvertKml
};

export default KmlConverter;
