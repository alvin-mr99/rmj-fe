/**
 * KML to GeoJSON Converter Script
 * 
 * Usage: node scripts/convert-kml.js <input-kml-file> [output-json-file]
 * Example: node scripts/convert-kml.js public/data/kml-monas-2.kml public/data/sample-cables.json
 */

import fs from 'fs';
import path from 'path';

// Color mapping from KML hex colors to soil types
const COLOR_TO_SOIL_TYPE = {
  'ff2dc0fb': 'Pasir',        // Yellow/Orange
  'ff2f2fd3': 'Tanah Liat',   // Red
  'ff757575': 'Batuan',       // Gray
  'ff37405d': 'Batuan',       // Dark Gray
  'ff808080': 'Batuan',       // Medium Gray
};

// Depth mapping based on soil type
const SOIL_TYPE_DEPTH = {
  'Pasir': 1.5,
  'Tanah Liat': 2.0,
  'Batuan': 2.5,
};

/**
 * Parse KML coordinates string to array of [lon, lat] tuples
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
 * Extract color from style element
 */
function extractColorFromStyle(styleElement) {
  const colorMatch = styleElement.match(/<color>([a-fA-F0-9]{8})<\/color>/);
  return colorMatch ? colorMatch[1].toLowerCase() : null;
}

/**
 * Convert KML to GeoJSON
 */
function convertKmlToGeoJson(kmlContent) {
  const features = [];
  
  // Extract styles and their colors
  const styleMap = new Map();
  const styleRegex = /<(?:Style|gx:CascadingStyle)[^>]*(?:id|kml:id)="([^"]+)"[^>]*>([\s\S]*?)<\/(?:Style|gx:CascadingStyle)>/g;
  let match;
  
  while ((match = styleRegex.exec(kmlContent)) !== null) {
    const styleId = match[1];
    const styleContent = match[2];
    const color = extractColorFromStyle(styleContent);
    if (color) {
      styleMap.set(styleId, color);
    }
  }
  
  // Extract StyleMaps
  const styleMapRegex = /<StyleMap[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/StyleMap>/g;
  while ((match = styleMapRegex.exec(kmlContent)) !== null) {
    const styleMapId = match[1];
    const styleMapContent = match[2];
    
    // Find ALL style references (normal and highlight)
    const styleUrlRegex = /<styleUrl>#([^<]+)<\/styleUrl>/g;
    let styleUrlMatch;
    while ((styleUrlMatch = styleUrlRegex.exec(styleMapContent)) !== null) {
      const referencedStyleId = styleUrlMatch[1];
      const color = styleMap.get(referencedStyleId);
      if (color) {
        styleMap.set(styleMapId, color);
        break; // Use first found color
      }
    }
  }
  
  // Extract Placemarks with LineString
  const placemarkRegex = /<Placemark[^>]*>([\s\S]*?)<\/Placemark>/g;
  let cableIndex = 1;
  
  while ((match = placemarkRegex.exec(kmlContent)) !== null) {
    const placemarkContent = match[1];
    
    // Check if it has LineString
    if (!placemarkContent.includes('<LineString>')) continue;
    
    // Extract coordinates
    const coordMatch = placemarkContent.match(/<coordinates>([\s\S]*?)<\/coordinates>/);
    if (!coordMatch) continue;
    
    const coordinates = parseCoordinates(coordMatch[1]);
    if (coordinates.length < 2) continue;
    
    // Extract style reference
    const styleUrlMatch = placemarkContent.match(/<styleUrl>#([^<]+)<\/styleUrl>/);
    const styleId = styleUrlMatch ? styleUrlMatch[1] : null;
    const color = styleId ? styleMap.get(styleId) : null;
    
    // Map color to soil type
    const soilType = color && COLOR_TO_SOIL_TYPE[color] ? COLOR_TO_SOIL_TYPE[color] : 'Tanah Liat';
    const depth = SOIL_TYPE_DEPTH[soilType] || 2.0;
    
    // Extract name
    const nameMatch = placemarkContent.match(/<name>([^<]+)<\/name>/);
    const name = nameMatch ? nameMatch[1] : `Cable Route ${cableIndex}`;
    
    // Create GeoJSON feature
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
        name: `${name} (${soilType})`,
        installDate: new Date().toISOString().split('T')[0]
      }
    };
    
    features.push(feature);
    cableIndex++;
  }
  
  return {
    type: 'FeatureCollection',
    features: features
  };
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node scripts/convert-kml.js <input-kml-file> [output-json-file]');
    console.error('Example: node scripts/convert-kml.js public/data/kml-monas-2.kml public/data/sample-cables.json');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputFile = args[1] || inputFile.replace('.kml', '.json');
  
  try {
    console.log(`Reading KML file: ${inputFile}`);
    const kmlContent = fs.readFileSync(inputFile, 'utf8');
    
    console.log('Converting KML to GeoJSON...');
    const geoJson = convertKmlToGeoJson(kmlContent);
    
    console.log(`Found ${geoJson.features.length} cable routes`);
    geoJson.features.forEach((feature, index) => {
      console.log(`  ${index + 1}. ${feature.properties.name} - ${feature.geometry.coordinates.length} points`);
    });
    
    console.log(`Writing GeoJSON to: ${outputFile}`);
    fs.writeFileSync(outputFile, JSON.stringify(geoJson, null, 2), 'utf8');
    
    console.log('✓ Conversion completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
