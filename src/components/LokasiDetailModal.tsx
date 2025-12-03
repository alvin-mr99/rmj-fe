import { createSignal, For, Show } from 'solid-js';
import type { Lokasi, RuasKontrak } from '../types';
import BOQTree from '../components/BOQTree';

interface Props {
  lokasi: Lokasi | null | undefined;
  onClose: () => void;
}

export default function LokasiDetailModal(props: Props) {
  const [expandedRuas, setExpandedRuas] = createSignal<string | null>(null);

  if (!props.lokasi) return null as any;

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
          
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">No Ruas</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nama Ruas</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Panjang (KM)</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Volume (M)</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Progress Galian</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Progress HDPE</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nilai DRM</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nilai Rekon</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <For each={props.lokasi.ruasKontraks}>
                  {(r) => (
                    <>
                      <tr class="hover:bg-blue-50 transition-colors">
                        <td class="px-4 py-3 text-sm text-gray-900 font-medium">{r.noRuas}</td>
                        <td class="px-4 py-3 text-sm text-gray-900">{r.namaRuas}</td>
                        <td class="px-4 py-3 text-sm text-gray-900">{r.panjangKM}</td>
                        <td class="px-4 py-3 text-sm text-gray-900">{r.volumeMeter}</td>
                        <td class="px-4 py-3 text-sm">
                          <div class="flex items-center gap-2">
                            <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div class="bg-green-500 h-2 rounded-full" style={`width: ${r.progressGalian}%`}></div>
                            </div>
                            <span class="text-xs font-semibold text-gray-700">{r.progressGalian}%</span>
                          </div>
                        </td>
                        <td class="px-4 py-3 text-sm">
                          <div class="flex items-center gap-2">
                            <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div class="bg-blue-500 h-2 rounded-full" style={`width: ${r.progressHDPE}%`}></div>
                            </div>
                            <span class="text-xs font-semibold text-gray-700">{r.progressHDPE}%</span>
                          </div>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-900 font-medium">Rp {r.nilaiDRM.toLocaleString()}</td>
                        <td class="px-4 py-3 text-sm text-gray-900 font-medium">Rp {r.nilaiRekon.toLocaleString()}</td>
                        <td class="px-4 py-3 text-center">
                          <button 
                            class="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors shadow-sm font-medium"
                            onClick={() => setExpandedRuas(expandedRuas() === r.id ? null : r.id)}
                          >
                            {expandedRuas() === r.id ? '− Hide' : '+ View'} Tree
                          </button>
                        </td>
                      </tr>
                      <Show when={expandedRuas() === r.id}>
                        <tr>
                          <td colspan={9} class="px-4 py-4 bg-gray-50 border-t border-gray-200">
                            <BOQTree boqCustomers={r.boqCustomers} boqIndikatifs={r.boqIndikatifs} />
                          </td>
                        </tr>
                      </Show>
                    </>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
