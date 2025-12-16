import { createSignal, Show } from 'solid-js';

export interface BoQItem {
  id?: number;
  no?: number;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
  notes?: string;
}

interface BoQFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BoQItem) => void;
  editData?: BoQItem | null;
  nextNo: number;
}

export default function BoQFormModal(props: BoQFormModalProps) {
  const [formData, setFormData] = createSignal<BoQItem>(
    props.editData || {
      description: '',
      unit: 'M',
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
      category: 'Pekerjaan Tanah',
      notes: '',
    }
  );

  const units = ['M', 'M2', 'M3', 'Km', 'Unit', 'Titik', 'LS'];
  const categories = [
    'Pekerjaan Tanah',
    'Pekerjaan Kabel',
    'Pekerjaan Pipa',
    'Pekerjaan Sipil',
    'Pekerjaan Finishing',
    'Pekerjaan Perangkat',
    'Pekerjaan Testing',
  ];

  const calculateTotalPrice = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const data = formData();
    
    // Calculate total price
    const totalPrice = calculateTotalPrice(data.quantity, data.unitPrice);
    
    // Add no if creating new item
    if (!props.editData) {
      props.onSave({ ...data, totalPrice, no: props.nextNo });
    } else {
      props.onSave({ ...data, totalPrice });
    }
    
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      description: '',
      unit: 'M',
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
      category: 'Pekerjaan Tanah',
      notes: '',
    });
    props.onClose();
  };

  const updateField = (field: keyof BoQItem, value: any) => {
    const updated = { ...formData(), [field]: value };
    
    // Recalculate total if quantity or unit price changes
    if (field === 'quantity' || field === 'unitPrice') {
      updated.totalPrice = calculateTotalPrice(
        field === 'quantity' ? value : updated.quantity,
        field === 'unitPrice' ? value : updated.unitPrice
      );
    }
    
    setFormData(updated);
  };

  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-800">
              {props.editData ? '✏️ Edit BoQ Item' : '➕ Add New BoQ Item'}
            </h2>
            <button
              onClick={handleClose}
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} class="p-6">
            <div class="space-y-4">
              {/* Description */}
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData().description}
                  onInput={(e) => updateField('description', e.currentTarget.value)}
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Galian Tanah Manual"
                />
              </div>

              {/* Category */}
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Category <span class="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData().category}
                  onChange={(e) => updateField('category', e.currentTarget.value)}
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Unit and Quantity Row */}
              <div class="grid grid-cols-2 gap-4">
                {/* Unit */}
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Unit <span class="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData().unit}
                    onChange={(e) => updateField('unit', e.currentTarget.value)}
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {units.map((unit) => (
                      <option value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData().quantity}
                    onInput={(e) => updateField('quantity', parseFloat(e.currentTarget.value) || 0)}
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Unit Price */}
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Unit Price (Rp) <span class="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={formData().unitPrice}
                  onInput={(e) => updateField('unitPrice', parseFloat(e.currentTarget.value) || 0)}
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              {/* Total Price (Read-only, calculated) */}
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Total Price (Rp)
                </label>
                <div class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-semibold">
                  Rp {formData().totalPrice.toLocaleString('id-ID')}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  rows="3"
                  value={formData().notes}
                  onInput={(e) => updateField('notes', e.currentTarget.value)}
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                {props.editData ? 'Update BoQ Item' : 'Add BoQ Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Show>
  );
}
