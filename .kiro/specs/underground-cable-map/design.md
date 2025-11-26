# Design Document

## Overview

Underground Cable Map adalah single-page application (SPA) yang dibangun dengan SolidJS dan MapLibre GL JS. Aplikasi ini menampilkan visualisasi interaktif jalur kabel bawah tanah dengan pewarnaan dinamis berdasarkan jenis tanah, marker interval, dan informasi detail melalui popup. Arsitektur aplikasi menggunakan pendekatan component-based dengan state management lokal, dan semua komputasi geospasial dilakukan di client-side menggunakan Turf.js.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │           SolidJS Application                   │    │
│  │                                                 │    │
│  │  ┌──────────────┐      ┌──────────────────┐   │    │
│  │  │ Map Component│◄────►│  Data Store      │   │    │
│  │  │ (MapLibre)   │      │  (GeoJSON)       │   │    │
│  │  └──────┬───────┘      └──────────────────┘   │    │
│  │         │                                      │    │
│  │         ▼                                      │    │
│  │  ┌──────────────┐      ┌──────────────────┐   │    │
│  │  │ Marker Gen   │      │  Style Engine    │   │    │
│  │  │ (Turf.js)    │      │  (Data-driven)   │   │    │
│  │  └──────────────┘      └──────────────────┘   │    │
│  │                                                 │    │
│  │  ┌──────────────┐      ┌──────────────────┐   │    │
│  │  │ UI Controls  │      │  Drawing Tools   │   │    │
│  │  │ (Search/Nav) │      │  (Optional)      │   │    │
│  │  └──────────────┘      └──────────────────┘   │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend Framework**: SolidJS (v1.8+)
- **Map Library**: MapLibre GL JS (v3.x)
- **Geospatial Computation**: Turf.js (v6.x)
- **Drawing Tools**: MapLibre GL Draw (optional feature)
- **Build Tool**: Vite
- **Styling**: CSS Modules / Tailwind CSS (responsive design)

## Components and Interfaces

### 1. App Component (Root)

**Responsibility**: Application entry point, layout management, and global state

**Interface**:
```typescript
interface AppProps {}

interface AppState {
  cableData: FeatureCollection<LineString, CableProperties>;
  selectedFeature: Feature | null;
  isDrawingMode: boolean;
}
```

### 2. MapView Component

**Responsibility**: MapLibre GL JS initialization, rendering, and event handling

**Interface**:
```typescript
interface MapViewProps {
  cableData: FeatureCollection<LineString, CableProperties>;
  onFeatureClick: (feature: Feature) => void;
  onMapLoad: (map: Map) => void;
}

interface MapViewMethods {
  addCableRoute: (feature: Feature<LineString, CableProperties>) => void;
  removeCableRoute: (featureId: string) => void;
  fitBounds: () => void;
}
```

### 3. MarkerGenerator Service

**Responsibility**: Generate marker points along cable routes using Turf.js

**Interface**:
```typescript
interface MarkerGeneratorService {
  generateMarkers(
    lineString: Feature<LineString>,
    intervalMeters: number
  ): FeatureCollection<Point, MarkerProperties>;
  
  calculateTotalDistance(lineString: Feature<LineString>): number;
}
```

### 4. StyleEngine Service

**Responsibility**: Generate MapLibre style specifications for data-driven styling

**Interface**:
```typescript
interface StyleEngineService {
  getCableLineStyle(): LayerSpecification;
  getMarkerStyle(): LayerSpecification;
  getSoilTypeColor(soilType: SoilType): string;
}
```

### 5. PopupComponent

**Responsibility**: Display cable/marker information in interactive popup

**Interface**:
```typescript
interface PopupProps {
  feature: Feature<LineString | Point, CableProperties>;
  coordinates: [number, number];
  onClose: () => void;
}
```

### 6. SearchControl Component

**Responsibility**: Location search and map navigation

**Interface**:
```typescript
interface SearchControlProps {
  onLocationSelect: (coordinates: [number, number]) => void;
}
```

### 7. DrawingToolsComponent (Optional)

**Responsibility**: Enable drawing new cable routes

