
import { createSignal, Show, For, createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';

interface RuasFormData {
  id?: string;
  noRuas: string;
  namaRuas: string;
  panjangKM: number;
  volumeMeter: number;
  progressGalian: number;
  progressHDPE: number;
  nilaiDRM: number;
  nilaiRekon: number;
}

interface LokasiFormData {
  id?: string;
  kode: string;
  mitra: string;
  witel: string;
  siteName: string;
  ruasKontraks: RuasFormData[];
}

interface UnifiedFormData {
  areaId: string;
  namaArea: string;
  lokasis: LokasiFormData[];
}

interface PaketAreaUnifiedModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: UnifiedFormData) => void;
  editingData?: {
    id: string;
    areaId: string;
    namaArea: string;
    lokasis: any[];
  } | null;
}

export default function PaketAreaUnifiedModal(props: PaketAreaUnifiedModalProps) {
  // Area fields
  const [areaId, setAreaId] = createSignal('');
  const [namaArea, setNamaArea] = createSignal('');
  
  // ✨ PERBAIKAN 1: Gunakan createStore untuk nested data
  const [lokasis, setLokasis] = createStore<LokasiFormData[]>([]);
  
  // Expanded states for accordion
  const [expandedLokasiIndex, setExpandedLokasiIndex] = createSignal<number | null>(null);

  // Update form when editing data changes
  createEffect(() => {
    if (props.show) {
      if (props.editingData) {
        setAreaId(props.editingData.areaId || '');
        setNamaArea(props.editingData.namaArea || '');
        
        // Convert editing data to form format
        const convertedLokasis = (props.editingData.lokasis || []).map(lok => ({
          id: lok.id,
          kode: lok.kode || '',
          mitra: lok.mitra || '',
          witel: lok.witel || '',
          siteName: lok.siteName || '',
          ruasKontraks: (lok.ruasKontraks || []).map((ruas: any) => ({
            id: ruas.id,
            noRuas: ruas.noRuas || '',
            namaRuas: ruas.namaRuas || '',
            panjangKM: ruas.panjangKM || 0,
            volumeMeter: ruas.volumeMeter || 0,
            progressGalian: ruas.progressGalian || 0,
            progressHDPE: ruas.progressHDPE || 0,
            nilaiDRM: ruas.nilaiDRM || 0,
            nilaiRekon: ruas.nilaiRekon || 0,
          }))
        }));
        
        setLokasis(convertedLokasis);
      } else {
        // Reset for new entry
        setAreaId('');
        setNamaArea('');
        setLokasis([]);
      }
    }
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    
    if (!areaId().trim() || !namaArea().trim()) {
      alert('Area ID dan Nama Area harus diisi!');
      return;
    }

    if (lokasis.length === 0) {
      alert('Minimal harus ada 1 lokasi!');
      return;
    }

    // Validate all lokasi
    for (const lokasi of lokasis) {
      if (!lokasi.kode.trim() || !lokasi.siteName.trim() || !lokasi.mitra.trim() || !lokasi.witel.trim()) {
        alert('Semua field lokasi harus diisi!');
        return;
      }
    }

    props.onSave({
      areaId: areaId().trim(),
      namaArea: namaArea().trim(),
      lokasis: Array.from(lokasis) // Convert store to plain array
    });

    handleClose();
  };

  const handleClose = () => {
    setAreaId('');
    setNamaArea('');
    setLokasis([]);
    setExpandedLokasiIndex(null);
    props.onClose();
  };

  // ✨ PERBAIKAN 2: Lokasi CRUD dengan store path
  const addLokasi = () => {
    const newLokasi: LokasiFormData = {
      id: `lok-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      kode: '',
      mitra: '',
      witel: '',
      siteName: '',
      ruasKontraks: []
    };
    setLokasis(lokasis.length, newLokasi);
    setExpandedLokasiIndex(lokasis.length - 1);
  };

  const updateLokasi = (index: number, field: keyof LokasiFormData, value: any) => {
    // Update langsung dengan path - ini yang mencegah re-render
    setLokasis(index, field, value);
  };

  const removeLokasi = (index: number) => {
    if (confirm('Hapus lokasi ini beserta semua ruas kontraknya?')) {
      setLokasis(prev => prev.filter((_, i) => i !== index));
    }
  };

  // ✨ PERBAIKAN 3: Ruas CRUD dengan store path
  const addRuas = (lokasiIndex: number) => {
    const newRuas: RuasFormData = {
      id: `ruas-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      noRuas: '',
      namaRuas: '',
      panjangKM: 0,
      volumeMeter: 0,
      progressGalian: 0,
      progressHDPE: 0,
      nilaiDRM: 0,
      nilaiRekon: 0
    };
    
    // Update nested array dengan path
    setLokasis(lokasiIndex, 'ruasKontraks', prev => [...prev, newRuas]);
  };

  const updateRuas = (lokasiIndex: number, ruasIndex: number, field: keyof RuasFormData, value: any) => {
    // Update nested field langsung dengan path - KUNCI SOLUSI
    setLokasis(lokasiIndex, 'ruasKontraks', ruasIndex, field, value);
  };

  const removeRuas = (lokasiIndex: number, ruasIndex: number) => {
    if (confirm('Hapus ruas kontrak ini?')) {
      setLokasis(lokasiIndex, 'ruasKontraks', prev => prev.filter((_, i) => i !== ruasIndex));
    }
  };

  const toggleLokasi = (index: number) => {
    setExpandedLokasiIndex(expandedLokasiIndex() === index ? null : index);
  };

  return (
    <Show when={props.show}>
      <div class="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-bold text-white">
                {props.editingData ? '✏️ Edit Paket Area' : '➕ Tambah Paket Area Baru'}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                class="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            <p class="text-blue-100 mt-2 text-sm">
              Isi semua informasi Area, Lokasi, dan Ruas Kontrak dalam satu form
            </p>
          </div>

          {/* Form Body - Scrollable */}
          <form onSubmit={handleSubmit} class="flex-1 overflow-y-auto">
            <div class="p-6 space-y-6">
              {/* SECTION 1: AREA INFO */}
              <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h3 class="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <span class="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                  Informasi Area
                </h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">
                      Area ID <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={areaId()}
                      onInput={(e) => setAreaId(e.currentTarget.value)}
                      placeholder="e.g., AREA-001"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">
                      Nama Area <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={namaArea()}
                      onInput={(e) => setNamaArea(e.currentTarget.value)}
                      placeholder="e.g., Jakarta Pusat"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: LOKASI LIST */}
              <div class="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-bold text-purple-900 flex items-center gap-2">
                    <span class="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                    Lokasi / Sites ({lokasis.length})
                  </h3>
                  <button
                    type="button"
                    onClick={addLokasi}
                    class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors"
                  >
                    ➕ Tambah Lokasi
                  </button>
                </div>

                {/* Lokasi List */}
                <Show when={lokasis.length === 0}>
                  <div class="text-center py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <p class="mb-2">Belum ada lokasi</p>
                    <button
                      type="button"
                      onClick={addLokasi}
                      class="text-purple-600 hover:text-purple-700 font-medium underline"
                    >
                      Tambah lokasi pertama
                    </button>
                  </div>
                </Show>

                <div class="space-y-3">
                  <For each={lokasis} fallback={null}>
                    {(lokasi, lokasiIdx) => (
                      <div class="bg-white border-2 border-purple-300 rounded-lg overflow-hidden" data-lokasi-id={lokasi.id}>
                        {/* Lokasi Header - Clickable */}
                        <div 
                          class="flex justify-between items-center p-4 bg-purple-100 cursor-pointer hover:bg-purple-150 transition-colors"
                          onClick={() => toggleLokasi(lokasiIdx())}
                        >
                          <div class="flex items-center gap-3 flex-1 pointer-events-none">
                            <span class="text-2xl">
                              {expandedLokasiIndex() === lokasiIdx() ? '📂' : '📁'}
                            </span>
                            <div>
                              <h4 class="font-bold text-purple-900">
                                {lokasi.siteName || `Lokasi #${lokasiIdx() + 1}`}
                              </h4>
                              <p class="text-sm text-purple-700">
                                {lokasi.kode || 'Belum ada kode'} • {lokasi.ruasKontraks.length} ruas kontrak
                              </p>
                            </div>
                          </div>
                          <div class="flex gap-2 pointer-events-auto">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeLokasi(lokasiIdx());
                              }}
                              class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium"
                            >
                              🗑️ Hapus
                            </button>
                          </div>
                        </div>

                        {/* Lokasi Details - Expandable */}
                        <Show when={expandedLokasiIndex() === lokasiIdx()}>
                          <div class="p-4 space-y-4 border-t-2 border-purple-200">
                            {/* Lokasi Fields */}
                            <div class="grid grid-cols-2 gap-4">
                              <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-1">
                                  Kode <span class="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={lokasi.kode}
                                  onInput={(e) => updateLokasi(lokasiIdx(), 'kode', e.currentTarget.value)}
                                  placeholder="e.g., LOK-001"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                                  required
                                />
                              </div>
                              <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-1">
                                  Site Name <span class="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={lokasi.siteName}
                                  onInput={(e) => updateLokasi(lokasiIdx(), 'siteName', e.currentTarget.value)}
                                  placeholder="e.g., Site A"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                                  required
                                />
                              </div>
                              <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-1">
                                  Mitra <span class="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={lokasi.mitra}
                                  onInput={(e) => updateLokasi(lokasiIdx(), 'mitra', e.currentTarget.value)}
                                  placeholder="e.g., PT. Mitra ABC"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                                  required
                                />
                              </div>
                              <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-1">
                                  Witel <span class="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={lokasi.witel}
                                  onInput={(e) => updateLokasi(lokasiIdx(), 'witel', e.currentTarget.value)}
                                  placeholder="e.g., Jakarta Utara"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                                  required
                                />
                              </div>
                            </div>

                            {/* SECTION 3: RUAS KONTRAK */}
                            <div class="mt-4 pt-4 border-t-2 border-gray-200">
                              <div class="flex justify-between items-center mb-3">
                                <h4 class="text-md font-bold text-orange-900 flex items-center gap-2">
                                  <span class="bg-orange-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs">3</span>
                                  Ruas Kontrak ({lokasi.ruasKontraks.length})
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => addRuas(lokasiIdx())}
                                  class="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium"
                                >
                                  ➕ Tambah Ruas
                                </button>
                              </div>

                              <Show when={lokasi.ruasKontraks.length === 0}>
                                <div class="text-center py-4 text-gray-500 bg-orange-50 rounded border-2 border-dashed border-orange-300">
                                  <p class="mb-2 text-sm">Belum ada ruas kontrak</p>
                                  <button
                                    type="button"
                                    onClick={() => addRuas(lokasiIdx())}
                                    class="text-orange-600 hover:text-orange-700 font-medium underline text-sm"
                                  >
                                    Tambah ruas pertama
                                  </button>
                                </div>
                              </Show>

                              {/* Ruas List */}
                              <div class="space-y-3">
                                <For each={lokasi.ruasKontraks} fallback={null}>
                                  {(ruas, ruasIdx) => (
                                    <div class="bg-orange-50 border border-orange-300 rounded-lg p-4" data-ruas-id={ruas.id}>
                                      <div class="flex justify-between items-center mb-3">
                                        <h5 class="font-bold text-orange-900">
                                          🛣️ Ruas #{ruasIdx() + 1}: {ruas.namaRuas || 'Belum diisi'}
                                        </h5>
                                        <button
                                          type="button"
                                          onClick={() => removeRuas(lokasiIdx(), ruasIdx())}
                                          class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium"
                                        >
                                          🗑️
                                        </button>
                                      </div>

                                      {/* Ruas Fields - Compact Grid */}
                                      <div class="grid grid-cols-4 gap-3">
                                        <div>
                                          <label class="block text-xs font-semibold text-gray-700 mb-1">
                                            No Ruas <span class="text-red-500">*</span>
                                          </label>
                                          <input
                                            type="text"
                                            value={ruas.noRuas}
                                            onInput={(e) => updateRuas(lokasiIdx(), ruasIdx(), 'noRuas', e.currentTarget.value)}
                                            placeholder="R-001"
                                            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                            required
                                          />
                                        </div>
                                        <div class="col-span-3">
                                          <label class="block text-xs font-semibold text-gray-700 mb-1">
                                            Nama Ruas <span class="text-red-500">*</span>
                                          </label>
                                          <input
                                            type="text"
                                            value={ruas.namaRuas}
                                            onInput={(e) => updateRuas(lokasiIdx(), ruasIdx(), 'namaRuas', e.currentTarget.value)}
                                            placeholder="Ruas A-B"
                                            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label class="block text-xs font-semibold text-gray-700 mb-1">Panjang (KM)</label>
                                          <input
                                            type="number"
                                            step="0.01"
                                            value={ruas.panjangKM}
                                            onInput={(e) => updateRuas(lokasiIdx(), ruasIdx(), 'panjangKM', parseFloat(e.currentTarget.value) || 0)}
                                            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                          />
                                        </div>
                                        <div>
                                          <label class="block text-xs font-semibold text-gray-700 mb-1">Volume (M)</label>
                                          <input
                                            type="number"
                                            step="0.01"
                                            value={ruas.volumeMeter}
                                            onInput={(e) => updateRuas(lokasiIdx(), ruasIdx(), 'volumeMeter', parseFloat(e.currentTarget.value) || 0)}
                                            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                          />
                                        </div>
                                        <div>
                                          <label class="block text-xs font-semibold text-gray-700 mb-1">Progress Galian (%)</label>
                                          <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={ruas.progressGalian}
                                            onInput={(e) => updateRuas(lokasiIdx(), ruasIdx(), 'progressGalian', parseInt(e.currentTarget.value) || 0)}
                                            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                          />
                                        </div>
                                        <div>
                                          <label class="block text-xs font-semibold text-gray-700 mb-1">Progress HDPE (%)</label>
                                          <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={ruas.progressHDPE}
                                            onInput={(e) => updateRuas(lokasiIdx(), ruasIdx(), 'progressHDPE', parseInt(e.currentTarget.value) || 0)}
                                            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                          />
                                        </div>
                                        <div class="col-span-2">
                                          <label class="block text-xs font-semibold text-gray-700 mb-1">Nilai DRM (Rp)</label>
                                          <input
                                            type="number"
                                            value={ruas.nilaiDRM}
                                            onInput={(e) => updateRuas(lokasiIdx(), ruasIdx(), 'nilaiDRM', parseInt(e.currentTarget.value) || 0)}
                                            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                          />
                                        </div>
                                        <div class="col-span-2">
                                          <label class="block text-xs font-semibold text-gray-700 mb-1">Nilai Rekon (Rp)</label>
                                          <input
                                            type="number"
                                            value={ruas.nilaiRekon}
                                            onInput={(e) => updateRuas(lokasiIdx(), ruasIdx(), 'nilaiRekon', parseInt(e.currentTarget.value) || 0)}
                                            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </For>
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
          </form>

          {/* Footer */}
          <div class="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center gap-3">
            <div class="text-sm text-gray-600">
              <strong>Summary:</strong> {lokasis.length} lokasi, {lokasis.reduce((sum, lok) => sum + lok.ruasKontraks.length, 0)} ruas kontrak
            </div>
            <div class="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                class="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors shadow-lg"
              >
                {props.editingData ? '💾 Update Data' : '✨ Simpan Semua'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}