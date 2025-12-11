import { createSignal, For, Show } from 'solid-js';
import AgGridSolid from 'ag-grid-solid';
import type { ColDef, GridApi } from 'ag-grid-community';
import type { Lokasi, BoQItem } from '../types';
import BOQTree from '../components/BOQTree';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface Props {
  lokasi: Lokasi | null | undefined;
  onClose: () => void;
  onRuasGridReady?: (api: GridApi) => void;
}

export default function LokasiDetailModal(props: Props) {
  const [expandedRuas, setExpandedRuas] = createSignal<string | null>(null);
  const [activeTab, setActiveTab] = createSignal<'ruas' | 'boq'>('ruas');

  console.log('LokasiDetailModal props:', { lokasi: props.lokasi });

  if (!props.lokasi) {
    console.log('LokasiDetailModal: lokasi is null, not rendering');
    return null;
  }

  // Grid API ready handler
  const onRuasGridReady = (params: any) => {
    if (props.onRuasGridReady) {
      props.onRuasGridReady(params.api);
    }
  };

  // Column definitions untuk ruas kontrak table
  const ruasColumnDefs: ColDef[] = [
    { field: 'noRuas', headerName: 'No Ruas', width: 100, filter: true },
    { field: 'namaRuas', headerName: 'Nama Ruas', width: 200, filter: true },
    { field: 'panjangKM', headerName: 'Panjang (KM)', width: 120 },
    { field: 'volumeMeter', headerName: 'Volume (M)', width: 120 },
    { 
      field: 'progressGalian', 
      headerName: 'Progress Galian', 
      width: 160,
      cellRenderer: (params: any) => {
        const progress = params.value || 0;
        const el = document.createElement('div');
        el.className = 'flex items-center gap-2 w-full px-2';
        el.innerHTML = `
          <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div class="bg-green-500 h-2 rounded-full" style="width: ${progress}%"></div>
          </div>
          <span class="text-xs font-semibold text-gray-700 whitespace-nowrap">${progress}%</span>
        `;
        return el;
      }
    },
    { 
      field: 'progressHDPE', 
      headerName: 'Progress HDPE', 
      width: 160,
      cellRenderer: (params: any) => {
        const progress = params.value || 0;
        const el = document.createElement('div');
        el.className = 'flex items-center gap-2 w-full px-2';
        el.innerHTML = `
          <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div class="bg-blue-500 h-2 rounded-full" style="width: ${progress}%"></div>
          </div>
          <span class="text-xs font-semibold text-gray-700 whitespace-nowrap">${progress}%</span>
        `;
        return el;
      }
    },
    { 
      field: 'nilaiDRM', 
      headerName: 'Nilai DRM', 
      width: 140,
      valueFormatter: (params: any) => `Rp ${params.value?.toLocaleString() || 0}`
    },
    { 
      field: 'nilaiRekon', 
      headerName: 'Nilai Rekon', 
      width: 140,
      valueFormatter: (params: any) => `Rp ${params.value?.toLocaleString() || 0}`
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 110,
      pinned: 'right',
      filter: false,
      sortable: false,
      editable: false,
      cellRenderer: (params: any) => {
        const el = document.createElement('div');
        el.style.cssText = 'display: flex; justify-content: center; align-items: center; height: 100%;';
        
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.style.cssText = `
          padding: 4px 10px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
          white-space: nowrap;
          pointer-events: auto;
        `;
        btn.textContent = '+ View';
        
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('+ View clicked, ruas id:', params.data.id);
          const currentExpanded = expandedRuas();
          setExpandedRuas(currentExpanded === params.data.id ? null : params.data.id);
        });
        
        btn.addEventListener('mouseenter', () => {
          btn.style.transform = 'translateY(-1px)';
          btn.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
        });
        
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'translateY(0)';
          btn.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
        });
        
        el.appendChild(btn);
        return el;
      }
    }
  ];

  // Sample BoQ Data for Lokasi
  const sampleBoQData: BoQItem[] = [
    {
      no: 1,
      description: 'Galian Tanah Manual',
      unit: 'M3',
      quantity: 75.5,
      unitPrice: 85000,
      totalPrice: 6417500,
      category: 'Pekerjaan Tanah',
      notes: 'Termasuk pembersihan lahan'
    },
    {
      no: 2,
      description: 'Pemasangan Kabel FO',
      unit: 'Km',
      quantity: 1.2,
      unitPrice: 15000000,
      totalPrice: 18000000,
      category: 'Pekerjaan Kabel',
      notes: 'Kabel fiber optic 48 core'
    },
    {
      no: 3,
      description: 'Pemasangan HDPE Pipe',
      unit: 'M',
      quantity: 1200,
      unitPrice: 45000,
      totalPrice: 54000000,
      category: 'Pekerjaan Pipa',
      notes: 'HDPE diameter 50mm'
    },
    {
      no: 4,
      description: 'Handhole Beton',
      unit: 'Unit',
      quantity: 12,
      unitPrice: 1500000,
      totalPrice: 18000000,
      category: 'Pekerjaan Sipil',
      notes: 'Ukuran 60x60x80 cm'
    },
    {
      no: 5,
      description: 'Jointing & Terminasi',
      unit: 'Titik',
      quantity: 6,
      unitPrice: 2500000,
      totalPrice: 15000000,
      category: 'Pekerjaan Kabel',
      notes: 'Termasuk testing'
    },
  ];

  // BoQ Column Definitions
  const boqColumnDefs: ColDef[] = [
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

  console.log('LokasiDetailModal rendering with lokasi:', props.lokasi);

  return (
    <div 
      class="fixed inset-0 bg-black/40 z-[2200] flex items-center justify-center p-4"
      onClick={(e) => {
        console.log('Backdrop clicked');
        if (e.target === e.currentTarget) {
          props.onClose();
        }
      }}
    >
      <div 
        class="bg-white rounded-xl w-[90vw] h-[85vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div>
            <h4 class="text-xl font-bold text-gray-800">Lokasi: {props.lokasi.kode} — {props.lokasi.siteName}</h4>
            <div class="text-sm text-gray-600 mt-1">
              <span class="inline-flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Mitra: <strong>{props.lokasi.mitra}</strong>
              </span>
              <span class="mx-2">•</span>
              <span class="inline-flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Witel: <strong>{props.lokasi.witel}</strong>
              </span>
            </div>
          </div>
          <button 
            class="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg transition-colors shadow-sm border border-gray-200 font-medium"
            onClick={props.onClose}
          >
            Close
          </button>
        </div>

        {/* Tabs */}
        <div class="px-6 pt-3 flex-shrink-0">
          <div class="flex gap-2 border-b border-gray-200">
            <button 
              class={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-all ${
                activeTab() === 'ruas' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`} 
              onClick={() => setActiveTab('ruas')}
            >
              📋 Ruas Kontrak
            </button>
            <button 
              class={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-all ${
                activeTab() === 'boq' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`} 
              onClick={() => setActiveTab('boq')}
            >
              💰 Bill of Quantities
            </button>
          </div>
        </div>

        {/* Content */}
        <div class="flex-1 overflow-auto px-6 py-4">
          <Show when={activeTab() === 'ruas'}>
            <div class="mb-3 flex items-center justify-between">
              <h5 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Tabel Ruas Kontrak
              </h5>
              <span class="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                {props.lokasi.ruasKontraks.length} Ruas
              </span>
            </div>
            
            <div class="ag-theme-alpine" style="width: 100%;">
              <AgGridSolid
                columnDefs={ruasColumnDefs}
                rowData={props.lokasi.ruasKontraks}
                defaultColDef={{
                  sortable: true,
                  resizable: true,
                }}
                domLayout="autoHeight"
                onGridReady={onRuasGridReady}
              />
            </div>

            {/* Show BOQ Tree when ruas is expanded */}
            <Show when={expandedRuas()}>
              <For each={props.lokasi.ruasKontraks}>
                {(r) => (
                  <Show when={expandedRuas() === r.id}>
                    <div class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <BOQTree boqCustomers={r.boqCustomers} boqIndikatifs={r.boqIndikatifs} />
                    </div>
                  </Show>
                )}
              </For>
            </Show>
          </Show>

          <Show when={activeTab() === 'boq'}>
            <div>
              {/* Summary Cards */}
              <div class="grid grid-cols-4 gap-4 mb-4">
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div class="text-xs text-blue-600 font-semibold mb-1">Total Items</div>
                  <div class="text-2xl font-bold text-gray-800">{boqSummary.totalItems}</div>
                </div>
                <div class="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div class="text-xs text-green-600 font-semibold mb-1">Total Cost</div>
                  <div class="text-lg font-bold text-gray-800">
                    Rp {boqSummary.totalCost.toLocaleString('id-ID')}
                  </div>
                </div>
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div class="text-xs text-purple-600 font-semibold mb-1">Material Cost</div>
                  <div class="text-lg font-bold text-gray-800">
                    Rp {boqSummary.materialCost.toLocaleString('id-ID')}
                  </div>
                </div>
                <div class="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <div class="text-xs text-orange-600 font-semibold mb-1">Labor Cost</div>
                  <div class="text-lg font-bold text-gray-800">
                    Rp {boqSummary.laborCost.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* BoQ Grid */}
              <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div class="ag-theme-alpine h-[450px] w-full">
                  <AgGridSolid
                    columnDefs={boqColumnDefs}
                    rowData={sampleBoQData}
                    defaultColDef={{
                      sortable: true,
                      resizable: true,
                    }}
                    pagination={true}
                    paginationPageSize={20}
                    paginationPageSizeSelector={[10, 20, 50]}
                    rowHeight={48}
                    headerHeight={56}
                  />
                </div>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
