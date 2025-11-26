# Implementation Plan

- [x] 1. Set up SolidJS project structure and dependencies









  - Initialize Vite + SolidJS project
  - Install MapLibre GL JS, Turf.js, and MapLibre GL Draw
  - Configure TypeScript with proper types for MapLibre and Turf
  - Set up CSS framework (Tailwind CSS) for responsive design
  - Create basic project folder structure (components, services, types, data)
  - _Requirements: 8.1_

- [x] 2. Define TypeScript interfaces and data models




  - Create types for CableProperties, MarkerProperties, SoilType
  - Define GeoJSON type interfaces (CableFeature, CableFeatureCollection)
  - Create type definitions for component props and state
  - _Requirements: 1.2, 2.1, 3.1, 4.1_

- [x] 3. Create sample GeoJSON data file





  - Create sample data with 3-5 cable routes covering different soil types
  - Include routes with Pasir, Tanah Liat, and Batuan soil types
  - Add realistic coordinates (Indonesia region), depth values, and route names
  - Place sample data in public/data directory
  - _Requirements: 9.1, 9.2_

- [x] 4. Implement StyleEngine service






  - [x] 4.1 Create StyleEngine service with soil type color mapping



    - Implement getSoilTypeColor function (Pasir→yellow, Tanah Liat→brown, Batuan→gray)
    - Implement getCableLineStyle with data-driven styling expressions
    - Implement getMarkerStyle for flag icon styling
    - Handle invalid/missing soil types with default color
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 4.2 Write property test for soil type color mapping






    - **Property 4: Soil type color mapping**
    - **Validates: Requirements 2.1, 2.2, 2.3**
  
  - [x] 4.3 Write property test for invalid soil type handling





    - **Property 5: Invalid soil type default handling**
    - **Validates: Requirements 2.4**

- [x] 5. Implement MarkerGenerator service




  - [x] 5.1 Create MarkerGenerator service with Turf.js integration


    - Implement generateMarkers function using turf.along() for 30m intervals
    - Implement calculateTotalDistance using turf.length()
    - Handle edge case: routes shorter than 30 meters (start/end markers only)
    - Add marker properties (cableId, soilType, depth, distanceFromStart)
    - _Requirements: 3.1, 3.4, 3.5_
  
  - [x] 5.2 Write property test for marker interval consistency














    - **Property 6: Marker interval consistency**
    - **Validates: Requirements 3.1**
  
  - [x] 5.3 Write property test for marker independence






    - **Property 7: Marker independence across routes**
    - **Validates: Requirements 3.5**
  
  - [x] 5.4 Write unit tests for edge cases






    - Test routes shorter than 30 meters
    - Test single-segment LineStrings
    - Test very long routes (>1km)
    - _Requirements: 3.4_

- [x] 6. Create MapView component




  - [x] 6.1 Implement MapView component with MapLibre initialization


    - Set up map container with ref
    - Initialize MapLibre map in onMount with proper cleanup in onCleanup
    - Configure map options (center, zoom, style)
    - Add map load event handler
    - _Requirements: 1.1, 8.1_
  
  - [x] 6.2 Implement cable route rendering

    - Add GeoJSON source for cable routes
    - Add line layer with data-driven styling from StyleEngine
    - Implement fitBounds to show all routes on load
    - Parse and validate GeoJSON data before rendering
    - _Requirements: 1.2, 1.4, 2.5_
  
  - [ ]* 6.3 Write property test for cable route rendering
    - **Property 1: Cable route rendering completeness**
    - **Validates: Requirements 1.1, 1.2**
  
  - [ ]* 6.4 Write property test for GeoJSON parsing
    - **Property 2: GeoJSON parsing round-trip**
    - **Validates: Requirements 1.2**
  
  - [ ]* 6.5 Write property test for map bounds
    - **Property 3: Map bounds contain all routes**
    - **Validates: Requirements 1.4**
  
  - [x] 6.6 Implement marker rendering

    - Generate markers using MarkerGenerator service
    - Add GeoJSON source for markers
    - Add symbol layer with flag icon styling
    - Update markers when cable data changes
    - _Requirements: 3.1, 3.3, 3.5_
  
  - [x] 6.7 Implement click event handlers for routes and markers

    - Add click event listener for cable line layer
    - Add click event listener for marker layer
    - Extract feature properties and coordinates on click
    - Emit onFeatureClick event to parent component
    - _Requirements: 4.1, 4.2_

- [x] 7. Create PopupComponent





  - [x] 7.1 Implement PopupComponent with information display


    - Create popup UI with soil type, depth, and coordinates
    - Format coordinates with at least 6 decimal places
    - Format depth with unit indicator ("m" or "meters")
    - Add close button functionality
    - Style popup for mobile and desktop
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 7.2 Write property test for popup content completeness
    - **Property 8: Popup content completeness**
    - **Validates: Requirements 4.1, 4.2**
  
  - [ ]* 7.3 Write property test for coordinate formatting
    - **Property 9: Coordinate formatting precision**
    - **Validates: Requirements 4.3**
  
  - [ ]* 7.4 Write property test for depth unit display
    - **Property 10: Depth unit display**
    - **Validates: Requirements 4.4**
  
  - [x] 7.5 Integrate popup with MapView


    - Show popup on feature click
    - Position popup at click coordinates
    - Ensure only one popup is visible at a time
    - Close popup when clicking elsewhere on map
    - _Requirements: 4.5_
  
  - [ ]* 7.6 Write property test for single popup constraint
    - **Property 11: Single popup constraint**
    - **Validates: Requirements 4.5**

