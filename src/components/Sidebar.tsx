import { createSignal, Show, For } from 'solid-js';

interface SidebarProps {
  onUploadClick: () => void;
  onDashboardClick?: () => void;
  onAnalyticsClick?: () => void;
  onFilteringClick?: () => void;
  onTopologyClick?: () => void;
}

export function Sidebar(props: SidebarProps) {
  const [isMinimized, setIsMinimized] = createSignal(false);
  const [activeMenu, setActiveMenu] = createSignal<string>('dashboard');

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
            <div class="text-[26px]">🗺️</div>
            <h2 class="text-lg font-bold text-gray-800 m-0 tracking-[-0.5px]">Cable Map</h2>
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