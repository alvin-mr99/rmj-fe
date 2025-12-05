import { createSignal,  Show, onMount, onCleanup } from 'solid-js';
import AgGridSolid from 'ag-grid-solid';
import type { ColDef, GridApi } from 'ag-grid-community';
import mockProjects from '../data/mockProjects';
import type { ProjectHierarchyProject, BoQItem } from '../types';
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
      width: 200,
      editable: false,
      filter: false,
      floatingFilter: false,
      cellRenderer: (params: any) => {
        const el = document.createElement('div');
        el.style.display = 'flex';
        el.style.justifyContent = 'center';
        el.style.alignItems = 'center';
        el.style.gap = '8px';
        
        // View Detail Button
        const viewBtn = document.createElement('button');
        viewBtn.textContent = 'View Detail';
        viewBtn.className = 'action-btn-edit';
        viewBtn.onclick = () => {
          const ev = new CustomEvent('project-view-detail', { detail: params.data.id });
          window.dispatchEvent(ev);
        };
        
        // BoQ Button
        const boqBtn = document.createElement('button');
        boqBtn.textContent = '📋 BoQ';
        boqBtn.className = 'action-btn-boq';
        boqBtn.style.cssText = `
          padding: 6px 14px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
        `;
        boqBtn.onclick = () => {
          const ev = new CustomEvent('project-view-boq', { detail: params.data.id });
          window.dispatchEvent(ev);
        };
        boqBtn.onmouseenter = () => {
          boqBtn.style.transform = 'translateY(-1px)';
          boqBtn.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)';
        };
        boqBtn.onmouseleave = () => {
          boqBtn.style.transform = 'translateY(0)';
          boqBtn.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)';
        };
        
        el.appendChild(viewBtn);
        el.appendChild(boqBtn);
        return el;
      },
    },
  ]);

  const [gridApi, setGridApi] = createSignal<GridApi | null>(null);
  const [selectedProjectId, setSelectedProjectId] = createSignal<string | null>(null);
  const [selectedBoQProjectId, setSelectedBoQProjectId] = createSignal<string | null>(null);
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
  const handleViewDetail = (e: any) => {
    setSelectedProjectId(e.detail);
    // Force grid to redraw rows to apply the new styling
    const api = gridApi();
    if (api) {
      api.redrawRows();
    }
  };

  // Listen for BoQ event
  const handleViewBoQ = (e: any) => {
    setSelectedBoQProjectId(e.detail);
  };

  // Listen for column settings event from RMJModal
  const handleOpenColumnSettings = () => {
    setShowColumnSettings(true);
  };

  onMount(() => {
    window.addEventListener('project-view-detail', handleViewDetail);
    window.addEventListener('project-view-boq', handleViewBoQ);
    window.addEventListener('open-column-settings', handleOpenColumnSettings);
  });

  onCleanup(() => {
    window.removeEventListener('project-view-detail', handleViewDetail);
    window.removeEventListener('project-view-boq', handleViewBoQ);
    window.removeEventListener('open-column-settings', handleOpenColumnSettings);
  });

  const selectedProject = () => projects().find(p => p.id === selectedProjectId());

  // Sample BoQ Data
  const sampleBoQData: BoQItem[] = [
    {
      no: 1,
      description: 'Galian Tanah Manual',
      unit: 'M3',
      quantity: 150.5,
      unitPrice: 85000,
      totalPrice: 12792500,
      category: 'Pekerjaan Tanah',
      notes: 'Termasuk pembersihan lahan'
    },
    {
      no: 2,
      description: 'Pemasangan Kabel FO',
      unit: 'Km',
      quantity: 2.5,
      unitPrice: 15000000,
      totalPrice: 37500000,
      category: 'Pekerjaan Kabel',
      notes: 'Kabel fiber optic 48 core'
    },
    {
      no: 3,
      description: 'Pemasangan HDPE Pipe',
      unit: 'M',
      quantity: 2500,
      unitPrice: 45000,
      totalPrice: 112500000,
      category: 'Pekerjaan Pipa',
      notes: 'HDPE diameter 50mm'
    },
    {
      no: 4,
      description: 'Handhole Beton',
      unit: 'Unit',
      quantity: 25,
      unitPrice: 1500000,
      totalPrice: 37500000,
      category: 'Pekerjaan Sipil',
      notes: 'Ukuran 60x60x80 cm'
    },
    {
      no: 5,
      description: 'Jointing & Terminasi',
      unit: 'Titik',
      quantity: 12,
      unitPrice: 2500000,
      totalPrice: 30000000,
      category: 'Pekerjaan Kabel',
      notes: 'Termasuk testing'
    },
    {
      no: 6,
      description: 'Pengaspalan',
      unit: 'M2',
      quantity: 120,
      unitPrice: 350000,
      totalPrice: 42000000,
      category: 'Pekerjaan Finishing',
      notes: 'Hotmix tebal 5cm'
    },
    {
      no: 7,
      description: 'Manhole',
      unit: 'Unit',
      quantity: 8,
      unitPrice: 3500000,
      totalPrice: 28000000,
      category: 'Pekerjaan Sipil',
      notes: 'Ukuran 120x120x150 cm'
    },
    {
      no: 8,
      description: 'Boring Horizontal',
      unit: 'M',
      quantity: 80,
      unitPrice: 450000,
      totalPrice: 36000000,
      category: 'Pekerjaan Tanah',
      notes: 'Untuk crossing jalan'
    },
    {
      no: 9,
      description: 'ODP (Optical Distribution Point)',
      unit: 'Unit',
      quantity: 15,
      unitPrice: 2800000,
      totalPrice: 42000000,
      category: 'Pekerjaan Perangkat',
      notes: 'Kapasitas 16 core'
    },
    {
      no: 10,
      description: 'Testing & Commissioning',
      unit: 'LS',
      quantity: 1,
      unitPrice: 25000000,
      totalPrice: 25000000,
      category: 'Pekerjaan Testing',
      notes: 'OTDR dan power meter'
    },
  ];

  const boqSummary = {
    totalItems: sampleBoQData.length,
    totalCost: sampleBoQData.reduce((sum, item) => sum + item.totalPrice, 0),
    materialCost: sampleBoQData.filter(item => 
      item.category?.includes('Kabel') || item.category?.includes('Perangkat') || item.category?.includes('Pipa')
    ).reduce((sum, item) => sum + item.totalPrice, 0),
    laborCost: sampleBoQData.filter(item => 
      item.category?.includes('Tanah') || item.category?.includes('Sipil') || item.category?.includes('Testing')
    ).reduce((sum, item) => sum + item.totalPrice, 0),
  };

  return (
    <div class="w-full">
      <div class="ag-theme-alpine h-96 w-full">
        <AgGridSolid
          columnDefs={columnDefs()}
          rowData={projects()}
          onGridReady={onGridReady}
          defaultColDef={{ sortable: true, filter: true, floatingFilter: true, resizable: true, editable: true }}
          stopEditingWhenCellsLoseFocus={true}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          rowClassRules={{
            'ag-row-selected-custom': (params: any) => params.data.id === selectedProjectId()
          }}
        />
      </div>

      <Show when={selectedProjectId()}>
        <div class="mt-4">
          <ProjectDetail 
            project={selectedProject()!} 
            onClose={() => {
              setSelectedProjectId(null);
              // Force grid to redraw rows to remove styling
              const api = gridApi();
              if (api) {
                api.redrawRows();
              }
            }} 
          />
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

      {/* BoQ Modal */}
      <Show when={selectedBoQProjectId()}>
        <div 
          class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={() => setSelectedBoQProjectId(null)}
        >
          <div 
            class="bg-white rounded-2xl w-[95vw] h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ "font-family": "'Poppins', sans-serif" }}
          >
            {/* Header */}
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-100">
              <div>
                <h2 class="text-2xl font-bold text-gray-800 m-0">📋 Bill of Quantities (BoQ)</h2>
                <p class="text-sm text-gray-600 m-0 mt-1">Project: {selectedProject()?.noKontrak || 'N/A'}</p>
              </div>
              <button
                class="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-colors shadow-sm border border-gray-200"
                onClick={() => setSelectedBoQProjectId(null)}
              >
                <span class="text-2xl text-gray-600">×</span>
              </button>
            </div>

            {/* Summary Cards */}
            <div class="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div class="grid grid-cols-4 gap-4">
                <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div class="text-xs text-gray-500 font-medium">Total Items</div>
                  <div class="text-2xl font-bold text-gray-800 mt-1">{boqSummary.totalItems}</div>
                </div>
                <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div class="text-xs text-gray-500 font-medium">Total Cost</div>
                  <div class="text-2xl font-bold text-blue-600 mt-1">
                    Rp {(boqSummary.totalCost / 1000000).toFixed(2)}M
                  </div>
                </div>
                <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div class="text-xs text-gray-500 font-medium">Material Cost</div>
                  <div class="text-2xl font-bold text-green-600 mt-1">
                    Rp {(boqSummary.materialCost / 1000000).toFixed(2)}M
                  </div>
                </div>
                <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div class="text-xs text-gray-500 font-medium">Labor Cost</div>
                  <div class="text-2xl font-bold text-orange-600 mt-1">
                    Rp {(boqSummary.laborCost / 1000000).toFixed(2)}M
                  </div>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div class="px-6 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
              <div class="text-sm text-gray-600">
                Showing <span class="font-semibold text-gray-800">{sampleBoQData.length}</span> items
              </div>
              <button
                class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium text-sm shadow-sm flex items-center gap-2"
                onClick={() => {
                  // Export functionality can be added here
                  alert('Export BoQ to Excel');
                }}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Export to Excel
              </button>
            </div>

            {/* AG Grid */}
            <div class="flex-1 px-6 py-4 overflow-hidden">
              <div class="ag-theme-alpine h-full w-full">
                <AgGridSolid
                  columnDefs={[
                    { 
                      field: 'no', 
                      headerName: 'No', 
                      width: 70, 
                      pinned: 'left',
                      filter: 'agNumberColumnFilter'
                    },
                    { 
                      field: 'description', 
                      headerName: 'Description', 
                      width: 300,
                      filter: 'agTextColumnFilter'
                    },
                    { 
                      field: 'category', 
                      headerName: 'Category', 
                      width: 180,
                      filter: 'agTextColumnFilter'
                    },
                    { 
                      field: 'unit', 
                      headerName: 'Unit', 
                      width: 100,
                      filter: 'agTextColumnFilter'
                    },
                    { 
                      field: 'quantity', 
                      headerName: 'Quantity', 
                      width: 120,
                      filter: 'agNumberColumnFilter',
                      valueFormatter: (params: any) => params.value?.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    },
                    { 
                      field: 'unitPrice', 
                      headerName: 'Unit Price (Rp)', 
                      width: 150,
                      filter: 'agNumberColumnFilter',
                      valueFormatter: (params: any) => 'Rp ' + params.value?.toLocaleString('id-ID')
                    },
                    { 
                      field: 'totalPrice', 
                      headerName: 'Total Price (Rp)', 
                      width: 180,
                      pinned: 'right',
                      filter: 'agNumberColumnFilter',
                      valueFormatter: (params: any) => 'Rp ' + params.value?.toLocaleString('id-ID'),
                      cellStyle: { fontWeight: 'bold', color: '#2563eb' }
                    },
                    { 
                      field: 'notes', 
                      headerName: 'Notes', 
                      width: 250,
                      filter: 'agTextColumnFilter'
                    },
                  ]}
                  rowData={sampleBoQData}
                  defaultColDef={{
                    sortable: true,
                    filter: true,
                    resizable: true,
                    floatingFilter: true,
                  }}
                  pagination={true}
                  paginationPageSize={20}
                  paginationPageSizeSelector={[10, 20, 50, 100]}
                  enableCellTextSelection={true}
                  suppressRowClickSelection={true}
                  enableRangeSelection={true}
                  rowHeight={45}
                  headerHeight={56}
                />
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
