import { createSignal, Show, For } from 'solid-js';
import './Sidebar.css';

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
    { id: 'dashboard', icon: '📊', label: 'Dashboard', onClick: props.onDashboardClick },
    { id: 'upload', icon: '📁', label: 'Upload File', onClick: props.onUploadClick },
    { id: 'analytics', icon: '📈', label: 'Analytics', onClick: props.onAnalyticsClick },
    { id: 'filtering', icon: '🔍', label: 'Filtering', onClick: props.onFilteringClick },
    { id: 'topology', icon: '⚙️', label: 'Topology Settings', onClick: props.onTopologyClick },
  ];

  const handleMenuClick = (id: string, onClick?: () => void) => {
    setActiveMenu(id);
    onClick?.();
  };

  return (
    <div class={`sidebar ${isMinimized() ? 'minimized' : ''}`}>
      <div class="sidebar-header">
        <Show when={!isMinimized()}>
          <div class="sidebar-logo">
            <div class="logo-icon">🗺️</div>
            <h2 class="logo-text">Cable Map</h2>
          </div>
        </Show>
        <button 
          class="sidebar-toggle"
          onClick={() => setIsMinimized(!isMinimized())}
          title={isMinimized() ? 'Expand sidebar' : 'Minimize sidebar'}
        >
          {isMinimized() ? '→' : '←'}
        </button>
      </div>

      <nav class="sidebar-nav">
        <For each={menuItems}>
          {(item) => (
            <button
              class={`sidebar-menu-item ${activeMenu() === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.id, item.onClick)}
              title={isMinimized() ? item.label : ''}
            >
              <span class="menu-icon">{item.icon}</span>
              <Show when={!isMinimized()}>
                <span class="menu-label">{item.label}</span>
              </Show>
            </button>
          )}
        </For>
      </nav>

      <Show when={!isMinimized()}>
        <div class="sidebar-footer">
          <div class="footer-info">
            <p class="footer-text">Underground Cable Management System</p>
            <p class="footer-version">v1.0.0</p>
          </div>
        </div>
      </Show>
    </div>
  );
}
