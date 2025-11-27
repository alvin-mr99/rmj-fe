import { createSignal, Show, For } from 'solid-js';
import type { CableFeatureCollection } from '../types';

interface RightSidebarProps {
  cableData: CableFeatureCollection | null;
  fileName?: string;
  fileSize?: number;
  onChangeFile?: () => void;
  onLoadToMap?: () => void;
  onCancel?: () => void;
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

  // Calculate statistics from cable data
  const calculateStats = () => {
    if (!props.cableData) {
      return {
        cableRoutes: 0,
        totalPoints: 0,
        totalSegments: 0,
        totalDistance: 0
      };
    }

    const features = props.cableData.features;
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

  return (
    <div 
      class={`fixed right-4 bg-white rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-[width,top] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-[1000] flex flex-col flex-shrink-0 h-[calc(100vh-86px)] ${isMinimized() ? 'w-[60px] top-[78px]' : 'w-[380px] top-[78px]'}`}
      style={{"font-family": "'Poppins', sans-serif"}}
    >
      {/* Header */}
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <Show when={!isMinimized()}>
          <div class="flex items-center gap-2.5 animate-[fadeIn_0.3s_ease-in]">
            <div class="text-[20px]">📤</div>
            <h2 class="text-[16px] font-bold text-gray-800 m-0 tracking-[-0.5px]">KML Details</h2>
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
        <div class="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Empty State - No KML Data */}
          <Show when={!props.cableData || props.cableData.features.length === 0}>
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

          {/* File Info - Only show when there's data */}
          <Show when={props.cableData && props.cableData.features.length > 0}>
            <div class="bg-gray-50 rounded-[12px] p-3 mb-3 flex items-center justify-between">
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <div class="w-9 h-9 bg-green-500 rounded-[8px] flex items-center justify-center text-white text-[18px] flex-shrink-0">
                  ✓
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[11px] font-semibold text-gray-800 m-0 mb-0.5 truncate" title={props.fileName}>
                    {truncateFileName(props.fileName)}
                  </p>
                  <p class="text-[10px] text-gray-500 m-0">{formatFileSize(props.fileSize)}</p>
                </div>
              </div>
              <button
                class="px-2.5 py-1.5 bg-white text-gray-700 text-[11px] font-medium rounded-[8px] border border-gray-200 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 flex-shrink-0"
                onClick={props.onChangeFile}
              >
                Change
              </button>
            </div>
          </Show>

          {/* Statistics Grid - Only show when there's data */}
          <Show when={props.cableData && props.cableData.features.length > 0}>
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
                <For each={props.cableData?.features.slice(0, 20)}>
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
        <Show when={props.cableData && props.cableData.features.length > 0}>
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
    </div>
  );
}
