import { createSignal, onMount, Show } from 'solid-js';
import { MapView } from './components/MapView';
import { PopupComponent } from './components/PopupComponent';
import { SearchControl } from './components/SearchControl';
import { DrawingTools } from './components/DrawingTools';
import { DataLoader } from './services/DataLoader';
import type { CableFeatureCollection, MapViewMethods, SoilType } from './types';
import type { Feature, LineString, Point } from 'geojson';
import type { CableProperties, MarkerProperties } from './types';
import maplibregl from 'maplibre-gl';
import './App.css';
import './components/DrawingTools.css';

function App() {
  const [cableData, setCableData] = createSignal<CableFeatureCollection>({
    type: 'FeatureCollection',
    features: []
  });
  const [selectedFeature, setSelectedFeature] = createSignal<Feature<LineString | Point, CableProperties | MarkerProperties> | null>(null);
  const [popupCoordinates, setPopupCoordinates] = createSignal<[number, number] | null>(null);
  const [popupPosition, setPopupPosition] = createSignal<{ x: number; y: number } | null>(null);
  const [mapMethods, setMapMethods] = createSignal<MapViewMethods | null>(null);
  const [searchMarker, setSearchMarker] = createSignal<maplibregl.Marker | null>(null);
  const [uploadError, setUploadError] = createSignal<string | null>(null);
  const [isDrawingMode, setIsDrawingMode] = createSignal(false);
  const [drawnFeature, setDrawnFeature] = createSignal<Feature<LineString> | null>(null);
  const [showInputForm, setShowInputForm] = createSignal(false);
  let mapInstance: maplibregl.Map | null = null;
  let fileInputRef: HTMLInputElement | undefined;

  // Load cable data on mount (from local storage or sample data)
  // Requirements: 8.2, 8.4, 8.5
  onMount(async () => {
    try {
      const data = await DataLoader.loadCableData();
      setCableData(data);
    } catch (error) {
      // Handle errors gracefully - Requirement 8.5
      // Log errors to console for debugging
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading cable data:', errorMsg);
      
      // Display user-friendly error message
      console.warn('Unable to load cable data. The map will be displayed without cable routes.');
      
      // Fallback to empty feature collection - graceful degradation
      setCableData({
        type: 'FeatureCollection',
        features: []
      });
    }
  });

  const handleFeatureClick = (feature: Feature<LineString | Point, CableProperties | MarkerProperties>, coordinates: [number, number], screenPosition: { x: number; y: number }) => {
    // Requirement 4.5: Ensure only one popup is visible at a time
    setSelectedFeature(feature);
    setPopupCoordinates(coordinates);
    setPopupPosition(screenPosition);
  };

  const handleClosePopup = () => {
    // Requirement 4.5: Close popup
    setSelectedFeature(null);
    setPopupCoordinates(null);
    setPopupPosition(null);
  };

  const handleMapLoad = (map: maplibregl.Map) => {
    console.log('Map loaded successfully');
    mapInstance = map;
  };

  /**
   * Handle location selection from search
   * Requirements 6.3, 6.4: Center map and add temporary marker
   */
  const handleLocationSelect = (coordinates: [number, number]) => {
    // Remove existing search marker if present
    const existingMarker = searchMarker();
    if (existingMarker) {
      existingMarker.remove();
    }

    // Center map on search result - Requirement 6.3
    const methods = mapMethods();
    if (methods) {
      methods.panTo(coordinates, { duration: 1000 });
      methods.zoomTo(14, { duration: 1000 });
    }

    // Add temporary marker at search result location - Requirement 6.4
    if (mapInstance) {
      const marker = new maplibregl.Marker({
        color: '#FF6B6B',
        scale: 1.2
      })
        .setLngLat(coordinates)
        .addTo(mapInstance);

      setSearchMarker(marker);
    }
  };

  const handleMapClick = () => {
    // Requirement 4.5: Close popup when clicking elsewhere on map
    handleClosePopup();
  };

  /**
   * Handle custom data upload
   * Requirements: 9.5, 8.5
   */
  const handleFileUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    // Validate file type
    if (!file.name.endsWith('.json') && !file.name.endsWith('.geojson')) {
      setUploadError('Please upload a valid JSON or GeoJSON file');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadError('File is too large. Maximum size is 10MB.');
      return;
    }

    try {
      setUploadError(null);
      
      // Load and validate the file - Requirement 8.5
      const data = await DataLoader.loadFromFile(file);
      
      // Replace current cable data with uploaded data - Requirement 9.5
      setCableData(data);
      
      // Save to local storage for persistence
      try {
        DataLoader.saveToLocalStorage(data);
      } catch (saveError) {
        // Handle save errors gracefully - Requirement 8.5
        console.warn('Failed to save to local storage:', saveError);
        // Continue anyway - data is still loaded in memory
      }
      
      // Close popup if open
      handleClosePopup();
      
      // Fit map bounds to show new data
      const methods = mapMethods();
      if (methods && data.features.length > 0) {
        // The MapView component will handle fitBounds on data change
      }
      
      console.log('Custom data loaded successfully');
    } catch (error) {
      // Handle errors gracefully - Requirement 8.5
      // Display user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to load file';
      setUploadError(errorMessage);
      
      // Log errors to console for debugging
      console.error('Error uploading file:', error);
    } finally {
      // Reset file input
      if (input) {
        input.value = '';
      }
    }
  };

  /**
   * Trigger file input click
   */
  const handleUploadClick = () => {
    fileInputRef?.click();
  };

  /**
   * Toggle drawing mode
   * Requirement 7.1: Enable line drawing tools on the map
   */
  const handleDrawingToggle = () => {
    const newMode = !isDrawingMode();
    setIsDrawingMode(newMode);
    
    // Close popup when entering drawing mode
    if (newMode) {
      handleClosePopup();
    }
  };

  /**
   * Handle drawing completion
   * Requirements 7.2, 7.3: Capture geometry and prompt for input
   */
  const handleDrawComplete = (feature: Feature<LineString>) => {
    // Store the drawn feature
    setDrawnFeature(feature);
    
    // Show input form for soil type and depth - Requirement 7.3
    setShowInputForm(true);
    
    // Exit drawing mode
    setIsDrawingMode(false);
  };

  /**
   * Handle drawing cancellation
   */
  const handleDrawCancel = () => {
    setIsDrawingMode(false);
    setDrawnFeature(null);
    setShowInputForm(false);
  };

  /**
   * Handle new route submission
   * Requirements: 7.4, 7.5, 8.5
   */
  const handleRouteSubmit = (soilType: SoilType, depth: number) => {
    const feature = drawnFeature();
    if (!feature) return;

    try {
      // Create new CableFeature from drawn geometry and user input - Requirement 7.4
      const newCableFeature: Feature<LineString, CableProperties> = {
        type: 'Feature',
        geometry: feature.geometry,
        properties: {
          id: `cable-${Date.now()}`,
          soilType,
          depth,
          name: `New Cable Route ${Date.now()}`
        }
      };

      // Add new feature to cable data - Requirement 7.4
      const currentData = cableData();
      const updatedData: CableFeatureCollection = {
        type: 'FeatureCollection',
        features: [...currentData.features, newCableFeature]
      };

      setCableData(updatedData);
      
      // Save to local storage for persistence
      try {
        DataLoader.saveToLocalStorage(updatedData);
      } catch (saveError) {
        // Handle save errors gracefully - Requirement 8.5
        console.warn('Failed to save to local storage:', saveError);
        // Continue anyway - data is still loaded in memory
      }

      // Clean up
      setDrawnFeature(null);
      setShowInputForm(false);
      
      console.log('New cable route added successfully');
    } catch (error) {
      // Handle errors gracefully - Requirement 8.5
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error adding new route:', errorMsg);
      setUploadError('Failed to add new route. Please try again.');
    }
  };

  return (
    <div class="app-container">
      {/* Header with upload button - Requirement 9.5 */}
      <header class="app-header">
        <h1 class="app-title">Underground Cable Map</h1>
        <div class="header-controls">
          <button 
            class="upload-button"
            onClick={handleUploadClick}
            title="Upload custom GeoJSON data"
          >
            📁 Upload Data
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.geojson"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <button 
            class={`upload-button ${isDrawingMode() ? 'active' : ''}`}
            onClick={handleDrawingToggle}
            title="Draw new cable route"
          >
            ✏️ {isDrawingMode() ? 'Cancel Drawing' : 'Draw Route'}
          </button>
        </div>
      </header>

      {/* Error message for upload failures */}
      <Show when={uploadError()}>
        <div class="upload-error">
          <span>⚠️ {uploadError()}</span>
          <button onClick={() => setUploadError(null)}>✕</button>
        </div>
      </Show>

      <div class="map-wrapper">
        <MapView 
          cableData={cableData()} 
          onFeatureClick={handleFeatureClick}
          onMapLoad={handleMapLoad}
          onMapClick={handleMapClick}
          ref={setMapMethods}
        />
        
        {/* Drawing tools - Requirements: 7.1, 7.2, 7.3 */}
        <DrawingTools 
          map={mapInstance}
          isActive={isDrawingMode()}
          onDrawComplete={handleDrawComplete}
          onCancel={handleDrawCancel}
        />
      </div>
      
      {/* Search control - Requirements: 6.3, 6.4 */}
      <SearchControl onLocationSelect={handleLocationSelect} />
      
      {/* Popup overlay - Requirements: 4.1, 4.2, 4.5 */}
      <Show when={selectedFeature() && popupCoordinates() && popupPosition()}>
        <div
          style={{
            position: 'absolute',
            left: `${popupPosition()!.x}px`,
            top: `${popupPosition()!.y}px`,
            transform: 'translate(-50%, -100%)',
            'margin-top': '-10px',
            'pointer-events': 'none'
          }}
        >
          <PopupComponent
            feature={selectedFeature()!}
            coordinates={popupCoordinates()!}
            onClose={handleClosePopup}
          />
        </div>
      </Show>

      {/* Drawing input form - Requirement 7.3 */}
      <Show when={showInputForm()}>
        <DrawingInputForm
          onSubmit={handleRouteSubmit}
          onCancel={handleDrawCancel}
        />
      </Show>
    </div>
  );
}

