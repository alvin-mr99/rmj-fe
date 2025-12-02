import { createSignal, onMount, Show } from 'solid-js';
import { MapView } from './components/MapView';
import { PopupComponent } from './components/PopupComponent';
import { DrawingTools } from './components/DrawingTools';
import { Sidebar as SidebarNew } from './components/SidebarNew';
import { RightSidebar } from './components/RightSidebar';
import { ProjectUploadModal } from './components/ProjectUploadModal';
import { ProjectDetailPanel } from './components/ProjectDetailPanel';
import { LoginForm } from './components/LoginForm';
import { ProfileDropdown } from './components/ProfileDropdown';
import { TopSearchInput } from './components/TopSearchInput';
import { AnalysisTab } from './components/AnalysisTab';
import { FilterTab } from './components/FilterTab';
import { RMJModal } from './components/RMJModal';
import { loadDefaultProjects, saveProjectsToStorage, loadProjectsFromStorage } from './services/ProjectLoader';
import type { KMLFileData, MapViewMethods, SoilType, ProjectData } from './types';
import type { Feature, LineString, Point } from 'geojson';
import type { CableProperties, MarkerProperties } from './types';
import maplibregl from 'maplibre-gl';
import './App.css';
// import './components/DrawingTools.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = createSignal(false);
  const [userEmail, setUserEmail] = createSignal('');
  
  // New unified project state
  const [projects, setProjects] = createSignal<ProjectData[]>([]);
  const [selectedProjectId, setSelectedProjectId] = createSignal<string | null>(null);
  const [isProjectUploadModalOpen, setIsProjectUploadModalOpen] = createSignal(false);
  const [showProjectDetail, setShowProjectDetail] = createSignal(false);
  const [detailProject, setDetailProject] = createSignal<ProjectData | null>(null);
  
  const [filteredKmlFiles, setFilteredKmlFiles] = createSignal<KMLFileData[]>([]); // Filtered version of kmlFiles
  const [isFilterActive, setIsFilterActive] = createSignal(false); // Track if filter is active
  const [selectedFeature, setSelectedFeature] = createSignal<Feature<LineString | Point, CableProperties | MarkerProperties> | null>(null);
  const [popupCoordinates, setPopupCoordinates] = createSignal<[number, number] | null>(null);
  const [popupPosition, setPopupPosition] = createSignal<{ x: number; y: number } | null>(null);
  const [, setMapMethods] = createSignal<MapViewMethods | null>(null);
  const [isDrawingMode, setIsDrawingMode] = createSignal(false);
  const [drawnFeature, setDrawnFeature] = createSignal<Feature<LineString> | null>(null);
  const [showInputForm, setShowInputForm] = createSignal(false);
  const [mapZoom, setMapZoom] = createSignal(12); // Default zoom level
  const [showRightSidebar, setShowRightSidebar] = createSignal(false);
  const [mapInstance, setMapInstance] = createSignal<maplibregl.Map | null>(null);
  const [showAnalysisTab, setShowAnalysisTab] = createSignal(false);
  const [showFilterTab, setShowFilterTab] = createSignal(false);
  const [showRMJModal, setShowRMJModal] = createSignal(false);

  // Helper functions to work with projects
  const getKmlFilesForMap = (): KMLFileData[] => {
    return projects().map(project => ({
      id: project.id,
      fileName: project.kml.fileName,
      fileSize: project.kml.fileSize,
      data: project.kml.data,
      uploadDate: project.uploadDate
    }));
  };

  const getSelectedProject = (): ProjectData | undefined => {
    return projects().find(p => p.id === selectedProjectId());
  };

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
      // Try to load projects from localStorage first
      const storedProjects = loadProjectsFromStorage();
      
      if (storedProjects.length > 0) {
        // Load from localStorage if available
        setProjects(storedProjects);
        setSelectedProjectId(storedProjects[0].id);
        console.log('✓ Loaded', storedProjects.length, 'projects from localStorage');
      } else {
        // Load default projects from actual KML and BOQ files if localStorage is empty
        console.log('Loading default projects from files...');
        const loadedProjects = await loadDefaultProjects();
        saveProjectsToStorage(loadedProjects);
        
        setProjects(loadedProjects);
        if (loadedProjects.length > 0) {
          setSelectedProjectId(loadedProjects[0].id);
        }
        console.log('✓ Loaded', loadedProjects.length, 'default projects');
      }
    } catch (error) {
      // Handle errors gracefully - Requirement 8.5
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading project data:', errorMsg);
      console.warn('Unable to load project data. The map will be displayed without cable routes.');
      setProjects([]);
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
   * Handle project upload success
   */
  const handleProjectUploadSuccess = (newProjects: ProjectData[]) => {
    console.log('=== PROJECT UPLOAD SUCCESS ===');
    console.log('handleProjectUploadSuccess called with', newProjects.length, 'projects');
    
    if (!newProjects || newProjects.length === 0) {
      console.error('No projects received in handleProjectUploadSuccess');
      alert('No valid projects received. Please try again.');
      return;
    }
    
    // Add new projects to existing projects
    const allProjects = [...projects(), ...newProjects];
    setProjects(allProjects);
    
    // Select the first newly uploaded project
    if (newProjects.length > 0) {
      setSelectedProjectId(newProjects[0].id);
    }
    
    // Reset filter when new projects uploaded
    setIsFilterActive(false);
    setFilteredKmlFiles([]);
    
    // Show RightSidebar
    setShowRightSidebar(true);
    
    // Save to local storage for persistence (only once!)
    try {
      saveProjectsToStorage(allProjects);
      console.log('Projects saved to local storage');
    } catch (saveError) {
      console.warn('Failed to save to local storage:', saveError);
    }
    
    // Close popup if open
    handleClosePopup();
    
    console.log('Project uploaded successfully - map should update now');
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
   * Handle project deletion
   */
  const handleProjectDelete = (id: string) => {
    console.log('Deleting project:', id);
    setProjects(prev => prev.filter(p => p.id !== id));
    
    // If deleted project was selected, select another one or null
    if (selectedProjectId() === id) {
      const remainingProjects = projects().filter(p => p.id !== id);
      setSelectedProjectId(remainingProjects.length > 0 ? remainingProjects[0].id : null);
    }
    
    // Update local storage
    try {
      const remainingProjects = projects().filter(p => p.id !== id);
      saveProjectsToStorage(remainingProjects);
      console.log('Project deleted and storage updated');
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
        <SidebarNew 
          projects={projects()}
          selectedProjectId={selectedProjectId()}
          onProjectSelect={setSelectedProjectId}
          onProjectDelete={handleProjectDelete}
          onUploadClick={() => {
            console.log('Upload Project button clicked');
            setIsProjectUploadModalOpen(true);
          }}
          onDashboardClick={() => {
            console.log('Dashboard clicked');
            // Dashboard shows project list in sidebar, nothing special needed
          }}
          onRMJToolsClick={() => {
            console.log('RMJ Tools clicked');
            console.log('Current showRMJModal state:', showRMJModal());
            setShowRMJModal(true);
            console.log('After set showRMJModal state:', showRMJModal());
          }}
          onAnalyticsClick={() => {
            console.log('Analytics clicked');
            
            // Ensure a project is selected before showing analysis tab
            if (!selectedProjectId() && projects().length > 0) {
              setSelectedProjectId(projects()[0].id);
            }
            
            // Check if there are any projects available
            if (projects().length === 0) {
              alert('Please upload a project first to view analytics.');
              return;
            }
            
            setShowAnalysisTab(true);
            setShowFilterTab(false);
          }}
          onFilteringClick={() => {
            console.log('Filtering clicked');
            
            // Ensure a project is selected before showing filter tab
            if (!selectedProjectId() && projects().length > 0) {
              setSelectedProjectId(projects()[0].id);
            }
            
            // Check if there are any projects available
            if (projects().length === 0) {
              alert('Please upload a project first to filter data.');
              return;
            }
            
            setShowFilterTab(true);
            setShowAnalysisTab(false);
          }}
          onTopologyClick={() => console.log('Topology clicked')}
          onProjectDetailClick={(project) => {
            setDetailProject(project);
            setShowProjectDetail(true);
          }}
        />

      {/* Project Upload Modal */}
      <ProjectUploadModal 
        isOpen={isProjectUploadModalOpen()}
        onClose={() => setIsProjectUploadModalOpen(false)}
        onUploadSuccess={handleProjectUploadSuccess}
      />

      {/* Project Detail Panel */}
      <Show when={showProjectDetail() && detailProject()}>
        <ProjectDetailPanel 
          project={detailProject()!}
          onClose={() => {
            setShowProjectDetail(false);
            setDetailProject(null);
          }}
        />
      </Show>

      <div class="flex-1 w-full relative">
        <MapView 
          kmlFiles={isFilterActive() ? filteredKmlFiles() : getKmlFilesForMap()} 
          onFeatureClick={handleFeatureClick}
          onMapLoad={handleMapLoad}
          onMapClick={handleMapClick}
          ref={setMapMethods}
        />
        
        {/* Top Search Input with Autocomplete */}
        <TopSearchInput 
          kmlFiles={getKmlFilesForMap()}
          map={mapInstance()}
          onFeatureSelect={(feature, coordinates) => {
            // Convert map coordinates to screen position for popup
            if (mapInstance()) {
              const point = mapInstance()!.project(coordinates);
              handleFeatureClick(feature, coordinates, { x: point.x, y: point.y });
            }
          }}
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
          kmlFiles={getKmlFilesForMap()}
          selectedKmlId={selectedProjectId()}
          onKmlSelect={(id) => {
            setSelectedProjectId(id);
            // Reset filter when switching projects
            setIsFilterActive(false);
            setFilteredKmlFiles([]);
          }}
          boqFiles={projects().filter(p => p.boq !== null).map(p => ({
            id: p.id,
            fileName: p.boq!.fileName,
            fileSize: p.boq!.fileSize,
            data: p.boq!.data,
            uploadDate: p.uploadDate
          }))}
          selectedBoqId={selectedProjectId()}
          onBoqSelect={setSelectedProjectId}
          onChangeFile={() => {
            setIsProjectUploadModalOpen(true);
          }}
          onUploadBoQ={() => {
            setIsProjectUploadModalOpen(true);
          }}
          onCancel={() => {
            setShowRightSidebar(false);
          }}
        />
      </Show>

      {/* Analysis Tab */}
      <Show when={showAnalysisTab() && selectedProjectId()}>
        {(() => {
          const selectedProject = getSelectedProject();
          if (!selectedProject) return null;
          
          return (
            <AnalysisTab 
              cableData={selectedProject.kml.data}
              map={mapInstance()}
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
      <Show when={showFilterTab() && selectedProjectId()}>
        {(() => {
          const selectedProject = getSelectedProject();
          if (!selectedProject) return null;
          
          return (
            <FilterTab 
              cableData={selectedProject.kml.data}
              onClose={() => {
                setShowFilterTab(false);
                // Reset filter when closing
                setIsFilterActive(false);
                setFilteredKmlFiles([]);
              }}
              onFilterChange={(filteredData) => {
                console.log('Filter applied, filtered features:', filteredData.features.length);
                
                const selectedId = selectedProjectId();
                if (!selectedId) return;
                
                // Create a filtered version of the KML file
                const filteredFile: KMLFileData = {
                  id: selectedId,
                  fileName: selectedProject.kml.fileName,
                  fileSize: selectedProject.kml.fileSize,
                  data: filteredData,
                  uploadDate: selectedProject.uploadDate
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

      {/* RMJ Tools Modal - Rendered at same level as main content */}
      <Show when={showRMJModal()}>
        <RMJModal 
          isOpen={true}
          onClose={() => {
            console.log('RMJ Modal close clicked');
            setShowRMJModal(false);
          }}
          userRole="Admin"
          userEmail={userEmail()}
        />
      </Show>
      
      {/* Debug button - temporary */}
      {/* <Show when={!showRMJModal()}>
        <button
          class="fixed bottom-4 right-4 z-[9999] px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg"
          onClick={() => {
            console.log('Debug button clicked');
            setShowRMJModal(true);
          }}
        >
          Test RMJ Modal
        </button>
      </Show> */}
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
