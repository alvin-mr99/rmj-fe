import { createSignal, createMemo, Show, For, onCleanup } from 'solid-js';
import type { TopSearchInputProps } from '../types';
import type { Feature, Point, LineString } from 'geojson';
import type { CableProperties } from '../types';

/**
 * Point data structure for search results
 */
interface PointData {
  id: string;
  name: string;
  fileName: string;
  routeName?: string;
  coordinates: [number, number];
  type: 'point' | 'linepoint';
}

/**
 * TopSearchInput Component
 * 
 * Search input with autocomplete for finding and navigating to points on the map.
 * Extracts points from both Point features and LineString coordinates.
 * Clicking a result zooms and centers the map to that point's coordinates with smooth animation.
 */
export function TopSearchInput(props: TopSearchInputProps) {
  const [searchQuery, setSearchQuery] = createSignal('');
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const [selectedIndex, setSelectedIndex] = createSignal(-1);
  let inputRef: HTMLInputElement | undefined;
  let dropdownRef: HTMLDivElement | undefined;

  // Extract all points from all KML files (including LineString coordinates)
  const allPoints = createMemo((): PointData[] => {
    const points: PointData[] = [];

    props.kmlFiles.forEach(kmlFile => {
      kmlFile.data.features.forEach(feature => {
        // Extract Point features
        if (feature.geometry.type === 'Point') {
          const pointFeature = feature as Feature<Point, CableProperties>;
          const pointName = pointFeature.properties.name || pointFeature.properties.id || 'Unnamed Point';
          points.push({
            id: pointFeature.properties.id,
            name: pointName,
            fileName: kmlFile.fileName,
            coordinates: pointFeature.geometry.coordinates as [number, number],
            type: 'point'
          });
        }
        
        // Extract points from LineString coordinates
        if (feature.geometry.type === 'LineString') {
          const lineFeature = feature as Feature<LineString, CableProperties>;
          const routeName = lineFeature.properties.name || lineFeature.properties.id;
          const coords = lineFeature.geometry.coordinates as [number, number][];
          
          coords.forEach((coord, index) => {
            points.push({
              id: `${routeName}-point-${index + 1}`,
              name: `${routeName}-point-${index + 1}`,
              fileName: kmlFile.fileName,
              routeName: routeName,
              coordinates: coord,
              type: 'linepoint'
            });
          });
        }
      });
    });

    return points;
  });

  // Filter points based on search query
  const filteredPoints = createMemo(() => {
    const query = searchQuery().toLowerCase().trim();
    if (!query) return [];

    return allPoints().filter(point => {
      const name = point.name.toLowerCase();
      const id = point.id.toLowerCase();
      const fileName = point.fileName.toLowerCase();
      const routeName = point.routeName?.toLowerCase() || '';
      
      return name.includes(query) || 
             id.includes(query) || 
             fileName.includes(query) ||
             routeName.includes(query);
    });
  });

  // Handle input change
  const handleInputChange = (e: Event) => {
    const target = e.currentTarget as HTMLInputElement;
    setSearchQuery(target.value);
    setIsDropdownOpen(target.value.trim().length > 0);
    setSelectedIndex(-1);
  };

  // Handle point selection
  const handlePointSelect = (point: PointData) => {
    if (!props.map) return;

    // Close dropdown and clear search
    setIsDropdownOpen(false);
    setSearchQuery('');
    setSelectedIndex(-1);

    // Smooth zoom and center to point coordinates with flyTo animation
    props.map.flyTo({
      center: point.coordinates,
      zoom: 19, // Zoom closer to see the point clearly
      duration: 1500, // Smooth 1.5s animation
      essential: true,
      curve: 1.42, // Control the zoom curve (higher = more arc)
      speed: 1.2 // Control animation speed
    });
    
    console.log(`✈️ Flying to ${point.name} at`, point.coordinates);

    // Trigger feature select to show popup
    if (props.onFeatureSelect) {
      // Find the line feature that this point belongs to
      let foundFeature: Feature<LineString | Point, CableProperties> | null = null;
      
      props.kmlFiles.forEach(kmlFile => {
        kmlFile.data.features.forEach(feature => {
          // If this is a point feature with matching coordinates
          if (point.type === 'point' && feature.geometry.type === 'Point') {
            const pointFeature = feature as Feature<Point, CableProperties>;
            if (pointFeature.properties.id === point.id) {
              foundFeature = pointFeature;
            }
          }
          
          // If this is a linepoint from a LineString route
          if (point.type === 'linepoint' && feature.geometry.type === 'LineString') {
            const lineFeature = feature as Feature<LineString, CableProperties>;
            const routeName = lineFeature.properties.name || lineFeature.properties.id;
            if (point.id.startsWith(routeName)) {
              foundFeature = lineFeature;
            }
          }
        });
      });
      
      if (foundFeature) {
        props.onFeatureSelect(foundFeature, point.coordinates);
      }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    const results = filteredPoints();
    if (results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        const idx = selectedIndex();
        if (idx >= 0 && idx < results.length) {
          handlePointSelect(results[idx]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsDropdownOpen(false);
        setSearchQuery('');
        setSelectedIndex(-1);
        inputRef?.blur();
        break;
    }
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    if (
      inputRef && !inputRef.contains(e.target as Node) &&
      dropdownRef && !dropdownRef.contains(e.target as Node)
    ) {
      setIsDropdownOpen(false);
      setSelectedIndex(-1);
    }
  };

  // Add click outside listener
  document.addEventListener('click', handleClickOutside);
  onCleanup(() => {
    document.removeEventListener('click', handleClickOutside);
  });

  // Format point display name
  const getPointDisplayName = (point: PointData) => {
    return point.name;
  };

  // Get truncated filename
  const getTruncatedFileName = (fileName: string, maxLength: number = 25) => {
    if (fileName.length <= maxLength) return fileName;
    return fileName.substring(0, maxLength - 3) + '...';
  };
  
  // Format coordinates for display
  const formatCoordinates = (coords: [number, number]): string => {
    return `${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}`;
  };
  
  // Get icon based on point type
  const getPointIcon = (type: 'point' | 'linepoint'): string => {
    return type === 'point' ? '📍' : '📌';
  };

  return (
    <div 
      class="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[85%] max-w-[450px]"
      style={{"font-family": "'Poppins', sans-serif"}}
    >
      {/* Search Input */}
      <div class="relative">
        <div class="flex items-center gap-2 bg-white rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-4 py-2.5">
          {/* Search Icon */}
          <div class="flex-shrink-0 text-gray-400 text-base">
            🔍
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={searchQuery()}
            onInput={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => searchQuery().trim().length > 0 && setIsDropdownOpen(true)}
            placeholder="Search STO"
            class="flex-1 bg-transparent border-none outline-none text-gray-700 text-sm placeholder:text-gray-400 font-normal"
          />

          {/* Search Button */}
          <button 
            class="flex-shrink-0 bg-indigo-600 text-white px-4 py-1.5 rounded-[10px] text-xs font-medium hover:bg-indigo-700 transition-colors cursor-pointer border-none"
            onClick={() => {
              const results = filteredPoints();
              if (results.length > 0) {
                handlePointSelect(results[0]);
              }
            }}
          >
            Search
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        <Show when={isDropdownOpen() && filteredPoints().length > 0}>
          <div 
            ref={dropdownRef}
            class="absolute top-full left-0 right-0 mt-2 bg-white rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden max-h-[350px] overflow-y-auto"
          >
            <For each={filteredPoints()}>
              {(point, index) => (
                <button
                  class="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent text-left"
                  classList={{
                    'bg-indigo-50': index() === selectedIndex()
                  }}
                  onClick={() => handlePointSelect(point)}
                >
                  {/* Point Icon */}
                  <div class="flex-shrink-0 w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-sm">
                    {getPointIcon(point.type)}
                  </div>

                  {/* Point Info */}
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-medium text-gray-900 truncate">
                      {getPointDisplayName(point)}
                    </div>
                    <div class="text-[10px] text-gray-500 truncate mt-0.5">
                      {point.routeName ? `Route: ${point.routeName}` : getTruncatedFileName(point.fileName)}
                    </div>
                  </div>

                  {/* Coordinates */}
                  <div class="text-[9px] text-gray-400 text-right flex-shrink-0">
                    {formatCoordinates(point.coordinates)}
                  </div>
                </button>
              )}
            </For>

            {/* Results Count */}
            <div class="px-4 py-1.5 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-500">
              {filteredPoints().length} result{filteredPoints().length !== 1 ? 's' : ''} found
            </div>
          </div>
        </Show>

        {/* No Results Message */}
        <Show when={isDropdownOpen() && searchQuery().trim().length > 0 && filteredPoints().length === 0}>
          <div 
            ref={dropdownRef}
            class="absolute top-full left-0 right-0 mt-2 bg-white rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden"
          >
            <div class="px-4 py-6 text-center">
              <div class="text-3xl mb-1.5">🔍</div>
              <div class="text-xs font-medium text-gray-600 mb-0.5">No points found</div>
              <div class="text-[10px] text-gray-400">Try a different search term</div>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}