/**
 * Drawing Input Form Component
 * Requirement 7.3: Prompt user to enter soil type and cable depth
 */
interface DrawingInputFormProps {
  onSubmit: (soilType: SoilType, depth: number) => void;
  onCancel: () => void;
}

function DrawingInputForm(props: DrawingInputFormProps) {
  const [soilType, setSoilType] = createSignal<SoilType>('Pasir');
  const [depth, setDepth] = createSignal<string>('1.5');
  const [error, setError] = createSignal<string | null>(null);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    
    // Validate depth
    const depthValue = parseFloat(depth());
    if (isNaN(depthValue) || depthValue <= 0) {
      setError('Please enter a valid depth greater than 0');
      return;
    }

    // Submit the form
    props.onSubmit(soilType(), depthValue);
  };

  return (
    <>
      <div class="drawing-form-overlay" onClick={props.onCancel} />
      <div class="drawing-input-form">
        <h3>New Cable Route Details</h3>
        <form onSubmit={handleSubmit}>
          <div class="form-group">
            <label for="soil-type">Soil Type</label>
            <select
              id="soil-type"
              value={soilType()}
              onChange={(e) => setSoilType(e.currentTarget.value as SoilType)}
            >
              <option value="Pasir">Pasir (Sand)</option>
              <option value="Tanah Liat">Tanah Liat (Clay)</option>
              <option value="Batuan">Batuan (Rock)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="depth">Cable Depth (meters)</label>
            <input
              id="depth"
              type="number"
              step="0.1"
              min="0.1"
              value={depth()}
              onInput={(e) => setDepth(e.currentTarget.value)}
              placeholder="e.g., 1.5"
            />
          </div>

          <Show when={error()}>
            <div style={{ color: 'red', 'font-size': '12px', 'margin-bottom': '8px' }}>
              {error()}
            </div>
          </Show>

          <div class="form-actions">
            <button type="button" class="btn-cancel" onClick={props.onCancel}>
              Cancel
            </button>
            <button type="submit" class="btn-submit">
              Add Route
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default App;
