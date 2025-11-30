import { createSignal, onMount, Show } from 'solid-js';
import { MapView } from './components/MapView';
import { PopupComponent } from './components/PopupComponent';
import { DrawingTools } from './components/DrawingTools';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { UploadModal } from './components/UploadModal';
import { BoQUploadModal } from './components/BoQUploadModal';
import { LoginForm } from './components/LoginForm';
import { ProfileDropdown } from './components/ProfileDropdown';
import { TopSearchInput } from './components/TopSearchInput';
import { AnalysisTab } from './components/AnalysisTab';
import { FilterTab } from './components/FilterTab';
import type { KMLFileData, MapViewMethods, SoilType, BoQFileData } from './types';
import type { Feature, LineString, Point } from 'geojson';
import type { CableProperties, MarkerProperties } from './types';
import maplibregl from 'maplibre-gl';
import './App.css';
// import './components/DrawingTools.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = createSignal(false);
  const [userEmail, setUserEmail] = createSignal('');
  const [kmlFiles, setKmlFiles] = createSignal<KMLFileData[]>([]);
  const [selectedKmlId, setSelectedKmlId] = createSignal<string | null>(null);
  const [filteredKmlFiles, setFilteredKmlFiles] = createSignal<KMLFileData[]>([]); // Filtered version of kmlFiles
  const [isFilterActive, setIsFilterActive] = createSignal(false); // Track if filter is active
  const [selectedFeature, setSelectedFeature] = createSignal<Feature<LineString | Point, CableProperties | MarkerProperties> | null>(null);
  const [popupCoordinates, setPopupCoordinates] = createSignal<[number, number] | null>(null);
  const [popupPosition, setPopupPosition] = createSignal<{ x: number; y: number } | null>(null);
  const [, setMapMethods] = createSignal<MapViewMethods | null>(null);
  const [isDrawingMode, setIsDrawingMode] = createSignal(false);
  const [drawnFeature, setDrawnFeature] = createSignal<Feature<LineString> | null>(null);
  const [showInputForm, setShowInputForm] = createSignal(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = createSignal(false);
  const [isBoQUploadModalOpen, setIsBoQUploadModalOpen] = createSignal(false);
  const [boqFiles, setBoqFiles] = createSignal<BoQFileData[]>([]); // Changed from single BoQData to array
  const [selectedBoqId, setSelectedBoqId] = createSignal<string | null>(null); // Track selected BOQ
  const [mapZoom, setMapZoom] = createSignal(12); // Default zoom level
  const [showRightSidebar, setShowRightSidebar] = createSignal(false);
  const [mapInstance, setMapInstance] = createSignal<maplibregl.Map | null>(null);
  const [showAnalysisTab, setShowAnalysisTab] = createSignal(false);
  const [showFilterTab, setShowFilterTab] = createSignal(false);

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
      // Load KML files from local storage
      const stored = localStorage.getItem('kmlFiles');
      if (stored) {
        const files: KMLFileData[] = JSON.parse(stored);
        setKmlFiles(files);
        if (files.length > 0) {
          setSelectedKmlId(files[0].id);
        }
      }
    } catch (error) {
      // Handle errors gracefully - Requirement 8.5
      // Log errors to console for debugging
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading KML data:', errorMsg);
      
      // Display user-friendly error message
      console.warn('Unable to load KML data. The map will be displayed without cable routes.');
      
      // Fallback to empty array - graceful degradation
      setKmlFiles([]);
    }

    try {
      // Load BOQ files from local storage
      const storedBoq = localStorage.getItem('boqFiles');
      if (storedBoq) {
        const files: BoQFileData[] = JSON.parse(storedBoq);
        setBoqFiles(files);
        if (files.length > 0) {
          setSelectedBoqId(files[0].id);
        }
        console.log('Loaded', files.length, 'BOQ files from localStorage');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading BOQ data:', errorMsg);
      setBoqFiles([]);
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
    setMapInstance(map);
    
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
  const handleUploadSuccess = (files: KMLFileData[]) => {
    console.log('=== UPLOAD SUCCESS ===');
    console.log('handleUploadSuccess called with', files.length, 'files');
    
    // Validate data before setting
    if (!files || files.length === 0) {
      console.error('No files received in handleUploadSuccess');
      alert('No valid files received. Please try again.');
      return;
    }
    
    // Add new files to existing files
    setKmlFiles(prev => [...prev, ...files]);
    
    // Select the first newly uploaded file
    if (files.length > 0) {
      setSelectedKmlId(files[0].id);
    }
    
    // Reset filter when new files uploaded
    setIsFilterActive(false);
    setFilteredKmlFiles([]);
    
    // Show RightSidebar
    setShowRightSidebar(true);
    
    // Force a re-render by logging after state update
    setTimeout(() => {
      console.log('KML files updated, current count:', kmlFiles().length);
    }, 100);
    
    // Save to local storage for persistence
    try {
      const allFiles = [...kmlFiles(), ...files];
      localStorage.setItem('kmlFiles', JSON.stringify(allFiles));
      console.log('Data saved to local storage');
    } catch (saveError) {
      console.warn('Failed to save to local storage:', saveError);
    }
    
    // Close popup if open
    handleClosePopup();
    
    console.log('Custom data loaded successfully - map should update now');
  };

  /**
   * Handle BOQ upload success - now supports multiple files
   */
  const handleBoQUploadSuccess = (files: BoQFileData[]) => {
    console.log('=== BOQ UPLOAD SUCCESS ===');
    console.log('handleBoQUploadSuccess called with', files.length, 'files');
    
    // Validate data before setting
    if (!files || files.length === 0) {
      console.error('No files received in handleBoQUploadSuccess');
      alert('No valid files received. Please try again.');
      return;
    }
    
    // Add new files to existing files
    setBoqFiles(prev => [...prev, ...files]);
    
    // Select the first newly uploaded file
    if (files.length > 0) {
      setSelectedBoqId(files[0].id);
    }
    
    // Show RightSidebar
    setShowRightSidebar(true);
    
    // Force a re-render by logging after state update
    setTimeout(() => {
      console.log('BOQ files updated, current count:', boqFiles().length);
    }, 100);
    
    // Save to local storage for persistence
    try {
      const allFiles = [...boqFiles(), ...files];
      localStorage.setItem('boqFiles', JSON.stringify(allFiles));
      console.log('BOQ data saved to local storage');
    } catch (saveError) {
      console.warn('Failed to save BOQ to local storage:', saveError);
    }
    
    console.log('BOQ data loaded successfully');
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

    console.log('New route submitted:', { soilType, depth });
    console.warn('Route saving to KML files not yet implemented in multiple KML mode');
    
    // TODO: Implement adding route to selected KML file
    // For now, just close the form
    setShowInputForm(false);
    setDrawnFeature(null);
  };
  
  /**
   * Handle KML file deletion
   */
  const handleKmlDelete = (id: string) => {
    console.log('Deleting KML file:', id);
    setKmlFiles(prev => prev.filter(f => f.id !== id));
    
    // If deleted file was selected, select another one or null
    if (selectedKmlId() === id) {
      const remainingFiles = kmlFiles().filter(f => f.id !== id);
      setSelectedKmlId(remainingFiles.length > 0 ? remainingFiles[0].id : null);
    }
    
    // Update local storage
    try {
      const remainingFiles = kmlFiles().filter(f => f.id !== id);
      localStorage.setItem('kmlFiles', JSON.stringify(remainingFiles));
      console.log('KML file deleted and storage updated');
    } catch (error) {
      console.warn('Failed to update local storage:', error);
    }
  };

  /**
   * Handle BOQ file deletion
   */
  const handleBoqDelete = (id: string) => {
    console.log('Deleting BOQ file:', id);
    setBoqFiles(prev => prev.filter(f => f.id !== id));
    
    // If deleted file was selected, select another one or null
    if (selectedBoqId() === id) {
      const remainingFiles = boqFiles().filter(f => f.id !== id);
      setSelectedBoqId(remainingFiles.length > 0 ? remainingFiles[0].id : null);
    }
    
    // Update local storage
    try {
      const remainingFiles = boqFiles().filter(f => f.id !== id);
      localStorage.setItem('boqFiles', JSON.stringify(remainingFiles));
      console.log('BOQ file deleted and storage updated');
    } catch (error) {
      console.warn('Failed to update local storage:', error);
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
        kmlFiles={kmlFiles()}
        selectedKmlId={selectedKmlId()}
        onKmlSelect={(id) => {
          setSelectedKmlId(id);
          // Reset filter when switching files
          setIsFilterActive(false);
          setFilteredKmlFiles([]);
        }}
        onKmlDelete={handleKmlDelete}
        boqFiles={boqFiles()}
        selectedBoqId={selectedBoqId()}
        onBoqSelect={setSelectedBoqId}
        onBoqDelete={handleBoqDelete}
        onUploadClick={() => {
          console.log('Upload KML button clicked');
          setIsUploadModalOpen(true);
        }}
        onUploadBoQClick={() => {
          console.log('Upload BOQ button clicked');
          setIsBoQUploadModalOpen(true);
        }}
        onDashboardClick={async () => {
          console.log('Dashboard clicked - Loading test data');
          try {
            const response = await fetch('/data/test-output.json');
            const data = await response.json();
            console.log('Test data loaded:', data);
            const testFile: KMLFileData = {
              id: `kml-${Date.now()}`,
              fileName: 'test-output.json',
              fileSize: 0,
              data: data,
              uploadDate: new Date().toISOString()
            };
            handleUploadSuccess([testFile]);
          } catch (error) {
            console.error('Failed to load test data:', error);
          }
        }}
        onAnalyticsClick={() => {
          console.log('Analytics clicked');
          
          // Ensure a KML file is selected before showing analysis tab
          if (!selectedKmlId() && kmlFiles().length > 0) {
            setSelectedKmlId(kmlFiles()[0].id);
          }
          
          // Check if there are any KML files available
          if (kmlFiles().length === 0) {
            alert('Please upload a KML file first to view analytics.');
            return;
          }
          
          setShowAnalysisTab(true);
          setShowFilterTab(false);
        }}
        onFilteringClick={() => {
          console.log('Filtering clicked');
          
          // Ensure a KML file is selected before showing filter tab
          if (!selectedKmlId() && kmlFiles().length > 0) {
            setSelectedKmlId(kmlFiles()[0].id);
          }
          
          // Check if there are any KML files available
          if (kmlFiles().length === 0) {
            alert('Please upload a KML file first to filter data.');
            return;
          }
          
          setShowFilterTab(true);
          setShowAnalysisTab(false);
        }}
        onTopologyClick={() => console.log('Topology clicked')}
      />

      {/* Upload Modal */}
      <UploadModal 
        isOpen={isUploadModalOpen()}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* BOQ Upload Modal */}
      <BoQUploadModal 
        isOpen={isBoQUploadModalOpen()}
        onClose={() => setIsBoQUploadModalOpen(false)}
        onUploadSuccess={handleBoQUploadSuccess}
      />

      <div class="flex-1 w-full relative">
        <MapView 
          kmlFiles={isFilterActive() ? filteredKmlFiles() : kmlFiles()} 
          onFeatureClick={handleFeatureClick}
          onMapLoad={handleMapLoad}
          onMapClick={handleMapClick}
          ref={setMapMethods}
        />
        
        {/* Top Search Input with Autocomplete */}
        <TopSearchInput 
          kmlFiles={kmlFiles()}
          map={mapInstance()}
        />
        
        {/* Drawing tools - Requirements: 7.1, 7.2, 7.3 */}
        <DrawingTools 
          map={mapInstance()}
          isActive={isDrawingMode()}
          onDrawComplete={handleDrawComplete}
          onCancel={handleDrawCancel}
        />
      </div>

      {/* Right Sidebar - Always show, but with empty state when no data */}
      <Show when={showRightSidebar()}>
        <RightSidebar 
          kmlFiles={kmlFiles()}
          selectedKmlId={selectedKmlId()}
          onKmlSelect={(id) => {
            setSelectedKmlId(id);
            // Reset filter when switching files
            setIsFilterActive(false);
            setFilteredKmlFiles([]);
          }}
          boqFiles={boqFiles()}
          selectedBoqId={selectedBoqId()}
          onBoqSelect={setSelectedBoqId}
          onChangeFile={() => {
            setIsUploadModalOpen(true);
          }}
          onUploadBoQ={() => {
            setIsBoQUploadModalOpen(true);
          }}
          onCancel={() => {
            setShowRightSidebar(false);
          }}
        />
      </Show>

      {/* Analysis Tab */}
      <Show when={showAnalysisTab() && selectedKmlId()}>
        {(() => {
          const selectedFile = kmlFiles().find(f => f.id === selectedKmlId());
          if (!selectedFile) return null;
          
          return (
            <AnalysisTab 
              cableData={selectedFile.data}
              onClose={() => setShowAnalysisTab(false)}
              onFeatureSelect={(feature, coordinates) => {
                // Get map instance to calculate screen position
                const map = mapInstance();
                if (map) {
                  const point = map.project(coordinates);
                  handleFeatureClick(feature, coordinates, { x: point.x, y: point.y });
                }
              }}
            />
          );
        })()}
      </Show>

      {/* Filter Tab */}
      <Show when={showFilterTab() && selectedKmlId()}>
        {(() => {
          const selectedFile = kmlFiles().find(f => f.id === selectedKmlId());
          if (!selectedFile) return null;
          
          return (
            <FilterTab 
              cableData={selectedFile.data}
              onClose={() => {
                setShowFilterTab(false);
                // Reset filter when closing
                setIsFilterActive(false);
                setFilteredKmlFiles([]);
              }}
              onFilterChange={(filteredData) => {
                console.log('Filter applied, filtered features:', filteredData.features.length);
                
                // Update the selected KML file with filtered data
                const selectedId = selectedKmlId();
                if (!selectedId) return;
                
                // Create a filtered version of the KML file
                const filteredFile: KMLFileData = {
                  ...selectedFile,
                  data: filteredData
                };
                
                // Update filteredKmlFiles with the new filtered data
                setFilteredKmlFiles([filteredFile]);
                setIsFilterActive(true);
                
                console.log('✓ Filter applied successfully, map should update');
              }}
            />
          );
        })()}
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
