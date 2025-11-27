/**
 * Enhanced KML to GeoJSON Converter Script (Node.js)
 * 
 * Features:
 * - Preserves all KML styles (line color, width, opacity, polygon fill, icons)
 * - Extracts and preserves metadata (description, timestamp, extended data)
 * - Calculates segment distances for all polylines
 * - Converts KML ABGR colors to standard RGBA
 * 
 * Usage: node scripts/enhanced-convert-kml.js <input-kml-file> [output-json-file]
 * Example: node scripts/enhanced-convert-kml.js public/data/kml-monas-2.kml public/data/enhanced-cables.json
 */

import fs from 'fs';
import path from 'path';
import { DOMParser } from '@xmldom/xmldom';

// Install @xmldom/xmldom if needed: npm install @xmldom/xmldom

// Default color mapping (fallback)
const COLOR_TO_SOIL_TYPE = {
  // Yellow/Orange shades - Pasir (Sand)
  'ff2dc0fb': 'Pasir',
  'ff14c8ff': 'Pasir',
  'ff00d4ff': 'Pasir',
  'ff00ffff': 'Pasir',
  
  // Red/Pink shades - Tanah Liat (Clay)
  'ff2f2fd3': 'Tanah Liat',
  'ff0000ff': 'Tanah Liat',
  'ff1414ff': 'Tanah Liat',
  'ff0014ff': 'Tanah Liat',
  
  // Gray/Dark shades - Batuan (Rock)
  'ff757575': 'Batuan',
  'ff37405d': 'Batuan',
  'ff808080': 'Batuan',
  'ff555555': 'Batuan',
  'ff404040': 'Batuan',
  'ff666666': 'Batuan',
};

