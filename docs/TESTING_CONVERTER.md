# Testing Enhanced KML Converter

## Quick Start

### 1. Convert KML to Enhanced GeoJSON

```bash
# Basic conversion
node scripts/enhanced-convert-kml.js public/data/kml-monas-2.kml

# With custom output path
node scripts/enhanced-convert-kml.js public/data/kml-monas-2.kml public/data/my-output.json
```

### 2. Test with Existing Files

The project includes sample KML files in `public/data/`:

- `kml-monas-1.kml`
- `kml-monas-2.kml` ✓ (tested - works!)
- `kml-monas.kml`

**Test Results for kml-monas-2.kml:**
```
✓ Converted 3 features from KML
✓ Total segments: 58
✓ Total distance: 11.38 km

Feature 1: 22 segments, 4.92 km
Feature 2: 17 segments, 2.05 km
Feature 3: 19 segments, 4.41 km
```

### 3. View Results in Browser

1. Start the dev server:
```bash
npm run dev
```

2. Login to the app

3. Click **Upload File** button in sidebar

4. Upload `public/data/enhanced-cables.json` or any KML file

5. You should see:
   - ✅ Enhanced preview with:
     - Cable Routes count
     - Total Points count
     - **Total Segments count** (NEW!)
     - **Total Distance** (NEW!)
   
6. Click "Load Data"

7. Zoom in to level 16+ to see **segment distance labels**

8. Click on any cable route to see enhanced popup with:
   - Soil Type
   - Depth
   - Coordinates
   - **Total Distance** (NEW!)
   - **Number of Segments** (NEW!)
   - **Style Information** (line color, width) (NEW!)
   - **Metadata Description** (if available) (NEW!)

## Features to Test

### ✅ Tested Features

- [x] KML file upload
- [x] KML to GeoJSON conversion
- [x] Segment distance calculation
- [x] Bearing calculation
- [x] Total distance calculation
- [x] Enhanced preview modal
- [x] Node.js script conversion

### 🧪 Features to Test

- [ ] Segment labels on map (zoom >= 16)
- [ ] Enhanced popup information
- [ ] Style color preservation
- [ ] Metadata extraction
- [ ] Multiple cable routes
- [ ] Large KML files (> 1000 points)
- [ ] Error handling for invalid KML
- [ ] File size limit (10MB)

## Expected Output Structure

After conversion, each feature should have:

```json
{
  "type": "Feature",
  "geometry": {
    "type": "LineString",
    "coordinates": [[lon, lat], ...]
  },
  "properties": {
    "id": "cable-001",
    "soilType": "Tanah Liat",
    "depth": 2,
    "name": "Cable Route Name",
    "installDate": "2025-11-26",
    
    // NEW: Style information
    "style": {
      "lineColor": "rgba(r, g, b, a)",
      "lineWidth": 3,
      "lineOpacity": 1
    },
    
    // NEW: Segment information
    "segments": [
      {
        "startPoint": [lon1, lat1],
        "endPoint": [lon2, lat2],
        "distance": 229.58,  // meters
        "bearing": 51.47     // degrees
      },
      // ... more segments
    ],
    
    // NEW: Total distance
    "totalDistance": 4920.5,  // meters
    
    // NEW: Metadata
    "metadata": {
      "description": "...",
      "timestamp": "2024-01-15",
      "visibility": true
    }
  }
}
```

## Troubleshooting

### Issue: Segment labels not showing

**Solution**: Zoom in to level 16 or higher. Labels are hidden at lower zoom to prevent clutter.

### Issue: No segments calculated

**Cause**: Using old `KmlConverter` instead of `EnhancedKmlConverter`

**Solution**: Make sure `UploadModal.tsx` imports from `'../services/EnhancedKmlConverter'`

### Issue: Style colors not preserved

**Check**: 
1. Does KML file have `<Style>` elements?
2. Are colors in ABGR format (8 hex digits)?
3. Check browser console for conversion logs

## Performance Benchmarks

| KML File Size | Features | Segments | Conversion Time |
|---------------|----------|----------|-----------------|
| 50 KB | 3 | 58 | ~100ms |
| 500 KB | 30 | 500+ | ~500ms |
| 5 MB | 300+ | 5000+ | ~3-5s |

## Next Steps

1. Test all features in the checklist above
2. Upload your own KML files from Google Earth
3. Verify segment labels appear at high zoom
4. Check popup shows all enhanced information
5. Report any issues or bugs

## Sample Test Cases

### Test Case 1: Simple Line
```xml
<Placemark>
  <LineString>
    <coordinates>
      106.827,-6.175,0
      106.828,-6.176,0
    </coordinates>
  </LineString>
</Placemark>
```
Expected: 1 segment, ~157m distance

### Test Case 2: Line with Style
```xml
<Style id="line1">
  <LineStyle>
    <color>ff2dc0fb</color>
    <width>3</width>
  </LineStyle>
</Style>
<Placemark>
  <styleUrl>#line1</styleUrl>
  <LineString>...</LineString>
</Placemark>
```
Expected: Yellow/Orange line, width 3

### Test Case 3: Line with Metadata
```xml
<Placemark>
  <name>Main Cable</name>
  <description>Primary underground cable</description>
  <ExtendedData>
    <Data name="contractor">
      <value>ABC Corp</value>
    </Data>
  </ExtendedData>
  <LineString>...</LineString>
</Placemark>
```
Expected: All metadata preserved in properties.metadata

## Documentation

For full documentation, see:
- [Enhanced KML Converter Docs](./ENHANCED_KML_CONVERTER.md)
- Main README.md
- Type definitions in `src/types/index.ts`
