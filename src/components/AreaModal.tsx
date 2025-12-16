import { createSignal, Show, createEffect } from 'solid-js';

interface AreaModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: { areaId: string; namaArea: string }) => void;
  editingArea?: { id: string; areaId: string; namaArea: string } | null;
}

export default function AreaModal(props: AreaModalProps) {
  const [areaId, setAreaId] = createSignal('');
  const [namaArea, setNamaArea] = createSignal('');

  // Update form when editingArea changes
  createEffect(() => {
    if (props.show) {
      setAreaId(props.editingArea?.areaId || '');
      setNamaArea(props.editingArea?.namaArea || '');
    }
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    
    if (!areaId().trim() || !namaArea().trim()) {
      alert('Please fill all required fields');
      return;
    }

    props.onSave({
      areaId: areaId().trim(),
      namaArea: namaArea().trim()
    });

    handleClose();
  };

  const handleClose = () => {
    setAreaId('');
    setNamaArea('');
    props.onClose();
  };

  return (
    <Show when={props.show}>
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div class="p-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-800">
              {props.editingArea ? '✏️ Edit Area' : '➕ Add New Area'}
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} class="p-4 space-y-4">
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

            {/* Footer Buttons */}
            <div class="flex gap-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                class="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
              >
                {props.editingArea ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Show>
  );
}
