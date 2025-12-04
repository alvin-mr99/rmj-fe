import { createSignal, For, Show } from 'solid-js';
import AgGridSolid from 'ag-grid-solid';
import type { ColDef } from 'ag-grid-community';
import type { Lokasi } from '../types';
import BOQTree from '../components/BOQTree';

interface Props {
  lokasi: Lokasi | null | undefined;
  onClose: () => void;
}

export default function LokasiDetailModal(props: Props) {
  const [expandedRuas, setExpandedRuas] = createSignal<string | null>(null);

  if (!props.lokasi) return null as any;

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
      cellRenderer: (params: any) => {
        const el = document.createElement('div');
        el.className = 'flex justify-center items-center h-full';
        const btn = document.createElement('button');
        btn.className = 'px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors shadow-sm font-medium whitespace-nowrap';
        btn.textContent = '+ View';
        btn.onclick = () => {
          const currentExpanded = expandedRuas();
          setExpandedRuas(currentExpanded === params.data.id ? null : params.data.id);
        };
        el.appendChild(btn);
        return el;
      }
    }
  ];

  return (
    <div class="fixed inset-0 bg-black/40 z-[2200] flex items-center justify-center p-4">
      <div class="bg-white rounded-xl w-[90vw] h-[85vh] flex flex-col overflow-hidden shadow-2xl">
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

        {/* Content */}
        <div class="flex-1 overflow-auto px-6 py-4">
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
        </div>
      </div>
    </div>
  );
}
