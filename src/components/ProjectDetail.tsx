import { createSignal, For, Show } from 'solid-js';
import type { ProjectHierarchyProject, PaketArea, Lokasi } from '../types';
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
    <div class="bg-white rounded-lg border p-4 shadow-sm">
      <div class="flex items-start justify-between">
        <div>
          <h4 class="text-lg font-bold">Detail Kontrak: {props.project.namaKontrak}</h4>
          <p class="text-sm text-gray-600">No Kontrak: {props.project.noKontrak} • TREG: {props.project.treg} • Area: {props.project.area}</p>
        </div>
        <div class="flex gap-2">
          <button class="px-3 py-1 bg-gray-100 rounded" onClick={props.onClose}>Close</button>
        </div>
      </div>

      <div class="mt-4">
        <div class="flex gap-2">
          <button class={`px-3 py-2 rounded ${activeTab() === 'detail' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`} onClick={() => setActiveTab('detail')}>Detail Kontrak</button>
          <button class={`px-3 py-2 rounded ${activeTab() === 'milestone' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`} onClick={() => setActiveTab('milestone')}>Milestone</button>
        </div>

        <Show when={activeTab() === 'detail'}>
          <div class="mt-4">
            <div class="grid grid-cols-3 gap-4 mb-4">
              <div class="bg-gray-50 p-3 rounded">Nama Kontrak: <strong>{props.project.namaKontrak}</strong></div>
              <div class="bg-gray-50 p-3 rounded">Program: <strong>{props.project.program}</strong></div>
              <div class="bg-gray-50 p-3 rounded">Plan RFS: <strong>{props.project.planRFS}</strong></div>
            </div>

            <div>
              <h5 class="font-semibold">Paket Area</h5>
              <div class="mt-2 space-y-3">
                <For each={props.project.paketAreas}>
                  {(pa) => (
                    <div class="border rounded p-3 bg-white">
                      <div class="flex items-center justify-between">
                        <div>
                          <div class="font-bold">{pa.namaArea}</div>
                          <div class="text-sm text-gray-500">Area ID: {pa.areaId}</div>
                        </div>
                        <div class="flex gap-2">
                          <button class="px-3 py-1 bg-blue-50 rounded" onClick={() => toggleArea(pa.id)}>{expandedAreaIds().includes(pa.id) ? 'Collapse' : 'Expand'}</button>
                        </div>
                      </div>

                      <Show when={expandedAreaIds().includes(pa.id)}>
                        <div class="mt-3">
                          <table class="w-full table-auto border-collapse">
                            <thead>
                              <tr class="bg-gray-100 text-left">
                                <th class="p-2">Kode</th>
                                <th class="p-2">Mitra</th>
                                <th class="p-2">Witel</th>
                                <th class="p-2">Site Name</th>
                                <th class="p-2">Jumlah Ruas</th>
                                <th class="p-2">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              <For each={pa.lokasis}>
                                {(l) => (
                                  <tr class="border-t">
                                    <td class="p-2">{l.kode}</td>
                                    <td class="p-2">{l.mitra}</td>
                                    <td class="p-2">{l.witel}</td>
                                    <td class="p-2">{l.siteName}</td>
                                    <td class="p-2">{l.ruasKontraks.length}</td>
                                    <td class="p-2">
                                      <button class="px-2 py-1 bg-green-500 text-white rounded" onClick={() => openLokasi(l)}>View Detail</button>
                                    </td>
                                  </tr>
                                )}
                              </For>
                            </tbody>
                          </table>
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
          <div class="mt-4">
            <table class="w-full table-auto border-collapse">
              <thead>
                <tr class="bg-gray-100 text-left">
                  <th class="p-2">No</th>
                  <th class="p-2">Milestone</th>
                  <th class="p-2">Level</th>
                  <th class="p-2">Activity</th>
                  <th class="p-2">Remark</th>
                  <th class="p-2">Event Point</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-t"><td class="p-2">1</td><td class="p-2">Mobilisasi</td><td class="p-2">High</td><td class="p-2">Persiapan</td><td class="p-2">OK</td><td class="p-2">2024-10-01</td></tr>
                <tr class="border-t"><td class="p-2">2</td><td class="p-2">Penggalian</td><td class="p-2">Medium</td><td class="p-2">On Going</td><td class="p-2">Delay</td><td class="p-2">2024-11-15</td></tr>
              </tbody>
            </table>
          </div>
        </Show>
      </div>

      <Show when={showLokasiModal()}>
        <LokasiDetailModal lokasi={selectedLokasi()} onClose={() => setShowLokasiModal(false)} />
      </Show>
    </div>
  );
}
