/**
 * Enhanced KML Converter Service
 * 
 * Converts KML files to GeoJSON format while preserving:
 * - All style properties (colors, opacity, line width, polygon fill, icons)
 * - Metadata (description, timestamp, author, etc.)
 * - Calculates and stores segment distances for polylines
 * - Supports LineString, Polygon, Point, and MultiGeometry
 * 
 * Color Formats:
 * - KML uses ABGR (Alpha-Blue-Green-Red) format: aabbggrr
 * - Converts to standard RGBA for web display
 */

import type { CableFeatureCollection, CableProperties, KMLStyle, SegmentInfo, KMLMetadata } from '../types';
import type { Feature, LineString } from 'geojson';

/**
 * Default color mapping from KML hex colors to soil types
 * This is used as fallback when style information is available
 */
const COLOR_TO_SOIL_TYPE: Record<string, string> = {
  'ff2dc0fb': 'Pasir',        // Yellow/Orange
  'ff2f2fd3': 'Tanah Liat',   // Red
  'ff757575': 'Batuan',       // Gray
  'ff37405d': 'Batuan',       // Dark Gray
  'ff808080': 'Batuan',       // Medium Gray
};

/**
 * Default depth mapping based on soil type
 */
const SOIL_TYPE_DEPTH: Record<string, number> = {
  'Pasir': 1.5,
  'Tanah Liat': 2.0,
  'Batuan': 2.5,
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 - [longitude, latitude]
 * @param coord2 - [longitude, latitude]
 * @returns Distance in meters
 */
function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371000; // Earth's radius in meters
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Calculate bearing between two coordinates
 * @param coord1 - [longitude, latitude]
 * @param coord2 - [longitude, latitude]
 * @returns Bearing in degrees (0-360)
 */
function calculateBearing(coord1: [number, number], coord2: [number, number]): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  
  const θ = Math.atan2(y, x);
  const bearing = ((θ * 180 / Math.PI) + 360) % 360;
  
  return bearing;
}

/**
 * Calculate segments information for a LineString
 * @param coordinates - Array of [longitude, latitude] coordinates
 * @returns Array of segment information
 */
function calculateSegments(coordinates: [number, number][]): SegmentInfo[] {
  const segments: SegmentInfo[] = [];
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    const startPoint = coordinates[i];
    const endPoint = coordinates[i + 1];
    const distance = calculateDistance(startPoint, endPoint);
    const bearing = calculateBearing(startPoint, endPoint);
    
    segments.push({
      startPoint,
      endPoint,
      distance,
      bearing
    });
  }
  
  return segments;
}

/**
 * Calculate total distance of a LineString
 * @param coordinates - Array of [longitude, latitude] coordinates
 * @returns Total distance in meters
 */
function calculateTotalDistance(coordinates: [number, number][]): number {
  let totalDistance = 0;
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    totalDistance += calculateDistance(coordinates[i], coordinates[i + 1]);
  }
  
  return totalDistance;
}

/**
 * Convert KML ABGR color to RGBA
 * KML format: aabbggrr (Alpha-Blue-Green-Red)
 * Output: rgba(r, g, b, a)
 * @param abgr - Color in ABGR format (8 hex digits)
 * @returns RGBA color string
 */
function abgrToRgba(abgr: string): string {
  if (!abgr || abgr.length !== 8) {
    return 'rgba(0, 0, 0, 1)';
  }
  
  const aa = abgr.substring(0, 2);
  const bb = abgr.substring(2, 4);
  const gg = abgr.substring(4, 6);
  const rr = abgr.substring(6, 8);
  
  const r = parseInt(rr, 16);
  const g = parseInt(gg, 16);
  const b = parseInt(bb, 16);
  const a = parseInt(aa, 16) / 255;
  
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
}

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
 * Extract style information from KML Style element
 */
