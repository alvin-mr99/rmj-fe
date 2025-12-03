import { createSignal, For, Show } from 'solid-js';
import type { BOQItem, Segmentasi } from '../types';

interface Props {
  boqCustomers: BOQItem[];
  boqIndikatifs: BOQItem[];
}

export default function BOQTree(props: Props) {
  const [expandedCustomer, setExpandedCustomer] = createSignal<string | null>(null);
  const [expandedIndikatif, setExpandedIndikatif] = createSignal<string | null>(null);

  return (
    <div class="p-2">
      <div class="space-y-3">
        <div>
          <div class="font-bold">BOQ Customer</div>
          <div class="mt-2 space-y-2">
            <For each={props.boqCustomers}>
              {(b) => (
                <div class="border rounded p-2 bg-white">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-semibold">[{b.boqId}] {b.designator} - {b.uraian}</div>
                      <div class="text-sm text-gray-600">Type: {b.type} • Qty: {b.qty} • Total: {b.totalHarga.toLocaleString()}</div>
                    </div>
                    <div>
                      <button class="px-2 py-1 bg-gray-100 rounded" onClick={() => setExpandedCustomer(expandedCustomer() === b.id ? null : b.id)}>{expandedCustomer() === b.id ? '−' : '+'}</button>
                    </div>
                  </div>

                  <Show when={expandedCustomer() === b.id}>
                    <div class="mt-2 pl-3">
                      <div class="font-semibold">Segmentasi</div>
                      <For each={b.segmentasi}>
                        {(s) => (
                          <div class="pl-3 mt-2">
                            <div class="text-sm font-medium">{s.id}: {s.startPoint} - {s.endPoint} ({s.panjang}m)</div>
                            <div class="pl-3 mt-1">
                              <For each={s.cells}>
                                {(c) => (
                                  <div class="text-sm">• {c.id}: Lat {c.lat}, Long {c.long} [{c.status}]</div>
                                )}
                              </For>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </div>

        <div>
          <div class="font-bold">BOQ Indikatif</div>
          <div class="mt-2 space-y-2">
            <For each={props.boqIndikatifs}>
              {(b) => (
                <div class="border rounded p-2 bg-white">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-semibold">[{b.boqId}] {b.designator} - {b.uraian}</div>
                      <div class="text-sm text-gray-600">Qty: {b.qty} {b.satuan} • Total: {b.totalHarga.toLocaleString()}</div>
                    </div>
                    <div>
                      <button class="px-2 py-1 bg-gray-100 rounded" onClick={() => setExpandedIndikatif(expandedIndikatif() === b.id ? null : b.id)}>{expandedIndikatif() === b.id ? '−' : '+'}</button>
                    </div>
                  </div>

                  <Show when={expandedIndikatif() === b.id}>
                    <div class="mt-2 pl-3 text-sm text-gray-700">Detail: {b.qty} {b.satuan} × Rp {b.hargaSatuan.toLocaleString()} = Rp {b.totalHarga.toLocaleString()}</div>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
}
