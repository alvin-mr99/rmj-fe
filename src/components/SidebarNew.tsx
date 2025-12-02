import { createSignal, Show, For } from 'solid-js';
import type { ProjectData } from '../types';

interface SidebarProps {
  projects?: ProjectData[];
  selectedProjectId?: string | null;
  onProjectSelect?: (id: string) => void;
  onProjectDelete?: (id: string) => void;
  onUploadClick: () => void;
  onDashboardClick?: () => void;
  onRMJToolsClick?: () => void;
  onAnalyticsClick?: () => void;
  onFilteringClick?: () => void;
  onTopologyClick?: () => void;
  onProjectDetailClick?: (project: ProjectData) => void;
}

export function Sidebar(props: SidebarProps) {
  const [isMinimized, setIsMinimized] = createSignal(false);
  const [activeMenu, setActiveMenu] = createSignal<string>('dashboard');
  const [searchQuery, setSearchQuery] = createSignal('');
  const [expandedProjects, setExpandedProjects] = createSignal<Set<string>>(new Set());
  
  // Filter projects based on search query
  const filteredProjects = () => {
    const query = searchQuery().toLowerCase();
    if (!query) return props.projects || [];
    return (props.projects || []).filter(project => 
      project.projectName.toLowerCase().includes(query) ||
      project.projectCode.toLowerCase().includes(query) ||
      project.kml.fileName.toLowerCase().includes(query) ||
      (project.boq?.fileName.toLowerCase().includes(query))
    );
  };
  
  // Get color for each project (cycling through colors)
  const getProjectColor = (index: number) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];
    return colors[index % colors.length];
  };

  const toggleProjectExpand = (projectId: string) => {
    const expanded = new Set(expandedProjects());
    if (expanded.has(projectId)) {
      expanded.delete(projectId);
    } else {
      expanded.add(projectId);
    }
    setExpandedProjects(expanded);
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      icon: '\uD83D\uDCCA', 
      label: 'Dashboard', 
      subtitle: 'Main overview', 
      description: 'View system statistics and overview',
      onClick: props.onDashboardClick 
    },
    { 
      id: 'rmj-tools', 
      icon: '\uD83D\uDCCB', 
      label: 'RMJ Tools', 
      subtitle: 'Project delivery', 
      description: 'Integrated work management system',
      onClick: props.onRMJToolsClick 
    },
    { 
      id: 'upload', 
      icon: '\uD83D\uDCC1', 
      label: 'Upload Project', 
      subtitle: 'Import project data', 
      description: 'Upload and import KML + BOQ project',
      onClick: props.onUploadClick 
    },
    { 
      id: 'analytics', 
      icon: '\uD83D\uDCC8', 
      label: 'Analytics', 
      subtitle: 'Data analysis', 
      description: 'Analyze cable network data',
      onClick: props.onAnalyticsClick 
    },
    { 
      id: 'filtering', 
      icon: '\uD83D\uDD0D', 
      label: 'Filtering', 
      subtitle: 'Filter data', 
      description: 'Filter and search cable networks',
      onClick: props.onFilteringClick 
    }
  ];

  const handleMenuClick = (id: string, onClick?: () => void) => {
    console.log('Menu clicked:', id, 'onClick exists:', !!onClick);
    setActiveMenu(id);
    if (onClick) {
      console.log('Calling onClick handler');
      onClick();
    }
  };

  return (
    <div 
      class={`fixed left-4 top-4 bg-white rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-[1000] flex flex-col flex-shrink-0 h-[calc(100vh-32px)] ${isMinimized() ? 'w-[70px]' : 'w-[280px]'}`}
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
          {isMinimized() ? '\u2192' : '\u2190'}
        </button>
      </div>

      <nav class="flex-1 py-3 px-3 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
        {/* Projects Section - Only show when not minimized */}
        <Show when={!isMinimized()}>
          <div class="mb-4 animate-[fadeIn_0.3s_ease-in]">
            <div class="flex items-center justify-between mb-2 px-1">
              <h3 class="text-[13px] font-bold text-gray-700 m-0 tracking-wide">PROJECTS</h3>
              <span class="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {props.projects?.length || 0}
              </span>
            </div>
            
            {/* Search Input */}
            <Show when={(props.projects?.length || 0) > 0}>
              <div class="mb-3">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery()}
                  onInput={(e) => setSearchQuery(e.currentTarget.value)}
                  class="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-[10px] bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all duration-200"
                />
              </div>
            </Show>
            
            {/* Projects List */}
            <div class="space-y-2 max-h-[500px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
              <Show 
                when={(props.projects?.length || 0) > 0}
                fallback={
                  <div class="text-center py-6 px-3">
                    <div class="text-[32px] mb-2 opacity-40">{'\uD83D\uDCC1'}</div>
                    <p class="text-[12px] text-gray-500 m-0">No projects uploaded</p>
                    <p class="text-[11px] text-gray-400 m-0 mt-1">Click Upload Project to get started</p>
                  </div>
                }
              >
                <For each={filteredProjects()}>
                  {(project, index) => {
                    const isExpanded = () => expandedProjects().has(project.id);
                    const isSelected = () => props.selectedProjectId === project.id;
                    
                    return (
                      <div 
                        class={`group relative rounded-[10px] transition-all duration-200 ${
                          isSelected()
                            ? 'bg-blue-50 border-2 border-blue-400'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-200'
                        }`}
                      >
                        {/* Project Header */}
                        <div 
                          class="flex items-center gap-2 p-2.5 cursor-pointer"
                          onClick={() => props.onProjectSelect?.(project.id)}
                        >
                          {/* Expand Button */}
                          <button
                            class="w-5 h-5 flex items-center justify-center rounded bg-white border border-gray-300 hover:border-gray-400 transition-colors flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProjectExpand(project.id);
                            }}
                          >
                            <span class="text-[10px] text-gray-600">
                              {isExpanded() ? '\u2212' : '+'}
                            </span>
                          </button>
                          
                          {/* Color Indicator */}
                          <div 
                            class="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ "background-color": getProjectColor(index()) }}
                          />
                          
                          {/* Project Info */}
                          <div class="flex-1 min-w-0">
                            <p class="text-[12px] font-bold text-gray-800 m-0 truncate" title={project.projectName}>
                              {project.projectName}
                            </p>
                            <p class="text-[10px] text-gray-500 m-0">
                              {project.projectCode}
                            </p>
                          </div>
                          
                          {/* Info Button */}
                          <button
                            class="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              props.onProjectDetailClick?.(project);
                            }}
                            title="View project details"
                          >
                            <span class="text-[11px]">{'\u2139'}</span>
                          </button>
                          
                          {/* Delete Button - show on hover */}
                          <button
                            class="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:scale-110 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete project ${project.projectName}?`)) {
                                props.onProjectDelete?.(project.id);
                              }
                            }}
                            title="Delete this project"
                          >
                            <span class="text-[12px] leading-none">{'\u00D7'}</span>
                          </button>
                        </div>
                        
                        {/* Expanded Content - Show KML and BOQ files */}
                        <Show when={isExpanded()}>
                          <div class="px-2.5 pb-2.5 pl-9 space-y-1.5">
                            {/* KML File */}
                            <div class="flex items-center gap-2 p-2 bg-white rounded-md border border-gray-200">
                              <div class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                              <div class="flex-1 min-w-0">
                                <p class="text-[11px] font-medium text-gray-700 m-0 truncate" title={project.kml.fileName}>
                                  KML: {project.kml.fileName}
                                </p>
                                <p class="text-[9px] text-gray-500 m-0">
                                  {project.statistics?.totalFeatures || 0} features, {((project.statistics?.totalDistance || 0) / 1000).toFixed(2)} km
                                </p>
                              </div>
                            </div>
                            
                            {/* BOQ File */}
                            <Show 
                              when={project.boq}
                              fallback={
                                <div class="flex items-center gap-2 p-2 bg-gray-100 rounded-md border border-gray-200 opacity-60">
                                  <div class="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" />
                                  <p class="text-[11px] text-gray-500 m-0">BOQ: Not available</p>
                                </div>
                              }
                            >
                              <div class="flex items-center gap-2 p-2 bg-white rounded-md border border-gray-200">
                                <div class="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                                <div class="flex-1 min-w-0">
                                  <p class="text-[11px] font-medium text-gray-700 m-0 truncate" title={project.boq!.fileName}>
                                    BOQ: {project.boq!.fileName}
                                  </p>
                                  <p class="text-[9px] text-gray-500 m-0">
                                    {project.boq!.data.items.length} items
                                  </p>
                                </div>
                              </div>
                            </Show>
                          </div>
                        </Show>
                      </div>
                    );
                  }}
                </For>
              </Show>
              
              {/* Show message if search has no results */}
              <Show when={searchQuery() && filteredProjects().length === 0}>
                <div class="text-center py-4 px-3">
                  <p class="text-[12px] text-gray-500 m-0">No projects match "{searchQuery()}"</p>
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
              <div class={`flex items-center justify-center ${
                isMinimized() ? 'w-[38px] h-[38px] rounded-[10px]' : 'w-[44px] h-[44px] rounded-[14px]'
              } flex-shrink-0 transition-all duration-300 ${
                activeMenu() === item.id 
                  ? 'bg-white/20' 
                  : 'bg-gray-100'
              }`}>
                <span class={`${isMinimized() ? 'text-[18px]' : 'text-[20px]'} transition-all duration-300 ${
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
            <p class="text-[10px] text-gray-400 m-0 font-medium">v2.0.0</p>
          </div>
        </div>
      </Show>
    </div>
  );
}
