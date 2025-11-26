import { createSignal, onMount, Show } from 'solid-js';
import { MapView } from './components/MapView';
import { PopupComponent } from './components/PopupComponent';
import { DrawingTools } from './components/DrawingTools';
import { Sidebar } from './components/Sidebar';
import { UploadModal } from './components/UploadModal';
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
  const [, setMapMethods] = createSignal<MapViewMethods | null>(null);
  const [isDrawingMode, setIsDrawingMode] = createSignal(false);
  const [drawnFeature, setDrawnFeature] = createSignal<Feature<LineString> | null>(null);
  const [showInputForm, setShowInputForm] = createSignal(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = createSignal(false);
  let mapInstance: maplibregl.Map | null = null;

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

  const handleMapClick = () => {
    // Requirement 4.5: Close popup when clicking elsewhere on map
    handleClosePopup();
  };

  /**
   * Handle upload modal success
   */
  const handleUploadSuccess = (data: CableFeatureCollection) => {
    console.log('=== UPLOAD SUCCESS ===');
    console.log('handleUploadSuccess called with data:', data);
    console.log('Number of features:', data.features.length);
    
    // Validate data before setting
    if (!data || !data.features || data.features.length === 0) {
      console.error('Invalid data received in handleUploadSuccess');
      alert('Invalid data received. Please try again.');
      return;
    }
    
    // Replace current cable data with uploaded data
    setCableData(data);
    
    // Force a re-render by logging after state update
    setTimeout(() => {
      console.log('Cable data updated, current features:', cableData().features.length);
    }, 100);
    
    // Save to local storage for persistence
    try {
      DataLoader.saveToLocalStorage(data);
      console.log('Data saved to local storage');
    } catch (saveError) {
      console.warn('Failed to save to local storage:', saveError);
    }
    
    // Close popup if open
    handleClosePopup();
    
    console.log('Custom data loaded successfully - map should update now');
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
      alert('Failed to add new route. Please try again.');
    }
  };

  return (
    <div class="app-container">
      {/* Sidebar Panel */}
      <Sidebar 
        onUploadClick={() => {
          console.log('Upload button clicked');
          setIsUploadModalOpen(true);
        }}
        onDashboardClick={async () => {
          console.log('Dashboard clicked - Loading test data');
          try {
            const response = await fetch('/data/test-output.json');
            const data = await response.json();
            console.log('Test data loaded:', data);
            handleUploadSuccess(data);
          } catch (error) {
            console.error('Failed to load test data:', error);
          }
        }}
        onAnalyticsClick={() => console.log('Analytics clicked')}
        onFilteringClick={() => console.log('Filtering clicked')}
        onTopologyClick={() => console.log('Topology clicked')}
      />

      {/* Upload Modal */}
      <UploadModal 
        isOpen={isUploadModalOpen()}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

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
      {/* <SearchControl onLocationSelect={handleLocationSelect} /> */}
      
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
