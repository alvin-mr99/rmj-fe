import { createSignal,  Show } from 'solid-js';
import AgGridSolid from 'ag-grid-solid';
import type { ColDef, GridApi } from 'ag-grid-community';
import mockProjects from '../data/mockProjects';
import type { ProjectHierarchyProject } from '../types';
import ProjectDetail from '../components/ProjectDetail';
import { ColumnTemplateManager } from './ColumnTemplateManager';

export default function ProjectGrid() {
  const [projects] = createSignal<ProjectHierarchyProject[]>(mockProjects);
  const [columnDefs] = createSignal<ColDef[]>([
    { field: 'tahunProject', headerName: 'Tahun Proj...', width: 110 },
    { field: 'program', headerName: 'Program', width: 150 },
    { field: 'noKontrak', headerName: 'No Kontrak', width: 140 },
    { field: 'regional', headerName: 'Regional', width: 130 },
    { field: 'treg', headerName: 'TREG', width: 90 },
    { field: 'planRFS', headerName: 'Plan RFS', width: 120 },
    { field: 'currentMilestone', headerName: 'Current Milestone', flex: 1, minWidth: 150 },
    {
      field: 'action',
      headerName: 'Action',
      pinned: 'right',
      width: 120,
      editable: false,
      filter: false,
      floatingFilter: false,
      cellRenderer: (params: any) => {
        const el = document.createElement('div');
        el.style.display = 'flex';
        el.style.justifyContent = 'center';
        el.style.alignItems = 'center';
        const btn = document.createElement('button');
        btn.textContent = 'View Detail';
        btn.className = 'action-btn-edit';
        btn.onclick = () => {
          // custom event
          const ev = new CustomEvent('project-view-detail', { detail: params.data.id });
          window.dispatchEvent(ev);
        };
        el.appendChild(btn);
        return el;
      },
    },
  ]);

  const [gridApi, setGridApi] = createSignal<GridApi | null>(null);
  const [selectedProjectId, setSelectedProjectId] = createSignal<string | null>(null);
  const [showColumnSettings, setShowColumnSettings] = createSignal(false);

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    
    // make columns fit available width so header has no empty right space
    try {
      params.api.sizeColumnsToFit();
    } catch (e) {
      // ignore if not yet available
    }

    // resize handler to keep columns fitted on window resize
    const onResize = () => {
      try {
        params.api.sizeColumnsToFit();
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('resize', onResize);
  };

  // Listen for the custom event from cell renderer
  window.addEventListener('project-view-detail', (e: any) => {
    setSelectedProjectId(e.detail);
  });

  const selectedProject = () => projects().find(p => p.id === selectedProjectId());

  return (
    <div class="w-full">
      {/* Column Settings Button */}
      <div class="mb-3 flex justify-end">
        <button
          onClick={() => setShowColumnSettings(true)}
          class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium text-sm shadow-sm flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Column Settings
        </button>
      </div>

      <div class="ag-theme-alpine h-64 w-full">
        <AgGridSolid
          columnDefs={columnDefs()}
          rowData={projects()}
          onGridReady={onGridReady}
          defaultColDef={{ sortable: true, filter: true, floatingFilter: true, resizable: true, editable: true }}
          stopEditingWhenCellsLoseFocus={true}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50, 100]}
        />
      </div>

      <Show when={selectedProjectId()}>
        <div class="mt-4">
          <ProjectDetail project={selectedProject()!} onClose={() => setSelectedProjectId(null)} />
        </div>
      </Show>

      {/* Column Settings Modal */}
      <Show when={showColumnSettings()}>
        <div class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div class="bg-white rounded-xl w-[90vw] max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <ColumnTemplateManager
              gridApi={gridApi()}
              tableType="project"
              tableLabel="Tabel Project"
              onClose={() => setShowColumnSettings(false)}
            />
          </div>
        </div>
      </Show>
    </div>
  );
}
