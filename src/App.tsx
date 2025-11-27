import { createSignal, onMount, Show } from 'solid-js';
import { MapView } from './components/MapView';
import { PopupComponent } from './components/PopupComponent';
import { DrawingTools } from './components/DrawingTools';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { UploadModal } from './components/UploadModal';
import { LoginForm } from './components/LoginForm';
import { ProfileDropdown } from './components/ProfileDropdown';
import { FilterTab } from './components/FilterTab';
import { AnalysisTab } from './components/AnalysisTab';
import { DataLoader } from './services/DataLoader';
import type { CableFeatureCollection, MapViewMethods, SoilType } from './types';
import type { Feature, LineString, Point } from 'geojson';
import type { CableProperties, MarkerProperties } from './types';
import maplibregl from 'maplibre-gl';
import './App.css';
// import './components/DrawingTools.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = createSignal(false);
  const [userEmail, setUserEmail] = createSignal('');
  const [cableData, setCableData] = createSignal<CableFeatureCollection>({
    type: 'FeatureCollection',
    features: []
  });
  const [filteredCableData, setFilteredCableData] = createSignal<CableFeatureCollection>({
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
  const [mapZoom, setMapZoom] = createSignal(12); // Default zoom level
  const [uploadedFileName, setUploadedFileName] = createSignal<string>('');
  const [uploadedFileSize, setUploadedFileSize] = createSignal<number>(0);
  const [showRightSidebar, setShowRightSidebar] = createSignal(false);
  const [showFilterTab, setShowFilterTab] = createSignal(false);
  const [showAnalysisTab, setShowAnalysisTab] = createSignal(false);
  let mapInstance: maplibregl.Map | null = null;

  // Load cable data on mount (from local storage or sample data)
  // Requirements: 8.2, 8.4, 8.5
  onMount(async () => {
    // Check if user is already logged in
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const email = localStorage.getItem('userEmail');
    
    if (loggedIn && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
      
      // Show RightSidebar after login
      setShowRightSidebar(true);
    }

    try {
      const data = await DataLoader.loadCableData();
      setCableData(data);
      setFilteredCableData(data); // Initialize filtered data with all data
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

  const handleLoginSuccess = (email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    
    // Reset state
    setIsLoggedIn(false);
    setUserEmail('');
    
    // Close any open popups
    handleClosePopup();
  };

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
    
    // Set initial zoom level
    setMapZoom(map.getZoom());
    
    // Listen to zoom changes to update popup scale
    map.on('zoom', () => {
      setMapZoom(map.getZoom());
      
      // Update popup position when zooming
      if (selectedFeature() && popupCoordinates()) {
        const coords = popupCoordinates()!;
        const point = map.project(coords);
        setPopupPosition({ x: point.x, y: point.y });
      }
    });
    
    // Update popup position on map move
    map.on('move', () => {
      if (selectedFeature() && popupCoordinates()) {
        const coords = popupCoordinates()!;
        const point = map.project(coords);
        setPopupPosition({ x: point.x, y: point.y });
      }
    });
  };

  const handleMapClick = () => {
    // Requirement 4.5: Close popup when clicking elsewhere on map
    handleClosePopup();
  };

  /**
   * Handle upload modal success
   */
  const handleUploadSuccess = (data: CableFeatureCollection, fileName?: string, fileSize?: number) => {
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
    setFilteredCableData(data); // Reset filtered data
    
    // Store file info for RightSidebar
    if (fileName) setUploadedFileName(fileName);
    if (fileSize) setUploadedFileSize(fileSize);
    
    // Show RightSidebar
    setShowRightSidebar(true);
    
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
   * Handle filter changes from FilterTab
   */
  const handleFilterChange = (filtered: CableFeatureCollection) => {
    setFilteredCableData(filtered);
    // Close popup when filters change
    handleClosePopup();
  };

  /**
   * Handle opening filter tab
   */
  const handleFilteringClick = () => {
    setShowFilterTab(true);
  };

  /**
   * Handle closing filter tab
   */
  const handleCloseFilterTab = () => {
    setShowFilterTab(false);
  };

  /**
   * Handle opening analysis tab
   */
  const handleAnalyticsClick = () => {
    setShowAnalysisTab(true);
  };

  /**
   * Handle closing analysis tab
   */
  const handleCloseAnalysisTab = () => {
    setShowAnalysisTab(false);
  };

  /**
   * Handle feature selection from analysis tab
   */
  const handleAnalysisFeatureSelect = (feature: Feature<LineString | Point, CableProperties>, coordinates: [number, number]) => {
    // Find screen position for the coordinates
    if (mapInstance) {
      const point = mapInstance.project(coordinates);
      handleFeatureClick(feature, coordinates, { x: point.x, y: point.y });
      
      // Pan to the feature
      mapInstance.flyTo({
        center: coordinates,
        zoom: 16,
        duration: 1000
      });
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
      setFilteredCableData(updatedData); // Update filtered data as well
      
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
    <Show
      when={isLoggedIn()}
      fallback={<LoginForm onLoginSuccess={handleLoginSuccess} />}
    >
      <div class="w-screen h-screen relative overflow-hidden flex flex-row">
        {/* Profile Dropdown - Top Right */}
        <div class="absolute top-6 right-6 z-[1001]">
          <ProfileDropdown userEmail={userEmail()} onLogout={handleLogout} />
        </div>

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
            handleUploadSuccess(data, 'test-output.json', 0);
          } catch (error) {
            console.error('Failed to load test data:', error);
          }
        }}
        onAnalyticsClick={handleAnalyticsClick}
        onFilteringClick={handleFilteringClick}
        onTopologyClick={() => console.log('Topology clicked')}
      />

      {/* Filter Tab */}
      <Show when={showFilterTab()}>
        <FilterTab
          cableData={cableData()}
          onFilterChange={handleFilterChange}
          onClose={handleCloseFilterTab}
        />
      </Show>

      {/* Analysis Tab */}
      <Show when={showAnalysisTab()}>
        <AnalysisTab
          cableData={cableData()}
          onClose={handleCloseAnalysisTab}
          onFeatureSelect={handleAnalysisFeatureSelect}
        />
      </Show>

      {/* Upload Modal */}
      <UploadModal 
        isOpen={isUploadModalOpen()}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <div class="flex-1 w-full relative">
        <MapView 
          cableData={filteredCableData()} 
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

      {/* Right Sidebar - Always show, but with empty state when no data */}
      <Show when={showRightSidebar()}>
        <RightSidebar
          cableData={cableData()}
          fileName={uploadedFileName()}
          fileSize={uploadedFileSize()}
          onChangeFile={() => {
            setIsUploadModalOpen(true);
          }}
          onLoadToMap={() => {
            // Data already loaded, just close sidebar or do nothing
            console.log('Data already loaded to map');
          }}
          onCancel={() => {
            setShowRightSidebar(false);
          }}
        />
      </Show>
      
      {/* Search control - Requirements: 6.3, 6.4 */}
      {/* <SearchControl onLocationSelect={handleLocationSelect} /> */}
      
      {/* Popup overlay - Requirements: 4.1, 4.2, 4.5 */}
      <Show when={selectedFeature() && popupCoordinates() && popupPosition()}>
        {(() => {
          // Calculate scale based on zoom level - INVERTED LOGIC
          // Zoom IN (closer) = smaller popup
          // Zoom OUT (farther) = larger popup
          const zoom = mapZoom();
          const minZoom = 8;
          const maxZoom = 18;
          const minScale = 0.7;  // Minimum size when zoomed in close (increased from 0.5)
          const maxScale = 1.1;  // Maximum size when zoomed out far (reduced from 1.2)
          
          // Inverted linear interpolation for scale
          const normalizedZoom = Math.max(0, Math.min(1, (zoom - minZoom) / (maxZoom - minZoom)));
          // Invert the scale: high zoom = small scale
          const scale = maxScale - (maxScale - minScale) * normalizedZoom;
          
          return (
            <div
              style={{
                position: 'absolute',
                left: `${popupPosition()!.x}px`,
                top: `${popupPosition()!.y}px`,
                transform: `translate(-50%, -100%) scale(${scale})`,
                'transform-origin': 'center bottom',
                'margin-top': '-10px',
                'pointer-events': 'none',
                transition: 'transform 0.15s ease-out',
                'will-change': 'transform'
              }}
            >
              <PopupComponent
                feature={selectedFeature()!}
                coordinates={popupCoordinates()!}
                onClose={handleClosePopup}
              />
            </div>
          );
        })()}
      </Show>

      {/* Drawing input form - Requirement 7.3 */}
      <Show when={showInputForm()}>
        <DrawingInputForm
          onSubmit={handleRouteSubmit}
          onCancel={handleDrawCancel}
        />
      </Show>
      </div>
    </Show>
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
      <div class="fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-[100] animate-[fadeIn_0.2s_ease]" onClick={props.onCancel} />
      <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] bg-white rounded-lg p-6 shadow-[0_4px_12px_rgba(0,0,0,0.15)] min-w-[300px] max-w-[90vw] md:min-w-[280px] md:p-5">
        <h3 class="m-0 mb-4 text-lg font-semibold text-gray-800 md:text-base">New Cable Route Details</h3>
        <form onSubmit={handleSubmit}>
          <div class="mb-4">
            <label for="soil-type" class="block mb-1.5 text-sm font-medium text-gray-600">Soil Type</label>
            <select
              id="soil-type"
              class="w-full px-3 py-2 border border-gray-300 rounded text-sm box-border focus:outline-none focus:border-green-500"
              value={soilType()}
              onChange={(e) => setSoilType(e.currentTarget.value as SoilType)}
            >
              <option value="Pasir">Pasir (Sand)</option>
              <option value="Tanah Liat">Tanah Liat (Clay)</option>
              <option value="Batuan">Batuan (Rock)</option>
            </select>
          </div>

          <div class="mb-4">
            <label for="depth" class="block mb-1.5 text-sm font-medium text-gray-600">Cable Depth (meters)</label>
            <input
              id="depth"
              type="number"
              step="0.1"
              min="0.1"
              class="w-full px-3 py-2 border border-gray-300 rounded text-sm box-border focus:outline-none focus:border-green-500"
              value={depth()}
              onInput={(e) => setDepth(e.currentTarget.value)}
              placeholder="e.g., 1.5"
            />
          </div>

          <Show when={error()}>
            <div class="text-red-600 text-xs mb-2">
              {error()}
            </div>
          </Show>

          <div class="flex gap-2 justify-end mt-5">
            <button 
              type="button" 
              class="px-4 py-2 border-none rounded text-sm font-medium cursor-pointer transition-colors duration-200 bg-gray-100 text-gray-800 hover:bg-gray-200" 
              onClick={props.onCancel}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 border-none rounded text-sm font-medium cursor-pointer transition-colors duration-200 bg-green-600 text-white hover:bg-green-700"
            >
              Add Route
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default App;
