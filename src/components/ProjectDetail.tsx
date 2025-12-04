import { createSignal, For, Show } from 'solid-js';
import type { ProjectHierarchyProject,  Lokasi } from '../types';
import LokasiDetailModal from '../components/LokasiDetailModal';

interface Props {
  project: ProjectHierarchyProject;
  onClose: () => void;
}

export default function ProjectDetail(props: Props) {
  const [activeTab, setActiveTab] = createSignal<'detail' | 'milestone'>('detail');
  const [expandedAreaIds, setExpandedAreaIds] = createSignal<string[]>([]);
  const [showLokasiModal, setShowLokasiModal] = createSignal(false);
  const [selectedLokasi, setSelectedLokasi] = createSignal<Lokasi | any>(null);

  function toggleArea(areaId: string) {
    if (expandedAreaIds().includes(areaId)) {
      setExpandedAreaIds(expandedAreaIds().filter(id => id !== areaId));
    } else {
      setExpandedAreaIds([...expandedAreaIds(), areaId]);
    }
  }

  function openLokasi(l: Lokasi) {
    setSelectedLokasi(l);
    setShowLokasiModal(true);
  }

  return (
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div class="flex items-start justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div>
          <h4 class="text-lg font-bold text-gray-800">Detail Kontrak: {props.project.namaKontrak}</h4>
          <p class="text-xs text-gray-600 mt-0.5">
            <span class="font-medium">No Kontrak:</span> {props.project.noKontrak} • 
            <span class="font-medium ml-2">TREG:</span> {props.project.treg} • 
            <span class="font-medium ml-2">Area:</span> {props.project.area}
          </p>
        </div>
        <button 
          class="px-3 py-1.5 text-sm bg-white hover:bg-gray-100 text-gray-700 rounded-lg transition-colors shadow-sm border border-gray-200 font-medium"
          onClick={props.onClose}
        >
          Close
        </button>
      </div>

      {/* Tabs */}
      <div class="px-4 pt-3">
        <div class="flex gap-2 border-b border-gray-200">
          <button 
            class={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-all ${
              activeTab() === 'detail' 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`} 
            onClick={() => setActiveTab('detail')}
          >
            📋 Detail Kontrak
          </button>
          <button 
            class={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-all ${
              activeTab() === 'milestone' 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`} 
            onClick={() => setActiveTab('milestone')}
          >
            🎯 Milestone
          </button>
        </div>
      </div>

      {/* Content */}
      <div class="px-4 py-3">
        <Show when={activeTab() === 'detail'}>
          <div>
            <div class="grid grid-cols-3 gap-3 mb-4">
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                <div class="text-xs text-blue-600 font-semibold mb-1">Nama Kontrak</div>
                <div class="text-xs font-bold text-gray-800">{props.project.namaKontrak}</div>
              </div>
              <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
                <div class="text-xs text-purple-600 font-semibold mb-1">Program</div>
                <div class="text-xs font-bold text-gray-800">{props.project.program}</div>
              </div>
              <div class="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                <div class="text-xs text-green-600 font-semibold mb-1">Plan RFS</div>
                <div class="text-xs font-bold text-gray-800">{props.project.planRFS}</div>
              </div>
            </div>

            <div>
              <h5 class="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Paket Area
              </h5>
              <div class="space-y-4">
                <For each={props.project.paketAreas}>
                  {(pa) => (
                    <div class="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100">
                        <div>
                          <div class="font-bold text-gray-800">{pa.namaArea}</div>
                          <div class="text-sm text-gray-600 mt-1">Area ID: <span class="font-medium">{pa.areaId}</span></div>
                        </div>
                        <button 
                          class={`px-4 py-2 rounded-lg font-medium transition-all ${
                            expandedAreaIds().includes(pa.id)
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => toggleArea(pa.id)}
                        >
                          {expandedAreaIds().includes(pa.id) ? '− Collapse' : '+ Expand'}
                        </button>
                      </div>

                      <Show when={expandedAreaIds().includes(pa.id)}>
                        <div class="p-4">
                          <div class="rounded-lg border border-gray-200 overflow-hidden">
                            <table class="w-full border-collapse">
                              <thead>
                                <tr class="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kode</th>
                                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Mitra</th>
                                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Witel</th>
                                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Site Name</th>
                                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Jumlah Ruas</th>
                                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                                </tr>
                              </thead>
                              <tbody class="bg-white divide-y divide-gray-200">
                                <For each={pa.lokasis}>
                                  {(l) => (
                                    <tr class="hover:bg-blue-50 transition-colors">
                                      <td class="px-4 py-3 text-sm text-gray-900 font-medium">{l.kode}</td>
                                      <td class="px-4 py-3 text-sm text-gray-900">{l.mitra}</td>
                                      <td class="px-4 py-3 text-sm text-gray-900">{l.witel}</td>
                                      <td class="px-4 py-3 text-sm text-gray-900">{l.siteName}</td>
                                      <td class="px-4 py-3 text-sm">
                                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                          {l.ruasKontraks.length} Ruas
                                        </span>
                                      </td>
                                      <td class="px-4 py-3 text-center">
                                        <button 
                                          class="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors shadow-sm font-medium"
                                          onClick={() => openLokasi(l)}
                                        >
                                          View Detail
                                        </button>
                                      </td>
                                    </tr>
                                  )}
                                </For>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </Show>

        <Show when={activeTab() === 'milestone'}>
          <div>
            <div class="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">No</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Milestone</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Level</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Activity</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Remark</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Event Point</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr class="hover:bg-blue-50 transition-colors">
                    <td class="px-4 py-3 text-sm text-gray-900 font-medium">1</td>
                    <td class="px-4 py-3 text-sm text-gray-900">Mobilisasi</td>
                    <td class="px-4 py-3 text-sm">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        High
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900">Persiapan</td>
                    <td class="px-4 py-3 text-sm">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        OK
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900">2024-10-01</td>
                  </tr>
                  <tr class="hover:bg-blue-50 transition-colors">
                    <td class="px-4 py-3 text-sm text-gray-900 font-medium">2</td>
                    <td class="px-4 py-3 text-sm text-gray-900">Penggalian</td>
                    <td class="px-4 py-3 text-sm">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        Medium
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900">On Going</td>
                    <td class="px-4 py-3 text-sm">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                        Delay
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900">2024-11-15</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Show>
      </div>
      
      {/* Modals */}
      <Show when={showLokasiModal()}>
        <LokasiDetailModal lokasi={selectedLokasi()} onClose={() => setShowLokasiModal(false)} />
      </Show>
    </div>
  );
}