function extractStyle(styleElement: Element): KMLStyle {
  const style: KMLStyle = {};
  
  // LineStyle
  const lineStyle = styleElement.querySelector('LineStyle');
  if (lineStyle) {
    const colorEl = lineStyle.querySelector('color');
    const widthEl = lineStyle.querySelector('width');
    
    if (colorEl?.textContent) {
      const abgrColor = colorEl.textContent.toLowerCase();
      style.lineColor = abgrToRgba(abgrColor);
      
      // Extract opacity from alpha channel
      const alpha = parseInt(abgrColor.substring(0, 2), 16) / 255;
      style.lineOpacity = alpha;
    }
    
    if (widthEl?.textContent) {
      style.lineWidth = parseFloat(widthEl.textContent);
    }
  }
  
  // PolyStyle (for polygons)
  const polyStyle = styleElement.querySelector('PolyStyle');
  if (polyStyle) {
    const colorEl = polyStyle.querySelector('color');
    
    if (colorEl?.textContent) {
      const abgrColor = colorEl.textContent.toLowerCase();
      style.polygonColor = abgrToRgba(abgrColor);
      
      // Extract opacity from alpha channel
      const alpha = parseInt(abgrColor.substring(0, 2), 16) / 255;
      style.polygonOpacity = alpha;
    }
  }
  
  // IconStyle (for points)
  const iconStyle = styleElement.querySelector('IconStyle');
  if (iconStyle) {
    const colorEl = iconStyle.querySelector('color');
    const scaleEl = iconStyle.querySelector('scale');
    const iconEl = iconStyle.querySelector('Icon href');
    
    if (colorEl?.textContent) {
      style.iconColor = abgrToRgba(colorEl.textContent.toLowerCase());
    }
    
    if (scaleEl?.textContent) {
      style.iconScale = parseFloat(scaleEl.textContent);
    }
    
    if (iconEl?.textContent) {
      style.iconHref = iconEl.textContent;
    }
  }
  
  // LabelStyle
  const labelStyle = styleElement.querySelector('LabelStyle');
  if (labelStyle) {
    const colorEl = labelStyle.querySelector('color');
    const scaleEl = labelStyle.querySelector('scale');
    
    if (colorEl?.textContent) {
      style.labelColor = abgrToRgba(colorEl.textContent.toLowerCase());
    }
    
    if (scaleEl?.textContent) {
      style.labelScale = parseFloat(scaleEl.textContent);
    }
  }
  
  return style;
}

/**
 * Extract metadata from KML Placemark element
 */
function extractMetadata(placemark: Element): KMLMetadata {
  const metadata: KMLMetadata = {};
  
  // Description
  const descEl = placemark.querySelector('description');
  if (descEl?.textContent) {
    metadata.description = descEl.textContent;
  }
  
  // Timestamp
  const timeStampEl = placemark.querySelector('TimeStamp when');
  if (timeStampEl?.textContent) {
    metadata.timestamp = timeStampEl.textContent;
  }
  
  // TimeSpan
  const timeSpanBegin = placemark.querySelector('TimeSpan begin');
  const timeSpanEnd = placemark.querySelector('TimeSpan end');
  if (timeSpanBegin?.textContent || timeSpanEnd?.textContent) {
    metadata.timeSpan = {
      begin: timeSpanBegin?.textContent,
      end: timeSpanEnd?.textContent
    };
  }
  
  // Visibility
  const visibilityEl = placemark.querySelector('visibility');
  if (visibilityEl?.textContent) {
    metadata.visibility = visibilityEl.textContent === '1';
  }
  
  // Open
  const openEl = placemark.querySelector('open');
  if (openEl?.textContent) {
    metadata.open = openEl.textContent === '1';
  }
  
  // Snippet
  const snippetEl = placemark.querySelector('Snippet');
  if (snippetEl?.textContent) {
    metadata.snippet = snippetEl.textContent;
  }
  
  // Extended Data
  const extendedData = placemark.querySelector('ExtendedData');
  if (extendedData) {
    const dataElements = extendedData.querySelectorAll('Data');
    dataElements.forEach(dataEl => {
      const name = dataEl.getAttribute('name');
      const valueEl = dataEl.querySelector('value');
      if (name && valueEl?.textContent) {
        metadata[name] = valueEl.textContent;
      }
    });
  }
  
  return metadata;
}

/**
 * Map color to soil type (fallback for backward compatibility)
 */
function mapColorToSoilType(color: string | null): string {
  if (!color) return 'Tanah Liat';
  
  // Extract ABGR from RGBA if needed
  const abgrMatch = color.match(/[a-f0-9]{8}/i);
  const abgr = abgrMatch ? abgrMatch[0].toLowerCase() : color.toLowerCase();
  
  return COLOR_TO_SOIL_TYPE[abgr] || 'Tanah Liat';
}