const SOIL_TYPE_DEPTH = {
  'Pasir': 1.5,
  'Tanah Liat': 2.0,
  'Batuan': 2.5,
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(coord1, coord2) {
  const R = 6371000; // Earth's radius in meters
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  
  // Validate coordinates
  if (!isFinite(lon1) || !isFinite(lat1) || !isFinite(lon2) || !isFinite(lat2)) {
    console.warn('Invalid coordinates for distance calculation:', coord1, coord2);
    return 0;
  }
  
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const distance = R * c;
  
  // Validate result
  return isFinite(distance) ? distance : 0;
}

/**
 * Calculate bearing between two coordinates
 */
function calculateBearing(coord1, coord2) {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  
  // Validate coordinates
  if (!isFinite(lon1) || !isFinite(lat1) || !isFinite(lon2) || !isFinite(lat2)) {
    console.warn('Invalid coordinates for bearing calculation:', coord1, coord2);
    return 0;
  }
  
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  
  const θ = Math.atan2(y, x);
  const bearing = ((θ * 180 / Math.PI) + 360) % 360;
  
  // Validate result
  return isFinite(bearing) ? bearing : 0;
}

/**
 * Calculate segments for a polyline
 */
function calculateSegments(coordinates) {
  const segments = [];
  
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
 * Calculate total distance
 */
function calculateTotalDistance(coordinates) {
  let totalDistance = 0;
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    totalDistance += calculateDistance(coordinates[i], coordinates[i + 1]);
  }
  
  return totalDistance;
}

/**
 * Convert KML ABGR color to RGBA
 */
function abgrToRgba(abgr) {
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
 * Parse coordinates from KML
 */
function parseCoordinates(coordString) {
  const coords = coordString.trim().split(/\s+/);
  return coords
    .map(coord => {
      const parts = coord.split(',');
      if (parts.length >= 2) {
        const lon = parseFloat(parts[0]);
        const lat = parseFloat(parts[1]);
        if (!isNaN(lon) && !isNaN(lat)) {
          return [lon, lat];
        }
      }
      return null;
    })
    .filter(coord => coord !== null);
}

/**
 * Get text content from element (handles both browser and Node.js)
 */
function getTextContent(element) {
  if (!element) return null;
  return element.textContent || element.text || null;
}

/**
 * Extract style from Style element
 */
function extractStyle(styleElement) {
  const style = {};
  
  // LineStyle
  const lineStyles = styleElement.getElementsByTagName('LineStyle');
  if (lineStyles.length > 0) {
    const lineStyle = lineStyles[0];
    
    const colors = lineStyle.getElementsByTagName('color');
    if (colors.length > 0) {
      const abgrColor = getTextContent(colors[0])?.toLowerCase();
      if (abgrColor) {
        style.lineColor = abgrToRgba(abgrColor);
        style.lineOpacity = parseInt(abgrColor.substring(0, 2), 16) / 255;
      }
    }
    
    const widths = lineStyle.getElementsByTagName('width');
    if (widths.length > 0) {
      const width = getTextContent(widths[0]);
      if (width) {
        style.lineWidth = parseFloat(width);
      }
    }
  }
  
  // PolyStyle
  const polyStyles = styleElement.getElementsByTagName('PolyStyle');
  if (polyStyles.length > 0) {
    const polyStyle = polyStyles[0];
    
    const colors = polyStyle.getElementsByTagName('color');
    if (colors.length > 0) {
      const abgrColor = getTextContent(colors[0])?.toLowerCase();
      if (abgrColor) {
        style.polygonColor = abgrToRgba(abgrColor);
        style.polygonOpacity = parseInt(abgrColor.substring(0, 2), 16) / 255;
      }
    }
  }
  
  // IconStyle
  const iconStyles = styleElement.getElementsByTagName('IconStyle');
  if (iconStyles.length > 0) {
    const iconStyle = iconStyles[0];
    
    const colors = iconStyle.getElementsByTagName('color');
    if (colors.length > 0) {
      style.iconColor = abgrToRgba(getTextContent(colors[0])?.toLowerCase());
    }
    
    const scales = iconStyle.getElementsByTagName('scale');
    if (scales.length > 0) {
      const scale = getTextContent(scales[0]);
      if (scale) {
        style.iconScale = parseFloat(scale);
      }
    }
    
    const icons = iconStyle.getElementsByTagName('Icon');
    if (icons.length > 0) {
      const hrefs = icons[0].getElementsByTagName('href');
      if (hrefs.length > 0) {
        style.iconHref = getTextContent(hrefs[0]);
      }
    }
  }
  
  // LabelStyle
  const labelStyles = styleElement.getElementsByTagName('LabelStyle');
  if (labelStyles.length > 0) {
    const labelStyle = labelStyles[0];
    
    const colors = labelStyle.getElementsByTagName('color');
    if (colors.length > 0) {
      style.labelColor = abgrToRgba(getTextContent(colors[0])?.toLowerCase());
    }
    
    const scales = labelStyle.getElementsByTagName('scale');
    if (scales.length > 0) {
      const scale = getTextContent(scales[0]);
      if (scale) {
        style.labelScale = parseFloat(scale);
      }
    }
  }
  
  return style;
}

/**
 * Extract metadata from Placemark
 */
function extractMetadata(placemark) {
  const metadata = {};
  
  // Description
  const descriptions = placemark.getElementsByTagName('description');
  if (descriptions.length > 0) {
    const desc = getTextContent(descriptions[0]);
    if (desc) metadata.description = desc;
  }
  
  // TimeStamp
  const timeStamps = placemark.getElementsByTagName('TimeStamp');
  if (timeStamps.length > 0) {
    const whens = timeStamps[0].getElementsByTagName('when');
    if (whens.length > 0) {
      const when = getTextContent(whens[0]);
      if (when) metadata.timestamp = when;
    }
  }
  
  // Visibility
  const visibilities = placemark.getElementsByTagName('visibility');
  if (visibilities.length > 0) {
    const vis = getTextContent(visibilities[0]);
    metadata.visibility = vis === '1';
  }
  
  // Open
  const opens = placemark.getElementsByTagName('open');
  if (opens.length > 0) {
    const open = getTextContent(opens[0]);
    metadata.open = open === '1';
  }
  
  // Snippet
  const snippets = placemark.getElementsByTagName('Snippet');
  if (snippets.length > 0) {
    const snippet = getTextContent(snippets[0]);
    if (snippet) metadata.snippet = snippet;
  }
  
  // Extended Data
  const extendedDatas = placemark.getElementsByTagName('ExtendedData');
  if (extendedDatas.length > 0) {
    const dataElements = extendedDatas[0].getElementsByTagName('Data');
    for (let i = 0; i < dataElements.length; i++) {
      const dataEl = dataElements[i];
      const name = dataEl.getAttribute('name');
      const values = dataEl.getElementsByTagName('value');
      if (name && values.length > 0) {
        const value = getTextContent(values[0]);
        if (value) metadata[name] = value;
      }
    }
  }
  
  return metadata;
}

/**
 * Extract soil type from name or description
 * Enhanced with better keyword matching
 */
function extractSoilTypeFromText(text) {
  if (!text) return null;
  
  const lowerText = text.toLowerCase();
  console.log(`  🔍 Checking text: "${text}"`);
  
  // Check for keywords in order of specificity
  
  // Pasir (Sand)
  if (lowerText.includes('pasir') || lowerText.includes('sand')) {
    console.log(`  ✅ Matched keyword: Pasir`);
    return 'Pasir';
  }
  
  // Batuan (Rock)
  if (lowerText.includes('batuan') || lowerText.includes('batu') || lowerText.includes('rock')) {
    console.log(`  ✅ Matched keyword: Batuan`);
    return 'Batuan';
  }
  
  // Tanah Liat (Clay)
  if (lowerText.includes('tanah liat') || lowerText.includes('clay') || lowerText.includes('liat')) {
    console.log(`  ✅ Matched keyword: Tanah Liat`);
    return 'Tanah Liat';
  }
  
  // Tanah (generic) - only if exact word match
  const words = lowerText.split(/\s+/);
  if (words.includes('tanah') && !lowerText.includes('batuan')) {
    console.log(`  ✅ Matched keyword: Tanah (default to Tanah Liat)`);
    return 'Tanah Liat';
  }
  
  console.log(`  ❌ No keyword matched`);
  return null;
}

/**
 * Map color to soil type
 */
function mapColorToSoilType(color) {
  if (!color) return null;
  
  const match = color.match(/[a-f0-9]{8}/i);
  const abgr = match ? match[0].toLowerCase() : color.toLowerCase();
  
  // Try exact match first
  if (COLOR_TO_SOIL_TYPE[abgr]) {
    return COLOR_TO_SOIL_TYPE[abgr];
  }
  
  // Try approximate color matching based on RGB values
  if (abgr.length === 8) {
    const r = parseInt(abgr.substring(6, 8), 16);
    const g = parseInt(abgr.substring(4, 6), 16);
    const b = parseInt(abgr.substring(2, 4), 16);
    
    // Yellow/Orange range (high red and green, low blue) - Pasir
    if (r > 200 && g > 180 && b < 100) {
      return 'Pasir';
    }
    
    // Red range (high red, low green and blue) - Tanah Liat
    if (r > 180 && g < 100 && b < 100) {
      return 'Tanah Liat';
    }
    
    // Gray range (similar RGB values) - Batuan
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    if (maxDiff < 50 && r < 150) {
      return 'Batuan';
    }
  }
  
  return null;
}

/**
 * Convert KML to GeoJSON
 */
function convertKmlToGeoJson(kmlContent) {
  const features = [];
  
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlContent, 'text/xml');
    
    // Extract styles
    const styleMap = new Map();
    const styles = xmlDoc.getElementsByTagName('Style');
    
    for (let i = 0; i < styles.length; i++) {
      const style = styles[i];
      const styleId = style.getAttribute('id');
      if (styleId) {
        const extractedStyle = extractStyle(style);
        styleMap.set(styleId, extractedStyle);
      }
    }
    
    // Extract StyleMaps
    const styleMaps = xmlDoc.getElementsByTagName('StyleMap');
    for (let i = 0; i < styleMaps.length; i++) {
      const styleMapEl = styleMaps[i];
      const styleMapId = styleMapEl.getAttribute('id');
      if (styleMapId) {
        const pairs = styleMapEl.getElementsByTagName('Pair');
        for (let j = 0; j < pairs.length; j++) {
          const pair = pairs[j];
          const keys = pair.getElementsByTagName('key');
          if (keys.length > 0 && getTextContent(keys[0]) === 'normal') {
            const styleUrls = pair.getElementsByTagName('styleUrl');
            if (styleUrls.length > 0) {
              const styleUrl = getTextContent(styleUrls[0]);
              if (styleUrl) {
                const referencedStyleId = styleUrl.replace('#', '');
                const style = styleMap.get(referencedStyleId);
                if (style) {
                  styleMap.set(styleMapId, style);
                }
              }
            }
          }
        }
      }
    }
    
    // Extract Placemarks
    const placemarks = xmlDoc.getElementsByTagName('Placemark');
    let cableIndex = 1;
    
    for (let i = 0; i < placemarks.length; i++) {
      const placemark = placemarks[i];
      
      // Extract metadata
      const metadata = extractMetadata(placemark);
      
      // Get name
      const names = placemark.getElementsByTagName('name');
      const name = names.length > 0 ? getTextContent(names[0]) : `Feature ${cableIndex}`;
      
      // Get style
      const styleUrls = placemark.getElementsByTagName('styleUrl');
      const styleUrl = styleUrls.length > 0 ? getTextContent(styleUrls[0]) : null;
      const styleId = styleUrl ? styleUrl.replace('#', '') : null;
      const style = styleId ? styleMap.get(styleId) : null;
      
      // Process LineString
      const lineStrings = placemark.getElementsByTagName('LineString');
      if (lineStrings.length > 0) {
        const lineString = lineStrings[0];
        const coordinatesEls = lineString.getElementsByTagName('coordinates');
        
        if (coordinatesEls.length > 0) {
          const coordText = getTextContent(coordinatesEls[0]);
          if (coordText) {
            const coordinates = parseCoordinates(coordText);
            
            if (coordinates.length >= 2) {
              // Calculate segments and distance
              const segments = calculateSegments(coordinates);
              const totalDistance = calculateTotalDistance(coordinates);
              
              // Enhanced logging
              console.log(`\n📦 Feature ${cableIndex}: ${name}`);
              console.log(`  📍 Coordinates: ${coordinates.length} points`);
              console.log(`  📏 Segments: ${segments.length}`);
              console.log(`  📐 Total Distance: ${(totalDistance / 1000).toFixed(2)} km`);
              
              // Determine soil type with ENHANCED priority
              let soilType = 'Tanah Liat';
              let detectionMethod = 'default';
              
              // Priority 1: From NAME
              console.log(`  🔎 Priority 1: Checking NAME`);
              const soilFromName = extractSoilTypeFromText(name);
              if (soilFromName) {
                soilType = soilFromName;
                detectionMethod = 'name';
                console.log(`  ✓ Soil type from NAME: ${soilType}`);
              } else {
                // Priority 2: From DESCRIPTION
                console.log(`  🔎 Priority 2: Checking DESCRIPTION`);
                if (metadata.description) {
                  const soilFromDesc = extractSoilTypeFromText(metadata.description);
                  if (soilFromDesc) {
                    soilType = soilFromDesc;
                    detectionMethod = 'description';
                    console.log(`  ✓ Soil type from DESCRIPTION: ${soilType}`);
                  }
                }
                
                // Priority 3: From COLOR
                if (soilType === 'Tanah Liat' && style?.lineColor) {
                  console.log(`  🔎 Priority 3: Checking LINE COLOR`);
                  const soilFromColor = mapColorToSoilType(style.lineColor);
                  if (soilFromColor) {
                    soilType = soilFromColor;
                    detectionMethod = 'color';
                    console.log(`  ✓ Soil type from COLOR: ${soilType}`);
                  }
                }
              }
              
              const depth = SOIL_TYPE_DEPTH[soilType] || 2.0;
              
              // Final log with color
              const soilEmoji = {
                'Pasir': '🟠',
                'Tanah Liat': '🔴',
                'Batuan': '⚫'
              };
              console.log(`  ══════════════════════════════════════`);
              console.log(`  ${soilEmoji[soilType] || '⚪'} FINAL: ${soilType} (from: ${detectionMethod})`);
              console.log(`  💧 Depth: ${depth}m`);
              console.log(`  ══════════════════════════════════════\n`);
              
              // Create feature
              const feature = {
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: coordinates
                },
                properties: {
                  id: `cable-${String(cableIndex).padStart(3, '0')}`,
                  soilType: soilType,
                  depth: depth,
                  name: name,
                  installDate: new Date().toISOString().split('T')[0],
                  style: style || undefined,
                  segments: segments,
                  totalDistance: totalDistance,
                  metadata: Object.keys(metadata).length > 0 ? metadata : undefined
                }
              };
              
              features.push(feature);
              cableIndex++;
            }
          }
        }
      }
    }
    
    console.log(`✓ Converted ${features.length} features from KML`);
    
    // Calculate statistics
    const totalSegments = features.reduce((sum, f) => sum + (f.properties.segments?.length || 0), 0);
    const totalDistance = features.reduce((sum, f) => sum + (f.properties.totalDistance || 0), 0);
    
    console.log(`✓ Total segments: ${totalSegments}`);
    console.log(`✓ Total distance: ${(totalDistance / 1000).toFixed(2)} km`);
    
    return {
      type: 'FeatureCollection',
      features: features
    };
    
  } catch (error) {
    console.error('Error converting KML:', error);
    throw error;
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node scripts/enhanced-convert-kml.js <input-kml-file> [output-json-file]');
    console.error('Example: node scripts/enhanced-convert-kml.js public/data/kml-monas-2.kml public/data/enhanced-cables.json');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputFile = args[1] || inputFile.replace('.kml', '-enhanced.json');
  
  try {
    console.log(`Reading KML file: ${inputFile}`);
    const kmlContent = fs.readFileSync(inputFile, 'utf8');
    
    console.log('Converting KML to GeoJSON...');
    const geoJson = convertKmlToGeoJson(kmlContent);
    
    console.log(`\nFeature Details:`);
    geoJson.features.forEach((feature, index) => {
      const props = feature.properties;
      console.log(`\n  ${index + 1}. ${props.name}`);
      console.log(`     - Soil Type: ${props.soilType}`);
      console.log(`     - Depth: ${props.depth}m`);
      console.log(`     - Points: ${feature.geometry.coordinates.length}`);
      console.log(`     - Segments: ${props.segments.length}`);
      console.log(`     - Total Distance: ${(props.totalDistance / 1000).toFixed(2)} km`);
      
      if (props.style) {
        console.log(`     - Style: Line ${props.style.lineColor || 'default'} (width: ${props.style.lineWidth || 'default'})`);
      }
      
      if (props.metadata?.description) {
        console.log(`     - Description: ${props.metadata.description.substring(0, 50)}...`);
      }
    });
    
    console.log(`\nWriting GeoJSON to: ${outputFile}`);
    fs.writeFileSync(outputFile, JSON.stringify(geoJson, null, 2), 'utf8');
    
    console.log('\n✓ Conversion completed successfully!');
    console.log(`✓ Output file: ${outputFile}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
