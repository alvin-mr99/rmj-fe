import { createSignal,  Show } from 'solid-js';
import AgGridSolid from 'ag-grid-solid';
import type { ColDef, GridApi } from 'ag-grid-community';
import mockProjects from '../data/mockProjects';
import type { ProjectHierarchyProject } from '../types';
import ProjectDetail from '../components/ProjectDetail';
import * as XLSX from 'xlsx';

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

  const [ setGridApi] = createSignal<GridApi | null>(null);
  const [selectedProjectId, setSelectedProjectId] = createSignal<string | null>(null);

  const onGridReady = (params: any) => {
    setGridApi();
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

  // const handleExport = () => {
  //   const data = projects().map(p => ({
  //     id: p.id,
  //     noKontrak: p.noKontrak,
  //     namaKontrak: p.namaKontrak,
  //     treg: p.treg,
  //     tahunProject: p.tahunProject,
  //     program: p.program,
  //     regional: p.regional,
  //     planRFS: p.planRFS,
  //     currentMilestone: p.currentMilestone,
  //   }));
  //   const ws = XLSX.utils.json_to_sheet(data);
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Projects');
  //   XLSX.writeFile(wb, `RMJ_Projects_${new Date().toISOString().split('T')[0]}.xlsx`);
  // };

  const selectedProject = () => projects().find(p => p.id === selectedProjectId());

  return (
    <div class="w-full">

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
    </div>
  );
}
