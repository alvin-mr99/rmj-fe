import { createSignal, Show } from 'solid-js';
import AgGridSolid from 'ag-grid-solid';
import type { GridApi } from 'ag-grid-community';
import type { RMJReportRow } from '../types';
import * as XLSX from 'xlsx';

interface ReportRMJModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: RMJReportRow[];
}

export function ReportRMJModal(props: ReportRMJModalProps) {
  const [reportGridApi, setReportGridApi] = createSignal<GridApi | null>(null);

  return (
    <Show when={props.isOpen}>
      <div
        class="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-4"
        onClick={props.onClose}
      >
        <div
          class="bg-white rounded-2xl shadow-2xl w-[98vw] h-[95vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{ "font-family": "'Poppins', sans-serif" }}
        >
          {/* Header */}
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
            <div>
              <h2 class="text-2xl font-bold text-gray-800 m-0">📊 PROGRES REVENUE OSP DKI TELKOMINFRA 2025</h2>
              <p class="text-sm text-gray-600 m-0 mt-1">Report RMJ - Progress Monitoring Dashboard</p>
            </div>
            <button
              class="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-colors shadow-sm border border-gray-200"
              onClick={props.onClose}
            >
              <span class="text-2xl text-gray-600">×</span>
            </button>
          </div>

          {/* Toolbar */}
          <div class="px-6 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button
                class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium text-sm shadow-sm flex items-center gap-2"
                onClick={() => {
                  const ws = XLSX.utils.json_to_sheet(props.reportData);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, 'RMJ Report');
                  XLSX.writeFile(wb, `RMJ_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
                }}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Export to Excel
              </button>
              <button
                class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium text-sm shadow-sm flex items-center gap-2"
                onClick={() => {
                  const api = reportGridApi();
                  if (api) {
                    api.openToolPanel('filters');
                  }
                }}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Open Filters
              </button>
            </div>
            <div class="text-sm text-gray-600">
              Total Records: <span class="font-semibold text-gray-800">{props.reportData.length}</span>
            </div>
          </div>

          {/* AG Grid */}
          <div class="flex-1 px-6 py-4 overflow-hidden">
            <div class="ag-theme-alpine report-rmj-grid h-full w-full">
              <AgGridSolid
                columnDefs={[
                  { field: 'no', headerName: 'NO', width: 70, pinned: 'left', filter: 'agNumberColumnFilter' },
                  { field: 'area', headerName: 'AREA', width: 90, pinned: 'left', filter: 'agTextColumnFilter' },
                  { field: 'ktrl', headerName: 'KTRL', width: 90, filter: 'agTextColumnFilter' },
                  { field: 'mitraPelaksana', headerName: 'MITRA PELAKSANA', width: 150, filter: 'agTextColumnFilter' },
                  { field: 'linkRuas', headerName: 'LINK/RUAS', width: 300, filter: 'agTextColumnFilter' },
                  { field: 'volumePhm', headerName: 'VOLUME (PHM)', width: 130, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => params.value?.toLocaleString() },
                  
                  // Progres Galian/Boring Manual (BO/DG) & Roding
                  { 
                    headerName: 'PROGRES GALIAN/BORING MANUAL (BO/DG) & RODING', 
                    children: [
                      { field: 'progresGalianBoringManual.plan', headerName: 'PLAN', width: 110, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => params.value?.toLocaleString() },
                      { field: 'progresGalianBoringManual.actual', headerName: 'ACTUAL', width: 110, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => params.value?.toLocaleString() },
                      { field: 'progresGalianBoringManual.sisa', headerName: 'SISA', width: 110, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => params.value?.toLocaleString() },
                      { field: 'progresGalianBoringManual.percentage', headerName: '%', width: 80, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => `${params.value}%` },
                    ]
                  },

                  // Penanaman HDPE
                  { 
                    headerName: 'PENANAMAN HDPE', 
                    children: [
                      { field: 'penambahanHdpe.plan', headerName: 'PLAN', width: 110, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => params.value?.toLocaleString() },
                      { field: 'penambahanHdpe.actual', headerName: 'ACTUAL', width: 110, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => params.value?.toLocaleString() },
                      { field: 'penambahanHdpe.sisa', headerName: 'SISA', width: 110, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => params.value?.toLocaleString() },
                      { field: 'penambahanHdpe.percentage', headerName: '%', width: 80, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => `${params.value}%` },
                    ]
                  },

                  // Penambahan Tiang
                  { 
                    headerName: 'PENAMBAHAN TIANG', 
                    children: [
                      { field: 'penambahanTiang.plan', headerName: 'PLAN', width: 110, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => params.value?.toLocaleString() },
                      { field: 'penambahanTiang.actual', headerName: 'ACTUAL (SBT)', width: 130, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => params.value?.toLocaleString() },
                      { field: 'penambahanTiang.sisa', headerName: 'SISA', width: 110, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => params.value?.toLocaleString() },
                      { field: 'penambahanTiang.percentage', headerName: '%', width: 80, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => `${params.value}%` },
                    ]
                  },

                  // Konstruksi Alur Jembatan
                  { 
                    headerName: 'KONSTRUKSI ALUR JEMBATAN', 
                    children: [
                      { field: 'konstruksiAlurJembatan.plan', headerName: 'PLAN', width: 110, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => params.value?.toLocaleString() },
                      { field: 'konstruksiAlurJembatan.actual', headerName: 'ACTUAL (SBT)', width: 130, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => params.value?.toLocaleString() },
                      { field: 'konstruksiAlurJembatan.sisa', headerName: 'SISA', width: 110, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => params.value?.toLocaleString() },
                      { field: 'konstruksiAlurJembatan.percentage', headerName: '%', width: 80, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => `${params.value}%` },
                    ]
                  },

                  // Handhole
                  { 
                    headerName: 'HANDHOLE', 
                    children: [
                      { field: 'handhole.plan', headerName: 'PLAN (UNIT)', width: 120, filter: 'agTextColumnFilter' },
                      { field: 'handhole.actual', headerName: 'ACTUAL (SBT)', width: 130, filter: 'agTextColumnFilter' },
                      { field: 'handhole.sisa', headerName: 'SISA', width: 110, filter: 'agTextColumnFilter' },
                      { field: 'handhole.percentage', headerName: '%', width: 80, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => `${params.value}%` },
                    ]
                  },

                  // Jointing & Terminasi
                  { 
                    headerName: 'JOINTING & TERMINASI', 
                    children: [
                      { field: 'jointingTerminasi.plan', headerName: 'PLAN (UNIT)', width: 120, filter: 'agTextColumnFilter' },
                      { field: 'jointingTerminasi.actual', headerName: 'ACTUAL (SBT)', width: 130, filter: 'agTextColumnFilter' },
                      { field: 'jointingTerminasi.sisa', headerName: 'SISA', width: 110, filter: 'agTextColumnFilter' },
                      { field: 'jointingTerminasi.percentage', headerName: '%', width: 80, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => `${params.value}%` },
                    ]
                  },

                  { field: 'nocApft', headerName: 'NOC APFT', width: 110, filter: 'agTextColumnFilter' },
                  { field: 'persentaseRealisasiKonstruksi', headerName: 'PERSENTASE REALISASI KONSTRUKSI (%)', width: 180, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => `${params.value}%` },
                  { field: 'planTargetTi', headerName: 'PLAN TARGET TI', width: 140, filter: 'agTextColumnFilter' },
                  { field: 'nilaiOdm', headerName: 'NILAI ODM', width: 120, filter: 'agTextColumnFilter' },
                  { field: 'volumeRekon', headerName: 'VOLUME REKON', width: 130, filter: 'agNumberColumnFilter', valueFormatter: (params: any) => params.value?.toLocaleString() },
                  { field: 'nilaiRekon', headerName: 'NILAI REKON', width: 120, filter: 'agTextColumnFilter' },
                  { field: 'deviasi', headerName: 'DEVIASI', width: 110, pinned: 'right', filter: 'agNumberColumnFilter', valueFormatter: (params: any) => params.value?.toLocaleString() },
                ]}
                rowData={props.reportData}
                onGridReady={(params: any) => setReportGridApi(params.api)}
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
                sideBar={{
                  toolPanels: [
                    {
                      id: 'filters',
                      labelDefault: 'Filters',
                      labelKey: 'filters',
                      iconKey: 'filter',
                      toolPanel: 'agFiltersToolPanel',
                    },
                    {
                      id: 'columns',
                      labelDefault: 'Columns',
                      labelKey: 'columns',
                      iconKey: 'columns',
                      toolPanel: 'agColumnsToolPanel',
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
