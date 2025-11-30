import { onMount, onCleanup, createEffect, createSignal } from 'solid-js';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { MapViewProps } from '../types';
import { StyleEngine } from '../services/StyleEngine';
import { markerGenerator } from '../services/MarkerGenerator';
import type { Feature, LineString, Point } from 'geojson';
import type { CableProperties, MarkerProperties } from '../types';

/**
 * MapView Component
 * 
 * Renders an interactive map with cable routes and markers using MapLibre GL JS.
 * Handles map initialization, data rendering, and user interactions.
 * 
 * Requirements: 1.1, 1.2, 1.4, 2.5, 3.1, 3.3, 3.5, 4.1, 4.2, 6.1, 6.2, 6.5, 8.1, 8.5
 */
export function MapView(props: MapViewProps) {
  let mapContainer: HTMLDivElement | undefined;
  let map: maplibregl.Map | undefined;
  const [initError, setInitError] = createSignal<string | null>(null);

  onMount(() => {
    if (!mapContainer) return;

    // Check for WebGL support before initializing map - Requirement 8.5
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        const errorMsg = 'WebGL is not supported in your browser. Please use a modern browser with WebGL support (Chrome 80+, Firefox 78+, Safari 13+, Edge 80+).';
        setInitError(errorMsg);
        console.error('MapLibre initialization failed:', errorMsg);
        return;
      }
    } catch (e) {
      const errorMsg = 'WebGL is not supported in your browser. Please use a modern browser with WebGL support (Chrome 80+, Firefox 78+, Safari 13+, Edge 80+).';
      setInitError(errorMsg);
      console.error('MapLibre initialization failed:', errorMsg);
      return;
    }

    try {
      // Initialize MapLibre map - Requirements 1.1, 8.1
      map = new maplibregl.Map({
      container: mapContainer,
      style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=4Iyrc6TBGKphNJNy3iTH',
      center: [106.827, -6.175], // Jakarta, Indonesia
      zoom: 22,
      pitch: 70,
      bearing: 0, 
      attributionControl: false,
      hash: false,
      localIdeographFontFamily: 'Noto Sans'
    });

    // Add built-in navigation controls - Requirements 6.1, 6.2, 8.1
    const navigationControl = new maplibregl.NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: false
    });
    map.addControl(navigationControl, 'top-right');

      // Add map load event handler
      map.on('load', () => {
        if (!map) return;

        try {
          // Notify parent component that map is loaded
          props.onMapLoad(map);

          // Render cable routes and markers
          renderCableRoutes();
          renderMarkers();
          fitBoundsToRoutes();
        } catch (error) {
          console.error('Error during map initialization:', error);
          setInitError('Failed to initialize map layers. Please refresh the page.');
        }
      });

      // Handle map errors - Requirement 8.5
      map.on('error', (e) => {
        console.error('Map error:', e.error);
        // Don't show error to user for minor map errors, just log them
      });

      // Add general map click handler - Requirement 4.5
      // This fires when clicking on the map but NOT on features
      map.on('click', (e) => {
        if (!map) return;
        
        try {
          // Check if layers exist before querying
          const layersToQuery = [];
          if (map.getLayer('cable-routes')) {
            layersToQuery.push('cable-routes');
          }
          if (map.getLayer('cable-markers')) {
            layersToQuery.push('cable-markers');
          }
          
          // Only query if layers exist
          if (layersToQuery.length > 0) {
            const features = map.queryRenderedFeatures(e.point, {
              layers: layersToQuery
            });
            
            // If no features were clicked, call the onMapClick handler
            if (features.length === 0 && props.onMapClick) {
              props.onMapClick();
            }
          } else {
            // No layers exist yet, just call onMapClick
            if (props.onMapClick) {
              props.onMapClick();
            }
          }
        } catch (error) {
          console.error('Error handling map click:', error);
        }
      });

      // Cleanup on component unmount
      onCleanup(() => {
        if (map) {
          map.remove();
          map = undefined;
        }
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to initialize map';
      setInitError(`Map initialization failed: ${errorMsg}`);
      console.error('MapLibre initialization error:', error);
    }
  });

  // Re-render when cable data changes
  createEffect(() => {
    // Track props.kmlFiles to trigger re-render
    const files = props.kmlFiles;
    console.log('MapView createEffect triggered, KML files count:', files.length);
    
    if (map && map.loaded()) {
      console.log('Map is loaded, re-rendering...');
      renderCableRoutes();
      renderMarkers();
      fitBoundsToRoutes();
    }
  });

  // Expose programmatic control methods - Requirements 6.1, 6.2, 6.5
  createEffect(() => {
    if (props.ref && map) {
      props.ref({
        /**
         * Pan to specific coordinates
         * Requirement 6.1: Implement programmatic pan method
         */
        panTo: (coordinates: [number, number], options?: { duration?: number }) => {
          if (!map) return;
          map.panTo(coordinates, {
            duration: options?.duration ?? 1000
          });
        },

        /**
         * Zoom to specific level
         * Requirements 6.2, 6.5: Implement programmatic zoom method, maintain center point
         */
        zoomTo: (zoomLevel: number, options?: { duration?: number }) => {
          if (!map) return;
          map.zoomTo(zoomLevel, {
            duration: options?.duration ?? 1000
          });
        },

        /**
         * Pan by pixel offset
         * Requirement 6.1: Implement programmatic pan method
         */
        panBy: (offset: [number, number]) => {
          if (!map) return;
          map.panBy(offset);
        },

        /**
         * Get current map center
         */
        getCenter: () => {
          if (!map) return null;
          const center = map.getCenter();
          return [center.lng, center.lat];
        },

        /**
         * Get current zoom level
         */
        getZoom: () => {
          if (!map) return null;
          return map.getZoom();
        }
      });
    }
  });

  /**
   * Render cable routes on the map
   * Requirements: 1.2, 1.4, 2.5, 8.5
   */
  function renderCableRoutes() {
    if (!map) return;

    try {
      console.log('renderCableRoutes called, KML files:', props.kmlFiles.length);
      
      // Combine all features from all KML files
      const allFeatures: Feature<LineString | Point, CableProperties>[] = [];
      props.kmlFiles.forEach(kmlFile => {
        allFeatures.push(...kmlFile.data.features);
      });
      
      console.log('Rendering', allFeatures.length, 'total features from all KML files');

      // Separate LineString features for cable routes rendering
      const lineFeatures = allFeatures.filter(f => f.geometry.type === 'LineString');
      console.log(`  - Rendering ${lineFeatures.length} LineString cable routes`);

      // Remove existing source and layer if they exist
      if (map.getLayer('cable-routes')) {
        map.removeLayer('cable-routes');
      }
      if (map.getLayer('segment-labels')) {
        map.removeLayer('segment-labels');
      }
      if (map.getSource('cables')) {
        map.removeSource('cables');
      }
      if (map.getSource('segment-midpoints')) {
        map.removeSource('segment-midpoints');
      }

      // Only add cable routes layer if there are LineString features
      if (lineFeatures.length > 0) {
        // Add GeoJSON source for cable routes (LineStrings only)
        map.addSource('cables', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: lineFeatures
          }
        });

        // Add line layer with data-driven styling from StyleEngine
        const lineStyle = StyleEngine.getCableLineStyle();
        map.addLayer(lineStyle);
        
        // Add segment distance labels
        renderSegmentLabels();

        // Add click event handler for cable routes - Requirements 4.1, 4.2
        map.on('click', 'cable-routes', (e) => {
          try {
            if (!e.features || e.features.length === 0) return;

            const feature = e.features[0] as any;
            const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
            const screenPosition = { x: e.point.x, y: e.point.y };
            
            props.onFeatureClick(feature as Feature<LineString, CableProperties>, coordinates, screenPosition);
          } catch (error) {
            console.error('Error handling cable route click:', error);
          }
        });

        // Change cursor on hover
        map.on('mouseenter', 'cable-routes', () => {
          if (map) map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'cable-routes', () => {
          if (map) map.getCanvas().style.cursor = '';
        });
      }
    } catch (error) {
      console.error('Error rendering cable routes:', error);
      // Continue execution - don't break the app
    }
  }

  /**
   * Render segment distance labels on the map
   */
  function renderSegmentLabels() {
    if (!map) return;

    try {
      // Create point features at the midpoint of each segment with distance labels
      const labelFeatures: Feature<Point, any>[] = [];
      
      // Combine all features from all KML files
      props.kmlFiles.forEach(kmlFile => {
        kmlFile.data.features.forEach((cableFeature) => {
          const segments = cableFeature.properties.segments;
          if (!segments || segments.length === 0) return;
        
        segments.forEach((segment, index) => {
          // Calculate midpoint
          const [lon1, lat1] = segment.startPoint;
          const [lon2, lat2] = segment.endPoint;
          const midLon = (lon1 + lon2) / 2;
          const midLat = (lat1 + lat2) / 2;
          
          // Format distance
          let distanceText = '';
          if (segment.distance < 1) {
            distanceText = `${(segment.distance * 100).toFixed(0)}cm`;
          } else if (segment.distance < 1000) {
            distanceText = `${segment.distance.toFixed(1)}m`;
          } else {
            distanceText = `${(segment.distance / 1000).toFixed(2)}km`;
          }
          
          const labelFeature: Feature<Point, any> = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [midLon, midLat]
            },
            properties: {
              distance: distanceText,
              cableId: cableFeature.properties.id,
              segmentIndex: index
            }
          };
          
          labelFeatures.push(labelFeature);
        });
      });
      });
      
      // Add source for segment labels
      map.addSource('segment-midpoints', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: labelFeatures
        }
      });
      
      // Add symbol layer for distance labels
      map.addLayer({
        id: 'segment-labels',
        type: 'symbol',
        source: 'segment-midpoints',
        minzoom: 16, // Only show labels at high zoom levels
        layout: {
          'text-field': ['get', 'distance'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 11,
          'text-offset': [0, 0],
          'text-anchor': 'center',
          'text-allow-overlap': false,
          'text-ignore-placement': false
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 2,
          'text-halo-blur': 1
        }
      });
      
      console.log(`✓ Rendered ${labelFeatures.length} segment distance labels`);
    } catch (error) {
      console.error('Error rendering segment labels:', error);
    }
  }

  /**
   * Render markers on the map
   * Requirements: 3.1, 3.3, 3.5, 8.5
   */
  function renderMarkers() {
    if (!map) return;

    try {
      // Generate markers for all cable routes from all KML files - Requirements 3.1, 3.5
      const allMarkers: Feature<Point, MarkerProperties>[] = [];
      
      props.kmlFiles.forEach(kmlFile => {
        kmlFile.data.features.forEach((cableFeature) => {
          try {
          // Check if this is already a Point feature from KML
          if (cableFeature.geometry.type === 'Point') {
            // Convert CableProperties to MarkerProperties for Point features
            const pointMarker: Feature<Point, MarkerProperties> = {
              type: 'Feature',
              geometry: cableFeature.geometry,
              properties: {
                ...cableFeature.properties,
                cableId: cableFeature.properties.id,
                cableName: cableFeature.properties.name || cableFeature.properties.id,
                distanceFromStart: 0
              }
            };
            allMarkers.push(pointMarker);
          } else if (cableFeature.geometry.type === 'LineString') {
            // Generate markers along LineString - Requirement 8.5
            const markers = markerGenerator.generateMarkers(cableFeature as Feature<LineString, CableProperties>, 30);
            allMarkers.push(...markers.features);
          }
        } catch (error) {
          console.error(`Error generating markers for cable ${cableFeature.properties.id}:`, error);
          // Continue with other routes - graceful degradation
        }
      });
      });

      const markerCollection = {
        type: 'FeatureCollection' as const,
        features: allMarkers
      };

      console.log(`✓ Rendering ${allMarkers.length} markers on map`);

      // Remove existing marker source and layer if they exist
      if (map.getLayer('cable-markers')) {
        map.removeLayer('cable-markers');
      }
      if (map.getSource('markers')) {
        map.removeSource('markers');
      }

      // Add GeoJSON source for markers
      map.addSource('markers', {
        type: 'geojson',
        data: markerCollection
      });

      // Add circle layer for markers - Requirement 3.3
      const markerStyle = StyleEngine.getMarkerStyle();
      map.addLayer(markerStyle);

      // Add click event handler for markers - Requirements 4.1, 4.2
      map.on('click', 'cable-markers', (e) => {
        try {
          if (!e.features || e.features.length === 0) return;

          const feature = e.features[0] as any;
          const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
          const screenPosition = { x: e.point.x, y: e.point.y };
          
          props.onFeatureClick(feature as Feature<Point, MarkerProperties>, coordinates, screenPosition);
        } catch (error) {
          console.error('Error handling marker click:', error);
        }
      });

      // Change cursor on hover
      map.on('mouseenter', 'cable-markers', () => {
        if (map) map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'cable-markers', () => {
        if (map) map.getCanvas().style.cursor = '';
      });
    } catch (error) {
      console.error('Error rendering markers:', error);
      // Continue execution - don't break the app
    }
  }

  /**
   * Fit map bounds to show all cable routes
   * Requirements: 1.4, 8.5
   */
  function fitBoundsToRoutes() {
    if (!map || props.kmlFiles.length === 0) {
      return;
    }

    try {
      // Calculate bounds from all cable route coordinates from all KML files
      const bounds = new maplibregl.LngLatBounds();
      
      props.kmlFiles.forEach(kmlFile => {
        kmlFile.data.features.forEach((feature) => {
          if (feature.geometry.type === 'LineString') {
            // Handle LineString: iterate through all coordinates
            feature.geometry.coordinates.forEach((coord) => {
              bounds.extend(coord as [number, number]);
            });
          } else if (feature.geometry.type === 'Point') {
            // Handle Point: extend bounds with the single coordinate
            bounds.extend(feature.geometry.coordinates as [number, number]);
          }
        });
      });

      // Fit map to bounds with padding
      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    } catch (error) {
      console.error('Error fitting bounds:', error);
      // Continue execution - don't break the app
    }
  }

  return (
    <>
      {/* Display error message if map initialization failed - Requirement 8.5 */}
      {initError() && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          'background-color': '#fff',
          padding: '20px',
          'border-radius': '8px',
          'box-shadow': '0 2px 10px rgba(0,0,0,0.1)',
          'max-width': '400px',
          'text-align': 'center',
          'z-index': 1000
        }}>
          <div style={{ 'font-size': '48px', 'margin-bottom': '10px' }}>⚠️</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#d32f2f' }}>Map Initialization Failed</h3>
          <p style={{ margin: '0', color: '#666' }}>{initError()}</p>
        </div>
      )}
      
      <div 
        ref={mapContainer} 
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          /* Ensure map fills viewport on all screen sizes - Requirement 5.3 */
          'touch-action': 'none' /* Enable smooth touch gestures - Requirement 5.4 */
        }}
      />
    </>
  );
}
