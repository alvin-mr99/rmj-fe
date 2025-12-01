import { createSignal, Show, For } from 'solid-js';
import type { KMLFileData, BoQFileData } from '../types';

interface SidebarProps {
  kmlFiles?: KMLFileData[];
  selectedKmlId?: string | null;
  onKmlSelect?: (id: string) => void;
  onKmlDelete?: (id: string) => void;
  boqFiles?: BoQFileData[];
  selectedBoqId?: string | null;
  onBoqSelect?: (id: string) => void;
  onBoqDelete?: (id: string) => void;
  onUploadClick: () => void;
  onUploadBoQClick?: () => void;
  onDashboardClick?: () => void;
  onAnalyticsClick?: () => void;
  onFilteringClick?: () => void;
  onTopologyClick?: () => void;
}

export function Sidebar(props: SidebarProps) {
  const [isMinimized, setIsMinimized] = createSignal(false);
  const [activeMenu, setActiveMenu] = createSignal<string>('dashboard');
  const [searchQuery, setSearchQuery] = createSignal('');
  const [boqSearchQuery, setBoqSearchQuery] = createSignal('');
  
  // Filter KML files based on search query
  const filteredKmlFiles = () => {
    const query = searchQuery().toLowerCase();
    if (!query) return props.kmlFiles || [];
    return (props.kmlFiles || []).filter(file => 
      file.fileName.toLowerCase().includes(query)
    );
  };
  
  // Filter BOQ files based on search query
  const filteredBoqFiles = () => {
    const query = boqSearchQuery().toLowerCase();
    if (!query) return props.boqFiles || [];
    return (props.boqFiles || []).filter(file => 
      file.fileName.toLowerCase().includes(query)
    );
  };
  
  // Get color for each KML file (cycling through colors)
  const getKmlColor = (index: number) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];
    return colors[index % colors.length];
  };
  
  // Get color for each BOQ file (green tones)
  const getBoqColor = (index: number) => {
    const colors = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#14b8a6', '#0d9488'];
    return colors[index % colors.length];
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      icon: '📊', 
      label: 'Dashboard', 
      subtitle: 'Main overview', 
      description: 'View system statistics and overview',
      onClick: props.onDashboardClick 
    },
    { 
      id: 'upload', 
      icon: '📁', 
      label: 'Upload File', 
      subtitle: 'Import KML data', 
      description: 'Upload and import KML cable data',
      onClick: props.onUploadClick 
    },
    { 
      id: 'upload-boq', 
      icon: '📑', 
      label: 'Upload File BoQ', 
      subtitle: 'Import BoQ data', 
      description: 'Upload and import BoQ data',
      onClick: props.onUploadBoQClick 
    },
    { 
      id: 'analytics', 
      icon: '📈', 
      label: 'Analytics', 
      subtitle: 'Data analysis', 
      description: 'Analyze cable network data',
      onClick: props.onAnalyticsClick 
    },
    { 
      id: 'filtering', 
      icon: '🔍', 
      label: 'Filtering', 
      subtitle: 'Filter data', 
      description: 'Filter and search cable networks',
      onClick: props.onFilteringClick 
    },
    { 
      id: 'topology', 
      icon: '⚙️', 
      label: 'Topology Settings', 
      subtitle: 'Configuration', 
      description: 'Configure network topology',
      onClick: props.onTopologyClick 
    },
  ];

  const handleMenuClick = (id: string, onClick?: () => void) => {
    setActiveMenu(id);
    onClick?.();
  };

  return (
    <div 
      class={`fixed left-4 top-4 bg-white rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-[1000] flex flex-col flex-shrink-0 h-[calc(100vh-32px)] ${isMinimized() ? 'w-[60px]' : 'w-[280px]'}`}
      style={{"font-family": "'Poppins', sans-serif"}}
    >
      <div class="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <Show when={!isMinimized()}>
          <div class="flex items-center gap-2 animate-[fadeIn_0.3s_ease-in]">
            <h2 class="text-sm font-bold text-gray-800 m-0 tracking-[-0.5px]">SmartWFM RMJ - Telkominfra</h2>
          </div>
        </Show>
        <button 
          class="bg-blue-500 text-white w-9 h-9 rounded-[10px] cursor-pointer flex items-center justify-center text-sm transition-all duration-200 hover:bg-blue-600 hover:scale-105 border-none shadow-sm"
          onClick={() => setIsMinimized(!isMinimized())}
          title={isMinimized() ? 'Expand sidebar' : 'Minimize sidebar'}
        >
          {isMinimized() ? '→' : '←'}
        </button>
      </div>

      <nav class="flex-1 py-3 px-3 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
        {/* Data Layer Section - Only show when not minimized */}
        <Show when={!isMinimized()}>
          <div class="mb-4 animate-[fadeIn_0.3s_ease-in]">
            <div class="flex items-center justify-between mb-2 px-1">
              <h3 class="text-[13px] font-bold text-gray-700 m-0 tracking-wide">DATA LAYER</h3>
              <span class="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {props.kmlFiles?.length || 0}
              </span>
            </div>
            
            {/* Search Input */}
            <Show when={(props.kmlFiles?.length || 0) > 0}>
              <div class="mb-3">
                <input
                  type="text"
                  placeholder="Search ruas layers..."
                  value={searchQuery()}
                  onInput={(e) => setSearchQuery(e.currentTarget.value)}
                  class="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-[10px] bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all duration-200"
                />
              </div>
            </Show>
            
            {/* KML Files List */}
            <div class="space-y-1.5 max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
              <Show 
                when={(props.kmlFiles?.length || 0) > 0}
                fallback={
                  <div class="text-center py-6 px-3">
                    <div class="text-[32px] mb-2 opacity-40">📁</div>
                    <p class="text-[12px] text-gray-500 m-0">No KML files uploaded</p>
                  </div>
                }
              >
                <For each={filteredKmlFiles()}>
                  {(file, index) => (
                    <div 
                      class={`group relative flex items-center gap-2 p-2.5 rounded-[10px] cursor-pointer transition-all duration-200 ${
                        props.selectedKmlId === file.id
                          ? 'bg-blue-50 border-2 border-blue-400'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-200'
                      }`}
                      onClick={() => props.onKmlSelect?.(file.id)}
                    >
                      {/* Color Indicator */}
                      <div 
                        class="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ "background-color": getKmlColor(index()) }}
                      />
                      
                      {/* File Info */}
                      <div class="flex-1 min-w-0">
                        <p class="text-[12px] font-semibold text-gray-800 m-0 truncate" title={file.fileName}>
                          {file.fileName.replace('.kml', '')}
                        </p>
                        <p class="text-[10px] text-gray-500 m-0">
                          {file.data.features.length} features
                        </p>
                      </div>
                      
                      {/* Selected Indicator */}
                      <Show when={props.selectedKmlId === file.id}>
                        <div class="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <span class="text-white text-[10px]">✓</span>
                        </div>
                      </Show>
                      
                      {/* Delete Button */}
                      <button
                        class="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 hover:scale-110 border-none cursor-pointer z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete ${file.fileName}?`)) {
                            props.onKmlDelete?.(file.id);
                          }
                        }}
                        title="Delete this KML file"
                      >
                        <span class="text-[12px] leading-none">×</span>
                      </button>
                    </div>
                  )}
                </For>
              </Show>
              
              {/* Show message if search has no results */}
              <Show when={searchQuery() && filteredKmlFiles().length === 0}>
                <div class="text-center py-4 px-3">
                  <p class="text-[12px] text-gray-500 m-0">No files match "{searchQuery()}"</p>
                </div>
              </Show>
            </div>
          </div>
          
          {/* BOQ Data Layer Section */}
          <div class="mb-4 animate-[fadeIn_0.3s_ease-in]">
            <div class="flex items-center justify-between mb-2 px-1">
              <h3 class="text-[13px] font-bold text-gray-700 m-0 tracking-wide">BOQ DATA</h3>
              <span class="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {props.boqFiles?.length || 0}
              </span>
            </div>
            
            {/* Search Input for BOQ */}
            <Show when={(props.boqFiles?.length || 0) > 0}>
              <div class="mb-3">
                <input
                  type="text"
                  placeholder="Search BOQ files..."
                  value={boqSearchQuery()}
                  onInput={(e) => setBoqSearchQuery(e.currentTarget.value)}
                  class="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-[10px] bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-400 focus:bg-white transition-all duration-200"
                />
              </div>
            </Show>
            
            {/* BOQ Files List */}
            <div class="space-y-1.5 max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
              <Show 
                when={(props.boqFiles?.length || 0) > 0}
                fallback={
                  <div class="text-center py-6 px-3">
                    <div class="text-[32px] mb-2 opacity-40">📊</div>
                    <p class="text-[12px] text-gray-500 m-0">No BOQ files uploaded</p>
                  </div>
                }
              >
                <For each={filteredBoqFiles()}>
                  {(file, index) => (
                    <div 
                      class={`group relative flex items-center gap-2 p-2.5 rounded-[10px] cursor-pointer transition-all duration-200 ${
                        props.selectedBoqId === file.id
                          ? 'bg-green-50 border-2 border-green-400'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-200'
                      }`}
                      onClick={() => props.onBoqSelect?.(file.id)}
                    >
                      {/* Color Indicator */}
                      <div 
                        class="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ "background-color": getBoqColor(index()) }}
                      />
                      
                      {/* File Info */}
                      <div class="flex-1 min-w-0">
                        <p class="text-[12px] font-semibold text-gray-800 m-0 truncate" title={file.fileName}>
                          {file.fileName.replace('.xlsx', '').replace('.xls', '')}
                        </p>
                        <p class="text-[10px] text-gray-500 m-0">
                          {file.data.items.length} items
                        </p>
                      </div>
                      
                      {/* Selected Indicator */}
                      <Show when={props.selectedBoqId === file.id}>
                        <div class="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                          <span class="text-white text-[10px]">✓</span>
                        </div>
                      </Show>
                      
                      {/* Delete Button */}
                      <button
                        class="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 hover:scale-110 border-none cursor-pointer z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete ${file.fileName}?`)) {
                            props.onBoqDelete?.(file.id);
                          }
                        }}
                        title="Delete this BOQ file"
                      >
                        <span class="text-[12px] leading-none">×</span>
                      </button>
                    </div>
                  )}
                </For>
              </Show>
              
              {/* Show message if search has no results */}
              <Show when={boqSearchQuery() && filteredBoqFiles().length === 0}>
                <div class="text-center py-4 px-3">
                  <p class="text-[12px] text-gray-500 m-0">No files match "{boqSearchQuery()}"</p>
                </div>
              </Show>
            </div>
          </div>
          
          {/* Divider */}
          <div class="border-t border-gray-200 my-3" />
        </Show>
        
        <For each={menuItems}>
          {(item) => (
            <button
              class={`relative flex items-center gap-3 w-full px-3 py-3 mb-2 border-none rounded-[16px] font-medium cursor-pointer transition-all duration-300 text-left ${
                isMinimized() ? 'justify-center px-2' : ''
              } ${
                activeMenu() === item.id 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_4px_16px_rgba(59,130,246,0.4)] scale-[1.02]' 
                  : 'bg-white hover:bg-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
              }`}
              onClick={() => handleMenuClick(item.id, item.onClick)}
              title={isMinimized() ? item.label : ''}
              style={{"font-family": "'Poppins', sans-serif"}}
            >
              <div class={`flex items-center justify-center w-[44px] h-[44px] rounded-[14px] flex-shrink-0 transition-all duration-300 ${
                activeMenu() === item.id 
                  ? 'bg-white/20' 
                  : 'bg-gray-100'
              }`}>
                <span class={`text-[20px] transition-all duration-300 ${
                  activeMenu() === item.id ? 'scale-110' : ''
                }`}>
                  {item.icon}
                </span>
              </div>
              <Show when={!isMinimized()}>
                <div class="flex flex-col gap-0.5 animate-[fadeIn_0.3s_ease-in] flex-1">
                  <span class={`text-[15px] font-bold whitespace-nowrap overflow-hidden text-ellipsis ${
                    activeMenu() === item.id ? 'text-white' : 'text-gray-800'
                  }`}>
                    {item.label}
                  </span>
                  <span class={`text-[12px] font-normal ${
                    activeMenu() === item.id ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {item.subtitle}
                  </span>
                </div>
              </Show>
            </button>
          )}
        </For>
      </nav>

      <Show when={!isMinimized()}>
        <div class="py-3 px-4 border-t border-gray-100 animate-[fadeIn_0.3s_ease-in]">
          <div class="text-center">
            <p class="text-[11px] text-gray-500 m-0 mb-1 leading-[1.4]">Underground Cable Management System</p>
            <p class="text-[10px] text-gray-400 m-0 font-medium">v1.0.0</p>
          </div>
        </div>
      </Show>
    </div>
  );
}