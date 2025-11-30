import { createSignal, Show, For, createMemo } from 'solid-js';
import type { KMLFileData, BoQFileData } from '../types';

interface RightSidebarProps {
  kmlFiles: KMLFileData[];
  selectedKmlId: string | null;
  onKmlSelect: (id: string) => void;
  boqFiles: BoQFileData[];
  selectedBoqId: string | null;
  onBoqSelect: (id: string) => void;
  onChangeFile?: () => void;
  onCancel?: () => void;
  onUploadBoQ?: () => void;
}

interface StatCard {
  id: string;
  icon: string;
  label: string;
  value: string | number;
  bgColor: string;
  textColor: string;
}

export function RightSidebar(props: RightSidebarProps) {
  const [isMinimized, setIsMinimized] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal<'kml' | 'boq'>('kml');
  
  // Get currently selected KML file
  const selectedKml = createMemo(() => {
    return props.kmlFiles.find(f => f.id === props.selectedKmlId) || null;
  });
  
  // Get currently selected BOQ file
  const selectedBoq = createMemo(() => {
    return props.boqFiles.find(f => f.id === props.selectedBoqId) || null;
  });
  
  // Get cable data from selected KML
  const cableData = createMemo(() => {
    const kml = selectedKml();
    return kml ? kml.data : null;
  });
  
  // Get BOQ data from selected BOQ file
  const boqData = createMemo(() => {
    const boq = selectedBoq();
    return boq ? boq.data : null;
  });

  // Calculate statistics from cable data
  const calculateStats = () => {
    const data = cableData();
    if (!data) {
      return {
        cableRoutes: 0,
        totalPoints: 0,
        totalSegments: 0,
        totalDistance: 0
      };
    }

    const features = data.features;
    const cableRoutes = features.length;
    
    let totalPoints = 0;
    let totalSegments = 0;
    let totalDistance = 0;

    features.forEach(feature => {
      if (feature.geometry.type === 'LineString') {
        const coords = feature.geometry.coordinates;
        totalPoints += coords.length;
        totalSegments += coords.length - 1;
        
        // Calculate distance if available in properties
        if (feature.properties.totalDistance) {
          totalDistance += feature.properties.totalDistance;
        }
      }
    });

    return {
      cableRoutes,
      totalPoints,
      totalSegments,
      totalDistance: (totalDistance / 1000).toFixed(2) // Convert to km
    };
  };

  const stats = () => calculateStats();

  const statCards = (): StatCard[] => [
    {
      id: 'routes',
      icon: '🗺️',
      label: 'CABLE ROUTES',
      value: stats().cableRoutes,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      id: 'points',
      icon: '📍',
      label: 'TOTAL POINTS',
      value: stats().totalPoints,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      id: 'segments',
      icon: '📏',
      label: 'TOTAL SEGMENTS',
      value: stats().totalSegments,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      id: 'distance',
      icon: '📐',
      label: 'TOTAL DISTANCE',
      value: `${stats().totalDistance} km`,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  const truncateFileName = (name?: string) => {
    if (!name) return 'No file selected';
    if (name.length > 30) {
      return name.substring(0, 30) + '...';
    }
    return name;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div 
      class={`fixed right-4 bg-white rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-[width,top] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-[1000] flex flex-col flex-shrink-0 h-[calc(100vh-86px)] ${isMinimized() ? 'w-[60px] top-[78px]' : 'w-[380px] top-[78px]'}`}
      style={{"font-family": "'Poppins', sans-serif"}}
    >
      {/* Header */}
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <Show when={!isMinimized()}>
          <div class="flex items-center gap-2.5 animate-[fadeIn_0.3s_ease-in]">
            <div class="text-[20px]">{activeTab() === 'kml' ? '📤' : '📊'}</div>
            <h2 class="text-[16px] font-bold text-gray-800 m-0 tracking-[-0.5px]">
              {activeTab() === 'kml' ? 'KML Details' : 'BOQ Details'}
            </h2>
          </div>
        </Show>
        <button 
          class="bg-blue-500 text-white w-8 h-8 rounded-[10px] cursor-pointer flex items-center justify-center text-[13px] transition-all duration-200 hover:bg-blue-600 hover:scale-105 border-none shadow-sm"
          onClick={() => setIsMinimized(!isMinimized())}
          title={isMinimized() ? 'Expand sidebar' : 'Minimize sidebar'}
        >
          {isMinimized() ? '←' : '→'}
        </button>
      </div>

      <Show when={!isMinimized()}>
        {/* Tab Navigation */}
        <div class="flex border-b border-gray-100 px-4 pt-2">
          <button
            class={`flex-1 px-4 py-2.5 text-[12px] font-semibold transition-all duration-200 border-b-2 ${
              activeTab() === 'kml'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('kml')}
          >
            📤 KML
          </button>
          <button
            class={`flex-1 px-4 py-2.5 text-[12px] font-semibold transition-all duration-200 border-b-2 ${
              activeTab() === 'boq'
                ? 'text-green-600 border-green-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('boq')}
          >
            📊 BOQ
          </button>
        </div>

        {/* KML Tab Content */}
        <Show when={activeTab() === 'kml'}>
        <div class="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Empty State - No KML Data */}
          <Show when={props.kmlFiles.length === 0}>
            <div class="flex flex-col items-center justify-center py-10 px-3 text-center">
              <div class="text-[56px] mb-3 opacity-50">📭</div>
              <h3 class="text-[16px] font-semibold text-gray-800 m-0 mb-1.5">No KML Data</h3>
              <p class="text-[13px] text-gray-500 m-0 mb-5 max-w-[240px]">
                Upload a KML file to view cable routes and details
              </p>
              <button
                class="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[13px] font-semibold rounded-[10px] cursor-pointer transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:scale-[1.02] border-none shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
                onClick={props.onChangeFile}
              >
                Upload KML File
              </button>
            </div>
          </Show>

          {/* KML File Dropdown - Show when there are files */}
          <Show when={props.kmlFiles.length > 0}>
            <div class="mb-3">
              <label class="text-[11px] font-semibold text-gray-600 uppercase tracking-wide block mb-2">Select KML File</label>
              <select
                class="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-[10px] bg-white text-gray-800 cursor-pointer transition-all duration-200 hover:border-blue-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={props.selectedKmlId || ''}
                onChange={(e) => props.onKmlSelect(e.currentTarget.value)}
              >
                <For each={props.kmlFiles}>
                  {(file) => (
                    <option value={file.id}>{file.fileName}</option>
                  )}
                </For>
              </select>
              <button
                class="w-full mt-2 px-3 py-2 text-[11px] font-medium text-blue-600 bg-blue-50 rounded-[8px] border border-blue-200 cursor-pointer transition-all duration-200 hover:bg-blue-100"
                onClick={props.onChangeFile}
              >
                + Add More KML Files
              </button>
            </div>
          </Show>

          {/* File Info - Only show when a file is selected */}
          <Show when={selectedKml()}>
            <div class="bg-gray-50 rounded-[12px] p-3 mb-3 flex items-center justify-between">
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <div class="w-9 h-9 bg-green-500 rounded-[8px] flex items-center justify-center text-white text-[18px] flex-shrink-0">
                  ✓
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[11px] font-semibold text-gray-800 m-0 mb-0.5 truncate" title={selectedKml()?.fileName}>
                    {truncateFileName(selectedKml()?.fileName)}
                  </p>
                  <p class="text-[10px] text-gray-500 m-0">{formatFileSize(selectedKml()?.fileSize)}</p>
                </div>
              </div>
            </div>
          </Show>

          {/* Statistics Grid - Only show when a file is selected and has data */}
          <Show when={cableData() && cableData()!.features.length > 0}>
            <div class="grid grid-cols-2 gap-2 mb-3">
              <For each={statCards()}>
                {(card) => (
                  <div class={`${card.bgColor} rounded-[12px] p-2.5 transition-all duration-200 hover:scale-[1.02]`}>
                    <div class="flex items-center gap-1.5 mb-1">
                      <span class="text-[14px]">{card.icon}</span>
                      <p class={`text-[9px] font-bold ${card.textColor} m-0 tracking-wide`}>
                        {card.label}
                      </p>
                    </div>
                    <p class={`text-[20px] font-bold ${card.textColor} m-0`}>
                      {card.value}
                    </p>
                  </div>
                )}
              </For>
            </div>

            {/* Route Details */}
            <div class="mb-3">
              <h3 class="text-[13px] font-bold text-gray-800 m-0 mb-2">Route Details</h3>
              <div class="space-y-1.5 max-h-[220px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                <For each={cableData()?.features.slice(0, 20)}>
                  {(feature, index) => (
                    <div class="bg-gray-50 rounded-[8px] p-2.5 flex items-center gap-2 transition-all duration-200 hover:bg-gray-100">
                      <div class="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[6px] flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0">
                        {index() + 1}
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-[11px] font-semibold text-gray-800 m-0 mb-0.5 truncate">
                          {feature.properties.name || feature.properties.id || `Route ${index() + 1}`}
                        </p>
                        <p class="text-[10px] text-gray-500 m-0">
                          {feature.properties.soilType} • {feature.properties.depth}m depth
                        </p>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </div>

        {/* Footer Actions - Only show when there's data */}
        <Show when={cableData() && cableData()!.features.length > 0}>
          <div class="px-4 py-3 border-t border-gray-100">
            <div class="flex gap-2">
              <button
                class="flex-1 px-3 py-2 bg-white text-gray-700 text-[11px] font-semibold rounded-[8px] border border-gray-200 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-300"
                onClick={props.onCancel}
              >
                Close
              </button>
              <button
                class="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[11px] font-semibold rounded-[8px] cursor-pointer transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:scale-[1.02] border-none shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
                onClick={props.onChangeFile}
              >
                Change File
              </button>
            </div>
          </div>
        </Show>
        </Show>

        {/* BOQ Tab Content */}
        <Show when={activeTab() === 'boq'}>
          <div class="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {/* Empty State - No BOQ Data */}
            <Show when={props.boqFiles.length === 0}>
              <div class="flex flex-col items-center justify-center py-10 px-3 text-center">
                <div class="text-[56px] mb-3 opacity-50">📊</div>
                <h3 class="text-[16px] font-semibold text-gray-800 m-0 mb-1.5">No BOQ Data</h3>
                <p class="text-[13px] text-gray-500 m-0 mb-5 max-w-[240px]">
                  Upload an Excel file to view Bill of Quantity details
                </p>
                <button
                  class="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[13px] font-semibold rounded-[10px] cursor-pointer transition-all duration-200 hover:from-green-600 hover:to-emerald-700 hover:scale-[1.02] border-none shadow-[0_4px_12px_rgba(34,197,94,0.3)]"
                  onClick={props.onUploadBoQ}
                >
                  Upload BOQ File
                </button>
              </div>
            </Show>

            {/* BOQ File Dropdown - Show when there are files */}
            <Show when={props.boqFiles.length > 0}>
              <div class="mb-3">
                <label class="text-[11px] font-semibold text-gray-600 uppercase tracking-wide block mb-2">Select BOQ File</label>
                <select
                  class="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-[10px] bg-white text-gray-800 cursor-pointer transition-all duration-200 hover:border-green-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  value={props.selectedBoqId || ''}
                  onChange={(e) => props.onBoqSelect(e.currentTarget.value)}
                >
                  <For each={props.boqFiles}>
                    {(file) => (
                      <option value={file.id}>{file.fileName}</option>
                    )}
                  </For>
                </select>
                <button
                  class="w-full mt-2 px-3 py-2 text-[11px] font-medium text-green-600 bg-green-50 rounded-[8px] border border-green-200 cursor-pointer transition-all duration-200 hover:bg-green-100"
                  onClick={props.onUploadBoQ}
                >
                  + Add More BOQ Files
                </button>
              </div>
            </Show>

            {/* BOQ Summary - Only show when there's data */}
            <Show when={boqData()}>
              <div class="bg-gray-50 rounded-[12px] p-3 mb-3">
                <h3 class="text-[13px] font-bold text-gray-800 m-0 mb-2">Summary</h3>
                <div class="grid grid-cols-2 gap-2">
                  <div class="bg-white rounded-[8px] p-2.5">
                    <p class="text-[9px] font-bold text-green-600 m-0 mb-1 tracking-wide">TOTAL ITEMS</p>
                    <p class="text-[18px] font-bold text-green-600 m-0">{boqData()?.summary.totalItems || 0}</p>
                  </div>
                  <div class="bg-white rounded-[8px] p-2.5">
                    <p class="text-[9px] font-bold text-blue-600 m-0 mb-1 tracking-wide">TOTAL COST</p>
                    <p class="text-[11px] font-bold text-blue-600 m-0 truncate" title={formatCurrency(boqData()?.summary.totalCost || 0)}>
                      {formatCurrency(boqData()?.summary.totalCost || 0)}
                    </p>
                  </div>
                  <div class="bg-white rounded-[8px] p-2.5">
                    <p class="text-[9px] font-bold text-purple-600 m-0 mb-1 tracking-wide">MATERIAL</p>
                    <p class="text-[11px] font-bold text-purple-600 m-0 truncate" title={formatCurrency(boqData()?.summary.materialCost || 0)}>
                      {formatCurrency(boqData()?.summary.materialCost || 0)}
                    </p>
                  </div>
                  <div class="bg-white rounded-[8px] p-2.5">
                    <p class="text-[9px] font-bold text-orange-600 m-0 mb-1 tracking-wide">LABOR</p>
                    <p class="text-[11px] font-bold text-orange-600 m-0 truncate" title={formatCurrency(boqData()?.summary.laborCost || 0)}>
                      {formatCurrency(boqData()?.summary.laborCost || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* BOQ Items List */}
              <div class="mb-3">
                <h3 class="text-[13px] font-bold text-gray-800 m-0 mb-2">Items</h3>
                <div class="space-y-1.5 max-h-[400px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                  <For each={boqData()?.items}>
                    {(item, index) => (
                      <div class="bg-gray-50 rounded-[8px] p-2.5 transition-all duration-200 hover:bg-gray-100">
                        <div class="flex items-start gap-2 mb-1">
                          <div class="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-[6px] flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                            {index() + 1}
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="text-[11px] font-semibold text-gray-800 m-0 mb-0.5">{item.description}</p>
                            <div class="flex items-center gap-2 text-[10px] text-gray-500">
                              <span>{item.quantity} {item.unit}</span>
                              <span>×</span>
                              <span>{formatCurrency(item.unitPrice)}</span>
                            </div>
                          </div>
                          <div class="text-right flex-shrink-0">
                            <p class="text-[11px] font-bold text-green-600 m-0">{formatCurrency(item.totalPrice)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>
          </div>
        </Show>
      </Show>
    </div>
  );
}
