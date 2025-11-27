import { createSignal, For, Show } from 'solid-js';
import type { CableFeatureCollection, SoilType } from '../types';

export interface FilterOptions {
  soilTypes: SoilType[];
  depthRange: { min: number; max: number };
  distanceRange: { min: number; max: number };
  lineWidth: { min: number; max: number };
}

interface FilterTabProps {
  cableData: CableFeatureCollection;
  onFilterChange: (filteredData: CableFeatureCollection) => void;
  onClose: () => void;
}

export function FilterTab(props: FilterTabProps) {
  // Soil type filters (all selected by default)
  const [selectedSoilTypes, setSelectedSoilTypes] = createSignal<SoilType[]>(['Pasir', 'Tanah Liat', 'Batuan']);
  
  // Depth range filters
  const [depthMin, setDepthMin] = createSignal<number>(0);
  const [depthMax, setDepthMax] = createSignal<number>(10);
  
  // Distance range filters
  const [distanceMin, setDistanceMin] = createSignal<number>(0);
  const [distanceMax, setDistanceMax] = createSignal<number>(10000);
  
  // Line width filters
  const [lineWidthMin, setLineWidthMin] = createSignal<number>(0);
  const [lineWidthMax, setLineWidthMax] = createSignal<number>(20);

  // Expanded sections state
  const [expandedSections, setExpandedSections] = createSignal<Set<string>>(new Set(['soilType']));

  const soilTypeOptions: { value: SoilType; label: string; color: string }[] = [
    { value: 'Pasir', label: 'Pasir (Sand)', color: '#ffd700' },
    { value: 'Tanah Liat', label: 'Tanah Liat (Clay)', color: '#d32f2f' },
    { value: 'Batuan', label: 'Batuan (Rock)', color: '#757575' },
  ];

  const toggleSoilType = (soilType: SoilType) => {
    const current = selectedSoilTypes();
    if (current.includes(soilType)) {
      setSelectedSoilTypes(current.filter(t => t !== soilType));
    } else {
      setSelectedSoilTypes([...current, soilType]);
    }
  };

  const toggleSection = (section: string) => {
    const current = new Set(expandedSections());
    if (current.has(section)) {
      current.delete(section);
    } else {
      current.add(section);
    }
    setExpandedSections(current);
  };

  const applyFilters = () => {
    const filtered = props.cableData.features.filter(feature => {
      const properties = feature.properties;
      
      // Filter by soil type
      if (!selectedSoilTypes().includes(properties.soilType)) {
        return false;
      }
      
      // Filter by depth
      if (properties.depth < depthMin() || properties.depth > depthMax()) {
        return false;
      }
      
      // Filter by distance (if totalDistance exists)
      if (properties.totalDistance !== undefined) {
        if (properties.totalDistance < distanceMin() || properties.totalDistance > distanceMax()) {
          return false;
        }
      }
      
      // Filter by line width (if style.lineWidth exists)
      if (properties.style?.lineWidth !== undefined) {
        const lineWidth = properties.style.lineWidth;
        if (lineWidth < lineWidthMin() || lineWidth > lineWidthMax()) {
          return false;
        }
      }
      
      return true;
    });

    props.onFilterChange({
      type: 'FeatureCollection',
      features: filtered
    });
  };

  const resetFilters = () => {
    setSelectedSoilTypes(['Pasir', 'Tanah Liat', 'Batuan']);
    setDepthMin(0);
    setDepthMax(10);
    setDistanceMin(0);
    setDistanceMax(10000);
    setLineWidthMin(0);
    setLineWidthMax(20);
    
    // Apply reset immediately
    props.onFilterChange(props.cableData);
  };

  // Get stats from data
  const getStats = () => {
    const features = props.cableData.features;
    const depths = features.map(f => f.properties.depth).filter(d => d !== undefined);
    const distances = features.map(f => f.properties.totalDistance).filter(d => d !== undefined) as number[];
    const lineWidths = features.map(f => f.properties.style?.lineWidth).filter(w => w !== undefined) as number[];
    
    return {
      totalFeatures: features.length,
      depthMin: depths.length > 0 ? Math.min(...depths) : 0,
      depthMax: depths.length > 0 ? Math.max(...depths) : 10,
      distanceMin: distances.length > 0 ? Math.min(...distances) : 0,
      distanceMax: distances.length > 0 ? Math.max(...distances) : 10000,
      lineWidthMin: lineWidths.length > 0 ? Math.min(...lineWidths) : 0,
      lineWidthMax: lineWidths.length > 0 ? Math.max(...lineWidths) : 20,
    };
  };

  const stats = getStats();

  return (
    <div 
      class="absolute left-[376px] top-6 bg-white rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] w-[360px] h-[calc(100vh-48px)] flex flex-col z-[999]"
      style={{"font-family": "'Poppins', sans-serif"}}
    >
      {/* Header */}
      <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="text-[28px]">🔍</div>
          <div>
            <h2 class="text-xl font-bold text-gray-800 m-0 tracking-[-0.5px]">Filter Data</h2>
            <p class="text-[13px] text-gray-500 m-0 mt-0.5">{stats.totalFeatures} total cables</p>
          </div>
        </div>
        <button 
          class="bg-gray-100 text-gray-600 w-10 h-10 rounded-[12px] cursor-pointer flex items-center justify-center text-base transition-all duration-200 hover:bg-gray-200 border-none shadow-sm"
          onClick={props.onClose}
          title="Close filters"
        >
          ✕
        </button>
      </div>

      {/* Filter Content */}
      <div class="flex-1 overflow-y-auto px-6 py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
        
        {/* Soil Type Filter */}
        <div class="mb-5">
          <button
            class="flex items-center justify-between w-full text-left mb-3 bg-transparent border-none cursor-pointer p-0"
            onClick={() => toggleSection('soilType')}
          >
            <h3 class="text-[16px] font-bold text-gray-800 m-0">Soil Type</h3>
            <span class="text-[18px] text-gray-500 transition-transform duration-200" style={{ transform: expandedSections().has('soilType') ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </button>
          
          <Show when={expandedSections().has('soilType')}>
            <div class="flex flex-col gap-2">
              <For each={soilTypeOptions}>
                {(option) => (
                  <label class="flex items-center gap-3 cursor-pointer p-3 rounded-[12px] bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <input
                      type="checkbox"
                      checked={selectedSoilTypes().includes(option.value)}
                      onChange={() => toggleSoilType(option.value)}
                      class="w-5 h-5 cursor-pointer accent-blue-500"
                    />
                    <div class="w-4 h-4 rounded-full border-2 border-gray-300" style={{ 'background-color': option.color }} />
                    <span class="text-[15px] font-medium text-gray-700 flex-1">{option.label}</span>
                  </label>
                )}
              </For>
            </div>
          </Show>
        </div>

        {/* Depth Range Filter */}
        <div class="mb-5">
          <button
            class="flex items-center justify-between w-full text-left mb-3 bg-transparent border-none cursor-pointer p-0"
            onClick={() => toggleSection('depth')}
          >
            <h3 class="text-[16px] font-bold text-gray-800 m-0">Depth Range (m)</h3>
            <span class="text-[18px] text-gray-500 transition-transform duration-200" style={{ transform: expandedSections().has('depth') ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </button>
          
          <Show when={expandedSections().has('depth')}>
            <div class="bg-gray-50 rounded-[12px] p-4">
              <div class="flex items-center gap-3 mb-3">
                <div class="flex-1">
                  <label class="text-[13px] font-semibold text-gray-600 mb-1 block">Min</label>
                  <input
                    type="number"
                    value={depthMin()}
                    onInput={(e) => setDepthMin(parseFloat(e.currentTarget.value) || 0)}
                    min={stats.depthMin}
                    max={stats.depthMax}
                    step="0.1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <span class="text-gray-400 mt-6">—</span>
                <div class="flex-1">
                  <label class="text-[13px] font-semibold text-gray-600 mb-1 block">Max</label>
                  <input
                    type="number"
                    value={depthMax()}
                    onInput={(e) => setDepthMax(parseFloat(e.currentTarget.value) || 10)}
                    min={stats.depthMin}
                    max={stats.depthMax}
                    step="0.1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <p class="text-[12px] text-gray-500 m-0">Range: {stats.depthMin.toFixed(1)}m - {stats.depthMax.toFixed(1)}m</p>
            </div>
          </Show>
        </div>

        {/* Distance Range Filter */}
        <div class="mb-5">
          <button
            class="flex items-center justify-between w-full text-left mb-3 bg-transparent border-none cursor-pointer p-0"
            onClick={() => toggleSection('distance')}
          >
            <h3 class="text-[16px] font-bold text-gray-800 m-0">Distance Range (m)</h3>
            <span class="text-[18px] text-gray-500 transition-transform duration-200" style={{ transform: expandedSections().has('distance') ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </button>
          
          <Show when={expandedSections().has('distance')}>
            <div class="bg-gray-50 rounded-[12px] p-4">
              <div class="flex items-center gap-3 mb-3">
                <div class="flex-1">
                  <label class="text-[13px] font-semibold text-gray-600 mb-1 block">Min</label>
                  <input
                    type="number"
                    value={distanceMin()}
                    onInput={(e) => setDistanceMin(parseFloat(e.currentTarget.value) || 0)}
                    min={stats.distanceMin}
                    max={stats.distanceMax}
                    step="10"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <span class="text-gray-400 mt-6">—</span>
                <div class="flex-1">
                  <label class="text-[13px] font-semibold text-gray-600 mb-1 block">Max</label>
                  <input
                    type="number"
                    value={distanceMax()}
                    onInput={(e) => setDistanceMax(parseFloat(e.currentTarget.value) || 10000)}
                    min={stats.distanceMin}
                    max={stats.distanceMax}
                    step="10"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <p class="text-[12px] text-gray-500 m-0">Range: {stats.distanceMin.toFixed(0)}m - {stats.distanceMax.toFixed(0)}m</p>
            </div>
          </Show>
        </div>

        {/* Line Width Filter */}
        <div class="mb-5">
          <button
            class="flex items-center justify-between w-full text-left mb-3 bg-transparent border-none cursor-pointer p-0"
            onClick={() => toggleSection('lineWidth')}
          >
            <h3 class="text-[16px] font-bold text-gray-800 m-0">Line Width</h3>
            <span class="text-[18px] text-gray-500 transition-transform duration-200" style={{ transform: expandedSections().has('lineWidth') ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </button>
          
          <Show when={expandedSections().has('lineWidth')}>
            <div class="bg-gray-50 rounded-[12px] p-4">
              <div class="flex items-center gap-3 mb-3">
                <div class="flex-1">
                  <label class="text-[13px] font-semibold text-gray-600 mb-1 block">Min</label>
                  <input
                    type="number"
                    value={lineWidthMin()}
                    onInput={(e) => setLineWidthMin(parseFloat(e.currentTarget.value) || 0)}
                    min={stats.lineWidthMin}
                    max={stats.lineWidthMax}
                    step="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <span class="text-gray-400 mt-6">—</span>
                <div class="flex-1">
                  <label class="text-[13px] font-semibold text-gray-600 mb-1 block">Max</label>
                  <input
                    type="number"
                    value={lineWidthMax()}
                    onInput={(e) => setLineWidthMax(parseFloat(e.currentTarget.value) || 20)}
                    min={stats.lineWidthMin}
                    max={stats.lineWidthMax}
                    step="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <p class="text-[12px] text-gray-500 m-0">Range: {stats.lineWidthMin} - {stats.lineWidthMax}</p>
            </div>
          </Show>
        </div>

      </div>

      {/* Action Buttons */}
      <div class="px-6 py-4 border-t border-gray-100 flex gap-3">
        <button
          class="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-3 rounded-[16px] font-bold text-[15px] cursor-pointer transition-all duration-200 hover:shadow-[0_4px_16px_rgba(59,130,246,0.4)] hover:scale-[1.02] border-none"
          onClick={applyFilters}
        >
          Apply Filters
        </button>
        <button
          class="bg-gray-100 text-gray-700 px-4 py-3 rounded-[16px] font-semibold text-[15px] cursor-pointer transition-all duration-200 hover:bg-gray-200 border-none"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