**Interface**:
```typescript
interface DrawingToolsProps {
  isActive: boolean;
  onDrawComplete: (feature: Feature<LineString>) => void;
  onCancel: () => void;
}
```

## Data Models

### CableProperties

```typescript
interface CableProperties {
  id: string;
  soilType: SoilType;
  depth: number; // in meters
  name?: string;
  installDate?: string;
}

type SoilType = 'Pasir' | 'Tanah Liat' | 'Batuan';
```

### MarkerProperties

```typescript
interface MarkerProperties {
  cableId: string;
  soilType: SoilType;
  depth: number;
  distanceFromStart: number; // in meters
  coordinates: [number, number];
}
```

### GeoJSON Structure

```typescript
interface CableFeature extends Feature<LineString, CableProperties> {
  type: 'Feature';
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  properties: CableProperties;
}

interface CableFeatureCollection extends FeatureCollection<LineString, CableProperties> {
  type: 'FeatureCollection';
  features: CableFeature[];
}
```

### Sample GeoJSON Data

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [106.8270, -6.1751],
          [106.8280, -6.1755],
          [106.8290, -6.1760]
        ]
      },
      "properties": {
        "id": "cable-001",
        "soilType": "Pasir",
        "depth": 1.5,
        "name": "Cable Route A"
      }
    }
  ]
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Cable route rendering completeness
*For any* valid GeoJSON FeatureCollection containing cable routes, when loaded into the application, all features in the collection should be rendered as visible LineString layers on the map.
**Validates: Requirements 1.1, 1.2**

### Property 2: GeoJSON parsing round-trip
*For any* valid GeoJSON cable route data, parsing and then extracting the rendered data should produce an equivalent GeoJSON structure with the same geometry and properties.
**Validates: Requirements 1.2**

### Property 3: Map bounds contain all routes
*For any* set of cable routes, when the map auto-fits to show all routes, every coordinate point from every route should fall within the calculated viewport bounds.
**Validates: Requirements 1.4**

### Property 4: Soil type color mapping
*For any* cable route with a valid soil type (Pasir, Tanah Liat, or Batuan), the rendered line color should match the specified mapping: Pasir → yellow, Tanah Liat → brown, Batuan → gray.
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 5: Invalid soil type default handling
*For any* cable route with missing or invalid soil type data, the system should render the line in a default color without throwing errors.
**Validates: Requirements 2.4**

### Property 6: Marker interval consistency
*For any* cable route LineString with length ≥ 30 meters, the generated markers should be spaced at 30-meter intervals (±1 meter tolerance for geometric calculations), measured along the line.
**Validates: Requirements 3.1**

### Property 7: Marker independence across routes
*For any* set of multiple cable routes, the total number of generated markers should equal the sum of markers generated for each route individually.
**Validates: Requirements 3.5**

### Property 8: Popup content completeness
*For any* cable route or marker that is clicked, the displayed popup should contain all three required fields: soil type, cable depth, and coordinates.
**Validates: Requirements 4.1, 4.2**

### Property 9: Coordinate formatting precision
*For any* coordinate pair displayed in a popup, the formatted string should represent both longitude and latitude with at least 6 decimal places.
**Validates: Requirements 4.3**

### Property 10: Depth unit display
*For any* cable depth value displayed in a popup, the formatted string should include the unit indicator "m" or "meter(s)".
**Validates: Requirements 4.4**

### Property 11: Single popup constraint
*For any* sequence of click events on different features, at most one popup should be visible on the map at any given time.
**Validates: Requirements 4.5**

### Property 12: Responsive map resize
*For any* viewport dimension change event, the map container dimensions should update to match the new viewport size within a reasonable time frame.
**Validates: Requirements 5.3**

### Property 13: Pan operation updates center
*For any* pan/drag operation on the map, the map center coordinates after the operation should differ from the center coordinates before the operation.
**Validates: Requirements 6.1**

### Property 14: Zoom operation behavior
*For any* zoom operation (in or out), the zoom level should change, and the map center coordinates should remain the same before and after the zoom.
**Validates: Requirements 6.2, 6.5**