- [x] 8. Implement map navigation controls




  - [x] 8.1 Add pan and zoom functionality


    - Enable MapLibre's built-in navigation controls
    - Implement programmatic pan method
    - Implement programmatic zoom method
    - Ensure center point maintained during zoom
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [ ]* 8.2 Write property test for pan operation
    - **Property 13: Pan operation updates center**
    - **Validates: Requirements 6.1**
  
  - [ ]* 8.3 Write property test for zoom operation
    - **Property 14: Zoom operation behavior**
    - **Validates: Requirements 6.2, 6.5**

- [x] 9. Create SearchControl component




  - [x] 9.1 Implement SearchControl with location search


    - Create search input UI component
    - Implement geocoding/search functionality (using Nominatim or similar free API)
    - Handle search query submission
    - Center map on search result coordinates
    - Add temporary marker at search result location
    - Handle "no results found" case gracefully
    - _Requirements: 6.3, 6.4_
  
  - [ ]* 9.2 Write property test for search centering
    - **Property 15: Search centers map**
    - **Validates: Requirements 6.3**
  
  - [ ]* 9.3 Write property test for search result marker
    - **Property 16: Search result marker visibility**
    - **Validates: Requirements 6.4**

- [x] 10. Implement responsive design




  - [x] 10.1 Add responsive CSS and layout


    - Create mobile-first responsive layout
    - Define breakpoints (mobile <768px, tablet 768-1024px, desktop >1024px)
    - Style map container to fill viewport on all screen sizes
    - Make controls and popups touch-friendly on mobile
    - Test layout at various viewport sizes
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 10.2 Write property test for responsive resize
    - **Property 12: Responsive map resize**
    - **Validates: Requirements 5.3**

- [x] 11. Implement data loading and management





  - [x] 11.1 Create data loading service


    - Implement function to load GeoJSON from static file
    - Implement function to load GeoJSON from local storage
    - Add GeoJSON validation before parsing
    - Handle loading errors gracefully with fallback to sample data
    - Ensure no external API calls for core functionality
    - _Requirements: 8.2, 8.4_
  
  - [ ]* 11.2 Write property test for data source locality
    - **Property 21: Data source locality**
    - **Validates: Requirements 8.2**
  
  - [ ]* 11.3 Write property test for no external API calls
    - **Property 22: No external API calls for core features**
    - **Validates: Requirements 8.4**
  
  - [x] 11.4 Implement custom data upload functionality


    - Add file input for custom GeoJSON upload
    - Validate uploaded file format
    - Replace current cable data with uploaded data
    - Update map to show new data
    - _Requirements: 9.5_
  
  - [ ]* 11.5 Write property test for custom data replacement
    - **Property 24: Custom data replacement**
    - **Validates: Requirements 9.5**

- [x] 12. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement DrawingTools component (optional feature)





  - [x] 13.1 Integrate MapLibre GL Draw


    - Install and configure MapLibre GL Draw library
    - Create DrawingTools component wrapper
    - Add drawing mode toggle button
    - Enable line drawing mode when activated
    - _Requirements: 7.1_
  
  - [ ]* 13.2 Write property test for drawing mode activation
    - **Property 17: Drawing mode activation**
    - **Validates: Requirements 7.1**
  
  - [x] 13.3 Implement drawing completion handler

    - Capture drawn LineString geometry on draw.create event
    - Validate geometry has at least 2 points
    - Show input form for soil type and depth
    - _Requirements: 7.2, 7.3_
  
  - [ ]* 13.4 Write property test for drawing geometry validation
    - **Property 18: Drawing produces valid geometry**
    - **Validates: Requirements 7.2**
  
  - [ ]* 13.5 Write property test for input prompt trigger
    - **Property 19: Drawing triggers input prompt**
    - **Validates: Requirements 7.3**
  

  - [x] 13.6 Implement new route addition





    - Create new CableFeature from drawn geometry and user input
    - Add new feature to cable data
    - Update map to render new route with styling
    - Generate markers for new route
    - _Requirements: 7.4, 7.5_
  
  - [ ]* 13.7 Write property test for route count increase
    - **Property 20: New route addition increases count**
    - **Validates: Requirements 7.4**

- [x] 14. Implement error handling





  - Add try-catch blocks for GeoJSON parsing
  - Handle MapLibre initialization failures (WebGL check)
  - Handle Turf.js calculation errors
  - Display user-friendly error messages
  - Log errors to console for debugging
  - Implement graceful degradation for optional features
  - _Requirements: 8.5_

- [ ]* 14.1 Write property test for graceful API degradation
  - **Property 23: Graceful API degradation**
  - **Validates: Requirements 8.5**

- [x] 15. Create App root component



  - [x] 15.1 Implement App component with state management


    - Set up application state (cableData, selectedFeature, isDrawingMode)
    - Load initial sample data on mount
    - Compose MapView, PopupComponent, SearchControl, and DrawingTools
    - Handle feature selection and popup display
    - Implement responsive layout structure
    - _Requirements: 1.1, 5.1, 5.2_
  
  - [x] 15.2 Add application header and controls


    - Create header with app title
    - Add data upload button
    - Add drawing mode toggle (if optional feature enabled)
    - Style header for mobile and desktop
    - _Requirements: 5.1, 5.2, 9.5_

- [x] 16. Final checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Create production build configuration




  - Configure Vite for production build
  - Enable code splitting and minification
  - Optimize bundle size
  - Test production build locally
  - _Requirements: 8.1_
