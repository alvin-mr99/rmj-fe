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
      <div class="bg-white rounded-xl w-[90vw] h-[85vh] overflow-auto p-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h4 class="text-lg font-bold">Lokasi: {props.lokasi.kode} — {props.lokasi.siteName}</h4>
            <div class="text-sm text-gray-600">Mitra: {props.lokasi.mitra} • Witel: {props.lokasi.witel}</div>
          </div>
          <div>
            <button class="px-3 py-1 bg-gray-100 rounded" onClick={props.onClose}>Close</button>
          </div>
        </div>

        <div>
          <h5 class="font-semibold mb-2">Tabel Ruas Kontrak</h5>
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100 text-left">
                <th class="p-2">No Ruas</th>
                <th class="p-2">Nama Ruas</th>
                <th class="p-2">Panjang (KM)</th>
                <th class="p-2">Volume (M)</th>
                <th class="p-2">Progress Galian (%)</th>
                <th class="p-2">Progress HDPE (%)</th>
                <th class="p-2">Nilai DRM</th>
                <th class="p-2">Nilai Rekon</th>
                <th class="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              <For each={props.lokasi.ruasKontraks}>
                {(r) => (
                  <>
                    <tr class="border-t">
                      <td class="p-2">{r.noRuas}</td>
                      <td class="p-2">{r.namaRuas}</td>
                      <td class="p-2">{r.panjangKM}</td>
                      <td class="p-2">{r.volumeMeter}</td>
                      <td class="p-2">{r.progressGalian}%</td>
                      <td class="p-2">{r.progressHDPE}%</td>
                      <td class="p-2">{r.nilaiDRM.toLocaleString()}</td>
                      <td class="p-2">{r.nilaiRekon.toLocaleString()}</td>
                      <td class="p-2">
                        <button class="px-2 py-1 bg-blue-500 text-white rounded" onClick={() => setExpandedRuas(expandedRuas() === r.id ? null : r.id)}>Toggle Tree</button>
                      </td>
                    </tr>
                    <Show when={expandedRuas() === r.id}>
                      <tr>
                        <td colspan={9} class="p-2 bg-gray-50">
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
  );
}