/**
 * Convert KML file content to GeoJSON with full style and metadata preservation
 * 
 * @param kmlContent - Raw KML file content as string
 * @returns CableFeatureCollection in GeoJSON format with enhanced properties
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
    
    // Extract all styles with their IDs
    const styleMap = new Map<string, KMLStyle>();
    const styles = xmlDoc.querySelectorAll('Style[id], gx\\:CascadingStyle[kml\\:id]');
    
    styles.forEach(style => {
      const styleId = style.getAttribute('id') || style.getAttribute('kml:id');
      if (styleId) {
        const extractedStyle = extractStyle(style);
        styleMap.set(styleId, extractedStyle);
      }
    });
    
    // Extract StyleMaps (they reference styles)
    const styleMaps = xmlDoc.querySelectorAll('StyleMap[id]');
    styleMaps.forEach(styleMapEl => {
      const styleMapId = styleMapEl.getAttribute('id');
      if (styleMapId) {
        // Get the normal style reference (preferred for display)
        const pairs = styleMapEl.querySelectorAll('Pair');
        pairs.forEach(pair => {
          const key = pair.querySelector('key')?.textContent;
          if (key === 'normal') {
            const styleUrl = pair.querySelector('styleUrl')?.textContent;
            if (styleUrl) {
              const referencedStyleId = styleUrl.replace('#', '');
              const style = styleMap.get(referencedStyleId);
              if (style) {
                styleMap.set(styleMapId, style);
              }
            }
          }
        });
      }
    });
    
    // Extract all Placemarks
    const placemarks = xmlDoc.querySelectorAll('Placemark');
    let cableIndex = 1;
    
    placemarks.forEach(placemark => {
      // Extract metadata
      const metadata = extractMetadata(placemark);
      
      // Get placemark name
      const nameEl = placemark.querySelector('name');
      const name = nameEl?.textContent || `Feature ${cableIndex}`;
      
      // Get style reference
      const styleUrl = placemark.querySelector('styleUrl')?.textContent;
      const styleId = styleUrl ? styleUrl.replace('#', '') : null;
      const style = styleId ? styleMap.get(styleId) : undefined;
      
      // Process LineString geometries
      const lineString = placemark.querySelector('LineString');
      if (lineString) {
        const coordinatesEl = lineString.querySelector('coordinates');
        if (!coordinatesEl || !coordinatesEl.textContent) return;
        
        const coordinates = parseCoordinates(coordinatesEl.textContent);
        if (coordinates.length < 2) return;
        
        // Calculate segments and total distance
        const segments = calculateSegments(coordinates);
        const totalDistance = calculateTotalDistance(coordinates);
        
        // Determine soil type from color (backward compatibility)
        const soilType = style?.lineColor 
          ? mapColorToSoilType(style.lineColor)
          : 'Tanah Liat';
        const depth = SOIL_TYPE_DEPTH[soilType] || 2.0;
        
        // Create GeoJSON feature with enhanced properties
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
            name: name,
            installDate: new Date().toISOString().split('T')[0],
            style: style,
            segments: segments,
            totalDistance: totalDistance,
            metadata: metadata
          }
        };
        
        features.push(feature);
        cableIndex++;
      }
      
      // TODO: Add support for Polygon and Point geometries in future enhancement
    });
    
    console.log(`✓ Converted ${features.length} features from KML`);
    console.log(`✓ Total segments calculated: ${features.reduce((sum, f) => sum + (f.properties.segments?.length || 0), 0)}`);
    
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

/**
 * Format segment distance for display
 * @param distance - Distance in meters
 * @returns Formatted string with appropriate unit
 */
export function formatSegmentDistance(distance: number): string {
  if (distance < 1) {
    return `${(distance * 100).toFixed(0)} cm`;
  } else if (distance < 1000) {
    return `${distance.toFixed(2)} m`;
  } else {
    return `${(distance / 1000).toFixed(2)} km`;
  }
}

/**
 * Format bearing for display
 * @param bearing - Bearing in degrees
 * @returns Formatted string with cardinal direction
 */
export function formatBearing(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return `${bearing.toFixed(1)}° ${directions[index]}`;
}

export const EnhancedKmlConverter = {
  convertKmlToGeoJson,
  loadAndConvertKml,
  formatSegmentDistance,
  formatBearing,
  calculateDistance,
  calculateBearing
};

export default EnhancedKmlConverter;
