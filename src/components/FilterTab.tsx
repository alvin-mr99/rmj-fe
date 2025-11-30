import { createSignal, For } from 'solid-js';
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

  const applyFilters = () => {
    console.log('=== APPLYING FILTERS ===');
    console.log('Selected soil types:', selectedSoilTypes());
    console.log('Depth range:', depthMin(), '-', depthMax());
    console.log('Distance range:', distanceMin(), '-', distanceMax());
    console.log('Line width range:', lineWidthMin(), '-', lineWidthMax());
    console.log('Total features before filter:', props.cableData.features.length);
    
    const filtered = props.cableData.features.filter(feature => {
      const properties = feature.properties;
      
      // Filter by soil type
      if (!selectedSoilTypes().includes(properties.soilType)) {
        console.log(`  ❌ Filtered out ${properties.name || properties.id}: soil type ${properties.soilType} not selected`);
        return false;
      }
      
      // Filter by depth
      if (properties.depth < depthMin() || properties.depth > depthMax()) {
        console.log(`  ❌ Filtered out ${properties.name || properties.id}: depth ${properties.depth}m outside range`);
        return false;
      }
      
      // Filter by distance (if totalDistance exists)
      if (properties.totalDistance !== undefined) {
        if (properties.totalDistance < distanceMin() || properties.totalDistance > distanceMax()) {
          console.log(`  ❌ Filtered out ${properties.name || properties.id}: distance ${properties.totalDistance}m outside range`);
          return false;
        }
      }
      
      // Filter by line width (if style.lineWidth exists)
      if (properties.style?.lineWidth !== undefined) {
        const lineWidth = properties.style.lineWidth;
        if (lineWidth < lineWidthMin() || lineWidth > lineWidthMax()) {
          console.log(`  ❌ Filtered out ${properties.name || properties.id}: line width ${lineWidth} outside range`);
          return false;
        }
      }
      
      console.log(`  ✅ Kept ${properties.name || properties.id}`);
      return true;
    });

    console.log('Total features after filter:', filtered.length);
    console.log('=== FILTER COMPLETE ===');

    props.onFilterChange({
      type: 'FeatureCollection',
      features: filtered
    });
  };

  const resetFilters = () => {
    console.log('=== RESETTING FILTERS ===');
    setSelectedSoilTypes(['Pasir', 'Tanah Liat', 'Batuan']);
    setDepthMin(0);
    setDepthMax(10);
    setDistanceMin(0);
    setDistanceMax(10000);
    setLineWidthMin(0);
    setLineWidthMax(20);
    
    console.log('All filters reset to default values');
    console.log('Showing all', props.cableData.features.length, 'features');
    
    // Apply reset immediately - show all data
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
      class="absolute left-[304px] top-4 bg-white rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] w-[320px] h-[calc(100vh-32px)] flex flex-col z-[999]"
      style={{"font-family": "'Poppins', sans-serif"}}
    >
      {/* Header */}
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <div class="text-[20px]">🔍</div>
          <div>
            <h2 class="text-[16px] font-bold text-gray-800 m-0 tracking-[-0.5px]">Filter Data</h2>
            <p class="text-[11px] text-gray-500 m-0 mt-0.5">{stats.totalFeatures} total cables</p>
          </div>
        </div>
        <button 
          class="bg-gray-100 text-gray-600 w-8 h-8 rounded-[10px] cursor-pointer flex items-center justify-center text-[13px] transition-all duration-200 hover:bg-gray-200 border-none shadow-sm"
          onClick={props.onClose}
          title="Close filters"
        >
          ✕
        </button>
      </div>

      {/* Filter Content */}
      <div class="flex-1 overflow-y-auto px-5 py-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
        
        {/* Soil Type Filter */}
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-[18px]">🏜️</span>
            <h3 class="text-[15px] font-bold text-gray-800 m-0">Soil Type</h3>
          </div>
          
          <div class="flex flex-col gap-2">
            <For each={soilTypeOptions}>
              {(option) => (
                <label class="flex items-center gap-2 cursor-pointer p-2 rounded-[10px] bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                  <input
                    type="checkbox"
                    checked={selectedSoilTypes().includes(option.value)}
                    onChange={() => toggleSoilType(option.value)}
                    class="w-4 h-4 cursor-pointer accent-blue-500"
                  />
                  <div class="w-3 h-3 rounded-full border-2 border-gray-300" style={{ 'background-color': option.color }} />
                  <span class="text-[14px] font-medium text-gray-700 flex-1">{option.label}</span>
                </label>
              )}
            </For>
          </div>
        </div>

        {/* Depth Range Filter */}
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-[18px]">⬇️</span>
            <h3 class="text-[15px] font-bold text-gray-800 m-0">Depth Range (m)</h3>
          </div>
          
          <div class="bg-gray-50 rounded-[10px] p-3">
            <div class="flex items-center gap-2 mb-2">
              <div class="flex-1">
                <label class="text-[12px] font-semibold text-gray-600 mb-1 block">Min</label>
                <input
                  type="number"
                  value={depthMin()}
                  onInput={(e) => setDepthMin(parseFloat(e.currentTarget.value) || 0)}
                  min={stats.depthMin}
                  max={stats.depthMax}
                  step="0.1"
                  class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <span class="text-gray-400 mt-5">—</span>
              <div class="flex-1">
                <label class="text-[12px] font-semibold text-gray-600 mb-1 block">Max</label>
                <input
                  type="number"
                  value={depthMax()}
                  onInput={(e) => setDepthMax(parseFloat(e.currentTarget.value) || 10)}
                  min={stats.depthMin}
                  max={stats.depthMax}
                  step="0.1"
                  class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <p class="text-[11px] text-gray-500 m-0">Range: {stats.depthMin.toFixed(1)}m - {stats.depthMax.toFixed(1)}m</p>
          </div>
        </div>

        {/* Distance Range Filter */}
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-[18px]">📏</span>
            <h3 class="text-[15px] font-bold text-gray-800 m-0">Distance Range (m)</h3>
          </div>
          
          <div class="bg-gray-50 rounded-[10px] p-3">
            <div class="flex items-center gap-2 mb-2">
              <div class="flex-1">
                <label class="text-[12px] font-semibold text-gray-600 mb-1 block">Min</label>
                <input
                  type="number"
                  value={distanceMin()}
                  onInput={(e) => setDistanceMin(parseFloat(e.currentTarget.value) || 0)}
                  min={stats.distanceMin}
                  max={stats.distanceMax}
                  step="10"
                  class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <span class="text-gray-400 mt-5">—</span>
              <div class="flex-1">
                <label class="text-[12px] font-semibold text-gray-600 mb-1 block">Max</label>
                <input
                  type="number"
                  value={distanceMax()}
                  onInput={(e) => setDistanceMax(parseFloat(e.currentTarget.value) || 10000)}
                  min={stats.distanceMin}
                  max={stats.distanceMax}
                  step="10"
                  class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <p class="text-[11px] text-gray-500 m-0">Range: {stats.distanceMin.toFixed(0)}m - {stats.distanceMax.toFixed(0)}m</p>
          </div>
        </div>

        {/* Line Width Filter */}
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-[18px]">📐</span>
            <h3 class="text-[15px] font-bold text-gray-800 m-0">Line Width</h3>
          </div>
          
          <div class="bg-gray-50 rounded-[10px] p-3">
            <div class="flex items-center gap-2 mb-2">
              <div class="flex-1">
                <label class="text-[12px] font-semibold text-gray-600 mb-1 block">Min</label>
                <input
                  type="number"
                  value={lineWidthMin()}
                  onInput={(e) => setLineWidthMin(parseFloat(e.currentTarget.value) || 0)}
                  min={stats.lineWidthMin}
                  max={stats.lineWidthMax}
                  step="1"
                  class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <span class="text-gray-400 mt-5">—</span>
              <div class="flex-1">
                <label class="text-[12px] font-semibold text-gray-600 mb-1 block">Max</label>
                <input
                  type="number"
                  value={lineWidthMax()}
                  onInput={(e) => setLineWidthMax(parseFloat(e.currentTarget.value) || 20)}
                  min={stats.lineWidthMin}
                  max={stats.lineWidthMax}
                  step="1"
                  class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <p class="text-[11px] text-gray-500 m-0">Range: {stats.lineWidthMin} - {stats.lineWidthMax}</p>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div class="px-5 py-3 border-t border-gray-100 flex gap-2">
        <button
          class="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-3 py-2.5 rounded-[14px] font-bold text-[14px] cursor-pointer transition-all duration-200 hover:shadow-[0_4px_16px_rgba(59,130,246,0.4)] hover:scale-[1.02] border-none"
          onClick={applyFilters}
        >
          Apply Filters
        </button>
        <button
          class="bg-gray-100 text-gray-700 px-3 py-2.5 rounded-[14px] font-semibold text-[14px] cursor-pointer transition-all duration-200 hover:bg-gray-200 border-none"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
