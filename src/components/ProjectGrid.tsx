import { createSignal, For, Show } from 'solid-js';
import AgGridSolid from 'ag-grid-solid';
import type { ColDef, GridApi } from 'ag-grid-community';
import mockProjects from '../data/mockProjects';
import type { ProjectHierarchyProject } from '../types';
import ProjectDetail from '../components/ProjectDetail';
import * as XLSX from 'xlsx';

export default function ProjectGrid() {
  const [projects] = createSignal<ProjectHierarchyProject[]>(mockProjects);
  const [columnDefs] = createSignal<ColDef[]>([
    { field: 'tahunProject', headerName: 'Tahun Project', width: 130 },
    { field: 'program', headerName: 'Program', width: 160 },
    { field: 'noKontrak', headerName: 'No Kontrak', width: 180 },
    { field: 'regional', headerName: 'Regional', width: 140 },
    { field: 'treg', headerName: 'TREG', width: 120 },
    { field: 'planRFS', headerName: 'Plan RFS', width: 130 },
    { field: 'currentMilestone', headerName: 'Current Milestone', width: 160 },
    {
      field: 'action',
      headerName: 'Action',
      pinned: 'right',
      width: 140,
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

  const onGridReady = (params: any) => {
    setGridApi(params.api);
  };

  // Listen for the custom event from cell renderer
  window.addEventListener('project-view-detail', (e: any) => {
    setSelectedProjectId(e.detail);
  });

  const handleExport = () => {
    const data = projects().map(p => ({
      id: p.id,
      noKontrak: p.noKontrak,
      namaKontrak: p.namaKontrak,
      treg: p.treg,
      tahunProject: p.tahunProject,
      program: p.program,
      regional: p.regional,
      planRFS: p.planRFS,
      currentMilestone: p.currentMilestone,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Projects');
    XLSX.writeFile(wb, `RMJ_Projects_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const selectedProject = () => projects().find(p => p.id === selectedProjectId());

  return (
    <div class="w-full">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-bold">Projects</h3>
        <div class="flex gap-2">
          <button class="px-3 py-1 bg-white border rounded" onClick={handleExport}>Export Excel</button>
        </div>
      </div>

      <div class="ag-theme-alpine h-64 w-full">
        <AgGridSolid
          columnDefs={columnDefs()}
          rowData={projects()}
          onGridReady={onGridReady}
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
          pagination={true}
          paginationPageSize={10}
        />
      </div>

      <Show when={selectedProjectId()}>
        <div class="mt-4">
          <ProjectDetail project={selectedProject()!} onClose={() => setSelectedProjectId(null)} />
        </div>
      </Show>
    </div>
  );
}