### Property 15: Search centers map
*For any* valid location search query that returns a result, the map should center on the result coordinates within a small tolerance (e.g., 0.001 degrees).
**Validates: Requirements 6.3**

### Property 16: Search result marker visibility
*For any* successful location search, a temporary marker should be visible at the result coordinates immediately after the search completes.
**Validates: Requirements 6.4**

### Property 17: Drawing mode activation
*For any* drawing mode activation event, the drawing tools should transition from disabled to enabled state.
**Validates: Requirements 7.1**

### Property 18: Drawing produces valid geometry
*For any* completed drawing operation, the captured geometry should be a valid GeoJSON LineString with at least 2 coordinate points.
**Validates: Requirements 7.2**

### Property 19: Drawing triggers input prompt
*For any* completed drawing operation, the system should display an input form requesting soil type and cable depth before adding the route to the map.
**Validates: Requirements 7.3**

### Property 20: New route addition increases count
*For any* valid new cable route added through drawing tools, the total number of cable routes on the map should increase by exactly one.
**Validates: Requirements 7.4**

### Property 21: Data source locality
*For any* data loading operation during initialization, the data source should be either a static file path or local storage, not an external HTTP endpoint.
**Validates: Requirements 8.2**

### Property 22: No external API calls for core features
*For any* application initialization sequence, the system should not make HTTP requests to external servers for core functionality (map rendering, marker generation, styling).
**Validates: Requirements 8.4**

### Property 23: Graceful API degradation
*For any* optional API feature, when the API is unavailable or returns an error, the core application functionality should continue to work without crashes.
**Validates: Requirements 8.5**

### Property 24: Custom data replacement
*For any* custom GeoJSON file loaded by the user, the previously displayed cable routes should be replaced entirely with the new data.
**Validates: Requirements 9.5**

## Error Handling

### Invalid GeoJSON Data

- **Error**: Malformed GeoJSON structure
- **Handling**: Display user-friendly error message, fall back to sample data, log error to console
- **Validation**: Validate GeoJSON schema before parsing

### Missing Required Properties

- **Error**: Cable route missing `soilType` or `depth` properties
- **Handling**: Use default values (soilType: default color, depth: 0), log warning
- **Validation**: Check for required properties during data loading

### Geometric Calculation Errors

- **Error**: Turf.js throws error during marker generation (e.g., invalid LineString)
- **Handling**: Skip marker generation for that route, log error, continue with other routes
- **Validation**: Validate LineString geometry before processing

### Map Initialization Failure

- **Error**: MapLibre fails to initialize (e.g., WebGL not supported)
- **Handling**: Display fallback message with browser requirements, suggest alternative browsers
- **Validation**: Check for WebGL support before initialization

### Search API Errors

- **Error**: Location search fails or returns no results
- **Handling**: Display "No results found" message, keep current map view
- **Validation**: Handle empty results gracefully

### Drawing Tool Errors

- **Error**: User draws invalid geometry (e.g., single point)
- **Handling**: Display validation message, allow user to redraw
- **Validation**: Validate drawn geometry has minimum 2 points

### File Upload Errors

- **Error**: User uploads non-GeoJSON file or invalid format
- **Handling**: Display error message with format requirements, reject upload
- **Validation**: Validate file type and content before processing

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples, edge cases, and component behavior:

- **Component Rendering**: Test that MapView, PopupComponent, and SearchControl render without errors
- **Data Parsing**: Test GeoJSON parsing with valid and invalid inputs
- **Color Mapping**: Test soil type to color conversion with all three types and invalid types
- **Coordinate Formatting**: Test coordinate formatting with various precision levels
- **Edge Cases**:
  - Cable routes shorter than 30 meters (should have start/end markers only)
  - Empty GeoJSON FeatureCollection (should handle gracefully)
  - Single-point LineString (should be rejected)
  - Coordinates at extreme latitudes/longitudes

**Testing Framework**: Vitest with SolidJS Testing Library

### Property-Based Testing

Property-based tests will verify universal properties across many randomly generated inputs:

- **PBT Library**: fast-check (JavaScript property-based testing library)
- **Test Configuration**: Minimum 100 iterations per property test
- **Tagging Format**: Each test must include comment: `// Feature: underground-cable-map, Property X: [property description]`

**Property Test Coverage**:

1. **Property 1-3**: Cable rendering and bounds calculation with random GeoJSON inputs
2. **Property 4-5**: Color mapping with random soil types including invalid values
3. **Property 6-7**: Marker generation with random LineString geometries of varying lengths
4. **Property 8-11**: Popup behavior with random feature selections
5. **Property 12-16**: Map interaction (pan, zoom, search) with random coordinates and zoom levels
6. **Property 17-20**: Drawing tools with random LineString geometries
7. **Property 21-24**: Data loading and replacement with random GeoJSON datasets

**Generator Strategies**:
- Generate random valid GeoJSON LineStrings with 2-20 coordinate points
- Generate random soil types including valid and invalid values
- Generate random coordinates within realistic bounds (e.g., Indonesia region)
- Generate random depth values (0.5 to 5.0 meters)
- Generate random zoom levels (1-20)
- Generate short LineStrings (<30m) to test edge cases

### Integration Testing

Integration tests will verify end-to-end workflows:

- Load sample data → verify map displays routes with correct colors and markers
- Click cable route → verify popup appears with correct information
- Search for location → verify map centers and marker appears
- Activate drawing mode → draw route → enter properties → verify route added
- Load custom GeoJSON → verify old data replaced with new data

### Manual Testing Checklist

- Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on mobile devices (iOS Safari, Android Chrome)
- Test responsive behavior at various screen sizes
- Test touch gestures on mobile (pinch-zoom, drag-pan)
- Verify visual appearance of colors, markers, and popups
- Test performance with large datasets (100+ cable routes)

## Implementation Notes

### MapLibre GL JS Integration with SolidJS

Use `onMount` and `onCleanup` lifecycle hooks for proper map initialization and cleanup:

```typescript
onMount(() => {
  const map = new maplibregl.Map({
    container: mapContainer,
    style: 'maplibre-style.json',
    center: [106.827, -6.175],
    zoom: 12
  });
  
  map.on('load', () => {
    // Add sources and layers
  });
  
  onCleanup(() => {
    map.remove();
  });
});
```

### Data-Driven Styling Expression

```javascript
{
  'line-color': [
    'match',
    ['get', 'soilType'],
    'Pasir', '#FFFF00',      // Yellow
    'Tanah Liat', '#8B4513', // Brown
    'Batuan', '#808080',     // Gray
    '#000000'                // Default black
  ],
  'line-width': 3
}
```

### Marker Generation with Turf.js

```typescript
function generateMarkers(lineString: Feature<LineString>, interval: number = 30) {
  const length = turf.length(lineString, { units: 'meters' });
  const markers: Feature<Point>[] = [];
  
  for (let distance = 0; distance <= length; distance += interval) {
    const point = turf.along(lineString, distance, { units: 'meters' });
    markers.push(point);
  }
  
  return turf.featureCollection(markers);
}
```

### Responsive Design Breakpoints

- **Mobile**: < 768px (single column, larger touch targets)
- **Tablet**: 768px - 1024px (adjusted controls)
- **Desktop**: > 1024px (full layout with sidebars)

### Performance Optimization

- Use MapLibre's built-in clustering for large numbers of markers
- Implement virtual scrolling for cable route lists
- Lazy load drawing tools only when activated
- Debounce search input to reduce unnecessary operations
- Use `requestAnimationFrame` for smooth animations

## Deployment Considerations

### Build Configuration

- Vite production build with code splitting
- Minification and tree-shaking enabled
- Source maps for debugging (optional)

### Static Hosting

Application can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

### Browser Requirements

- Modern browsers with WebGL support
- Minimum: Chrome 80+, Firefox 78+, Safari 13+, Edge 80+
- Mobile: iOS 13+, Android 8+

### Asset Management

- Bundle MapLibre GL JS styles and sprites
- Include sample GeoJSON data in public directory
- Optimize marker icons and UI assets
- Consider CDN for MapLibre GL JS library (optional)
