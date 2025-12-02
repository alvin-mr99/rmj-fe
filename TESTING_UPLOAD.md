# Testing Upload Feature

## How to Test KML Upload

1. **Open the application** in your browser at http://localhost:5174/

2. **Open Browser Console** (F12 or Right-click > Inspect > Console)

3. **Click the Upload File button** in the sidebar (📁 Upload File)

4. **Upload a KML file** using one of these methods:
   - Drag and drop a KML file into the modal
   - Click "Browse Files" and select a KML file

5. **Test Files Available**:
   - `public/data/kml-monas-1.kml` (4 routes)
   - `public/data/kml-monas-2.kml` 
   - `public/data/kml-monas.kml`

6. **Check Console Logs**:
   You should see logs like:
   ```
   File content loaded, length: XXXX
   Converting KML to GeoJSON...
   Conversion successful, features: X
   Preview data set
   ```

7. **Review Preview**:
   - Check the preview shows correct number of routes
   - Check the route details are displayed
   - Check statistics (Cable Routes, Total Points)

8. **Click "Load to Map"**:
   You should see logs like:
   ```
   Upload confirmed, data: {...}
   Calling onUploadSuccess with X features
   === UPLOAD SUCCESS ===
   handleUploadSuccess called with data: {...}
   Number of features: X
   Cable data updated, current features: X
   Data saved to local storage
   Custom data loaded successfully - map should update now
   MapView createEffect triggered, features: X
   Map is loaded, re-rendering...
   renderCableRoutes called, features: X
   Rendering X cable routes
   ```

9. **Verify on Map**:
   - The map should show the uploaded cable routes
   - Routes should be colored based on soil type
   - Markers should appear along the routes
   - Map should fit bounds to show all routes

## Troubleshooting

### If upload doesn't work:

1. **Check Console for Errors**:
   - Look for red error messages
   - Check if KML parsing failed
   - Verify file format is correct

2. **Verify KML File**:
   - File must have `.kml` extension
   - File must be valid KML format
   - File must contain LineString geometries

3. **Check Browser Compatibility**:
   - Use Chrome 80+, Firefox 78+, Safari 13+, or Edge 80+
   - Ensure JavaScript is enabled
   - Check if DOMParser is available

4. **Clear Browser Cache**:
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Clear local storage
   - Restart dev server

### Common Issues:

1. **"No cable routes found in KML file"**:
   - KML file doesn't contain LineString geometries
   - Check if file has Placemark elements with LineString

2. **"Failed to parse KML file"**:
   - KML file is corrupted or invalid XML
   - Try opening file in text editor to verify format

3. **Map doesn't update after upload**:
   - Check console logs for "MapView createEffect triggered"
   - Verify cableData state is updated
   - Check if map is loaded (map.loaded() === true)

## Manual Testing with Node Script

You can also test KML conversion using the Node script:

```bash
node scripts/convert-kml.js public/data/kml-monas-1.kml public/data/test-output.json
```

This will convert the KML file to JSON and save it to `test-output.json`.

## Expected Behavior

1. **Upload Modal Opens**: Modal appears with drag & drop zone
2. **File Selected**: File info displayed, conversion starts
3. **Preview Shows**: Statistics and route details displayed
4. **Load to Map**: Data loaded, map updates, modal closes
5. **Map Updates**: Routes and markers appear on map
6. **Bounds Fit**: Map zooms to show all routes

## Debug Mode

All console.log statements are already added for debugging. To see detailed logs:

1. Open Browser Console
2. Filter by "Upload", "Convert", "MapView", or "render"
3. Follow the log sequence to identify where the issue occurs
