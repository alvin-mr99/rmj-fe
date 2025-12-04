import { createSignal, For, Show } from 'solid-js';
import type { BOQItem } from '../types';

interface Props {
  boqCustomers: BOQItem[];
  boqIndikatifs: BOQItem[];
}

export default function BOQTree(props: Props) {
  const [expandedCustomer, setExpandedCustomer] = createSignal<string | null>(null);
  const [expandedIndikatif, setExpandedIndikatif] = createSignal<string | null>(null);
  const [expandedSegmentasi, setExpandedSegmentasi] = createSignal<string | null>(null);

  return (
    <div class="space-y-6">
      {/* BOQ Customer Section */}
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-base font-bold text-gray-800 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            BOQ Customer
          </h3>
          <span class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
            {props.boqCustomers.length}
          </span>
        </div>
        
        <div class="space-y-3">
          <For each={props.boqCustomers}>
            {(b) => (
              <div class="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                {/* Header */}
                <div 
                  class="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedCustomer(expandedCustomer() === b.id ? null : b.id)}
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="text-sm font-bold text-gray-900">[{b.boqId}] {b.designator}</span>
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-800 text-white">
                          {b.type}
                        </span>
                      </div>
                      <div class="text-sm text-gray-700 mb-2">{b.uraian}</div>
                      <div class="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                        <span class="flex items-center gap-1">
                          <span class="font-medium">Qty:</span> 
                          <span class="font-semibold text-gray-900">{b.qty.toLocaleString()}</span>
                          <span class="text-gray-500">{b.satuan}</span>
                        </span>
                        <span class="text-gray-400">•</span>
                        <span class="flex items-center gap-1">
                          <span class="font-medium">Harga:</span> 
                          <span class="font-semibold text-gray-900">Rp {b.hargaSatuan.toLocaleString()}</span>
                        </span>
                        <span class="text-gray-400">•</span>
                        <span class="flex items-center gap-1">
                          <span class="font-medium">Total:</span> 
                          <span class="font-bold text-blue-600">Rp {b.totalHarga.toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                    <button 
                      class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedCustomer(expandedCustomer() === b.id ? null : b.id);
                      }}
                    >
                      <span class="text-gray-600 font-bold text-lg">
                        {expandedCustomer() === b.id ? '−' : '+'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                <Show when={expandedCustomer() === b.id}>
                  <div class="border-t border-gray-200 bg-gray-50 p-4">
                    {/* Segmentasi Section */}
                    <Show when={b.segmentasi && b.segmentasi.length > 0}>
                      <div>
                        <div class="flex items-center justify-between mb-3">
                          <h4 class="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Segmentasi
                          </h4>
                          <span class="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            {b.segmentasi?.length || 0}
                          </span>
                        </div>
                        
                        <div class="space-y-2">
                          <For each={b.segmentasi || []}>
                            {(s) => (
                              <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div 
                                  class="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                  onClick={() => setExpandedSegmentasi(expandedSegmentasi() === s.id ? null : s.id)}
                                >
                                  <div class="flex items-center justify-between gap-2">
                                    <div class="flex-1">
                                      <div class="flex items-center gap-2 mb-1">
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800">
                                          {s.id}
                                        </span>
                                        <span class="text-sm text-gray-700">
                                          {s.startPoint} → {s.endPoint}
                                        </span>
                                      </div>
                                      <div class="text-xs text-gray-600">
                                        <span class="font-medium">Panjang:</span> <span class="font-semibold text-gray-900">{s.panjang}m</span>
                                        <Show when={s.cells && s.cells.length > 0}>
                                          <span class="mx-2 text-gray-400">•</span>
                                          <span class="font-medium">Cells:</span> <span class="font-semibold text-gray-900">{s.cells.length}</span>
                                        </Show>
                                      </div>
                                    </div>
                                    <button 
                                      class="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedSegmentasi(expandedSegmentasi() === s.id ? null : s.id);
                                      }}
                                    >
                                      <span class="text-gray-600 text-sm font-bold">
                                        {expandedSegmentasi() === s.id ? '▼' : '▶'}
                                      </span>
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Cells */}
                                <Show when={expandedSegmentasi() === s.id && s.cells && s.cells.length > 0}>
                                  <div class="border-t border-gray-200 bg-gray-50 p-3">
                                    <div class="space-y-1.5">
                                      <For each={s.cells}>
                                        {(c) => (
                                          <div class="flex items-center justify-between text-xs bg-white p-2 rounded border border-gray-200">
                                            <div class="flex items-center gap-3">
                                              <span class="font-semibold text-gray-900">{c.id}</span>
                                              <span class="text-gray-600">
                                                Lat: <span class="font-medium text-gray-900">{c.lat}</span>
                                              </span>
                                              <span class="text-gray-600">
                                                Long: <span class="font-medium text-gray-900">{c.long}</span>
                                              </span>
                                            </div>
                                            <span class={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                              c.status === 'DONE' 
                                                ? 'bg-green-100 text-green-800' 
                                                : c.status === 'IN_PROGRESS'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                              {c.status}
                                            </span>
                                          </div>
                                        )}
                                      </For>
                                    </div>
                                  </div>
                                </Show>
                              </div>
                            )}
                          </For>
                        </div>
                      </div>
                    </Show>
                  </div>
                </Show>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* BOQ Indikatif Section */}
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-base font-bold text-gray-800 flex items-center gap-2">
            <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            BOQ Indikatif
          </h3>
          <span class="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
            {props.boqIndikatifs.length}
          </span>
        </div>
        
        <div class="space-y-3">
          <For each={props.boqIndikatifs}>
            {(b) => (
              <div class="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                {/* Header */}
                <div 
                  class="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedIndikatif(expandedIndikatif() === b.id ? null : b.id)}
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="text-sm font-bold text-gray-900">[{b.boqId}] {b.designator}</span>
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-800 text-white">
                          {b.type}
                        </span>
                      </div>
                      <div class="text-sm text-gray-700 mb-2">{b.uraian}</div>
                      <div class="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                        <span class="flex items-center gap-1">
                          <span class="font-medium">Qty:</span> 
                          <span class="font-semibold text-gray-900">{b.qty.toLocaleString()}</span>
                          <span class="text-gray-500">{b.satuan}</span>
                        </span>
                        <span class="text-gray-400">•</span>
                        <span class="flex items-center gap-1">
                          <span class="font-medium">Total:</span> 
                          <span class="font-bold text-orange-600">Rp {b.totalHarga.toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                    <button 
                      class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedIndikatif(expandedIndikatif() === b.id ? null : b.id);
                      }}
                    >
                      <span class="text-gray-600 font-bold text-lg">
                        {expandedIndikatif() === b.id ? '−' : '+'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                <Show when={expandedIndikatif() === b.id}>
                  <div class="border-t border-gray-200 bg-gray-50 p-4">
                    <div class="bg-white border border-gray-200 rounded-lg p-3">
                      <div class="text-sm text-gray-700">
                        <div class="font-semibold text-gray-800 mb-2">Detail Perhitungan:</div>
                        <div class="space-y-1">
                          <div class="flex justify-between">
                            <span class="text-gray-600">Quantity:</span>
                            <span class="font-medium text-gray-900">{b.qty.toLocaleString()} {b.satuan}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-gray-600">Harga Satuan:</span>
                            <span class="font-medium text-gray-900">Rp {b.hargaSatuan.toLocaleString()}</span>
                          </div>
                          <div class="border-t border-gray-200 pt-1 mt-1">
                            <div class="flex justify-between">
                              <span class="font-semibold text-gray-800">Total:</span>
                              <span class="font-bold text-orange-600">Rp {b.totalHarga.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Show>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
