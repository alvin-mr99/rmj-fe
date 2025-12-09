import { createSignal, Show } from 'solid-js';
import type { GridApi } from 'ag-grid-community';
import { GlobalColumnSettings } from './GlobalColumnSettings';

interface MultiTableColumnSettingsProps {
  projectGridApi: GridApi | null;
  lokasiGridApi: GridApi | null;
  milestoneGridApi: GridApi | null;
  ruasGridApi: GridApi | null;
  userEmail?: string;
  onNavigateToSitelist?: () => void;
}

export function MultiTableColumnSettings(props: MultiTableColumnSettingsProps) {
  const [selectedTable, setSelectedTable] = createSignal<'project' | 'lokasi' | 'milestone' | 'ruas'>('project');

  const tableOptions = [
    { value: 'project', label: 'Tabel Project', apiGetter: () => props.projectGridApi },
    { value: 'lokasi', label: 'Tabel Paket Area (Lokasi)', apiGetter: () => props.lokasiGridApi },
    { value: 'milestone', label: 'Tabel Milestone', apiGetter: () => props.milestoneGridApi },
    { value: 'ruas', label: 'Tabel Ruas Kontrak', apiGetter: () => props.ruasGridApi },
  ];

  const currentTableOption = () => tableOptions.find(opt => opt.value === selectedTable());
  const currentGridApi = () => currentTableOption()?.apiGetter() || null;

  return (
    <div class="h-full flex flex-col bg-gray-50">
      {/* Table Selector */}
      <div class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center gap-4">
          <label class="text-sm font-semibold text-gray-700">Pilih Tabel:</label>
          <div class="flex gap-2">
            {tableOptions.map(option => (
              <button
                onClick={() => setSelectedTable(option.value as any)}
                class={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  selectedTable() === option.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Column Template Manager */}
      <div class="flex-1 overflow-hidden">
        <Show
          when={currentGridApi()}
          fallback={
            <div class="flex items-center justify-center h-full p-8">
              <div class="text-center max-w-md">
                <svg class="w-20 h-20 mx-auto mb-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 class="text-xl font-bold text-gray-800 mb-3">Tabel Tidak Tersedia</h3>
                <p class="text-sm text-gray-600 mb-4">
                  Tabel <strong>{currentTableOption()?.label}</strong> belum dimuat atau tidak tersedia.
                </p>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
                  <p class="text-xs font-semibold text-blue-900 mb-2">📌 Cara Membuka Tabel:</p>
                  <Show when={selectedTable() === 'project'}>
                    <ol class="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
                      <li>Klik tab <strong>"📊 Sitelist Project"</strong> di atas</li>
                      <li>Tabel Project akan otomatis ter-load</li>
                      <li>Kembali ke tab ini untuk mengatur kolom</li>
                    </ol>
                  </Show>
                  <Show when={selectedTable() === 'lokasi'}>
                    <ol class="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
                      <li>Klik tab <strong>"📊 Sitelist Project"</strong></li>
                      <li>Klik tombol <strong>"View Detail"</strong> pada salah satu project</li>
                      <li>Expand salah satu <strong>Paket Area</strong></li>
                      <li>Tabel Lokasi akan muncul</li>
                      <li>Kembali ke tab ini untuk mengatur kolom</li>
                    </ol>
                  </Show>
                  <Show when={selectedTable() === 'milestone'}>
                    <ol class="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
                      <li>Klik tab <strong>"📊 Sitelist Project"</strong></li>
                      <li>Klik tombol <strong>"View Detail"</strong> pada salah satu project</li>
                      <li>Klik tab <strong>"Milestone"</strong> di detail project</li>
                      <li>Tabel Milestone akan muncul</li>
                      <li>Kembali ke tab ini untuk mengatur kolom</li>
                    </ol>
                  </Show>
                  <Show when={selectedTable() === 'ruas'}>
                    <ol class="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
                      <li>Klik tab <strong>"📊 Sitelist Project"</strong></li>
                      <li>Klik tombol <strong>"View Detail"</strong> pada salah satu project</li>
                      <li>Expand salah satu <strong>Paket Area</strong></li>
                      <li>Klik tombol <strong>"View Detail"</strong> pada salah satu Lokasi</li>
                      <li>Tabel Ruas Kontrak akan muncul</li>
                      <li>Kembali ke tab ini untuk mengatur kolom</li>
                    </ol>
                  </Show>
                </div>
                <Show when={selectedTable() === 'project' && props.onNavigateToSitelist}>
                  <button
                    onClick={props.onNavigateToSitelist}
                    class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md"
                  >
                    🚀 Buka Sitelist Project Sekarang
                  </button>
                </Show>
                <Show when={selectedTable() !== 'project'}>
                  <p class="text-xs text-gray-500 mt-3">
                    💡 <em>Tips: Tabel ini perlu dibuka manual terlebih dahulu sebelum dapat dikonfigurasi.</em>
                  </p>
                </Show>
              </div>
            </div>
          }
        >
          <ColumnTemplateManager
            gridApi={currentGridApi()}
            tableType={selectedTable()}
            tableLabel={currentTableOption()?.label || ''}
            userEmail={props.userEmail}
            onClose={() => {}}
          />
        </Show>
      </div>
    </div>
  );
}
