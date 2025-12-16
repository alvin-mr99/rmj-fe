import { createSignal, Show } from 'solid-js';

interface MilestoneFormData {
  id?: number;
  no?: number;
  milestone: string;
  level: 'High' | 'Medium' | 'Low';
  activity: string;
  remark: string;
  eventPoint: string;
}

interface MilestoneFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MilestoneFormData) => void;
  editData?: MilestoneFormData | null;
  nextNo: number;
}

export default function MilestoneFormModal(props: MilestoneFormModalProps) {
  const [formData, setFormData] = createSignal<MilestoneFormData>(
    props.editData || {
      milestone: '',
      level: 'Medium',
      activity: '',
      remark: 'Pending',
      eventPoint: new Date().toISOString().split('T')[0],
    }
  );

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const data = formData();
    
    // Add no if creating new item
    if (!props.editData) {
      props.onSave({ ...data, no: props.nextNo });
    } else {
      props.onSave(data);
    }
    
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      milestone: '',
      level: 'Medium',
      activity: '',
      remark: 'Pending',
      eventPoint: new Date().toISOString().split('T')[0],
    });
    props.onClose();
  };

  const updateField = (field: keyof MilestoneFormData, value: any) => {
    setFormData({ ...formData(), [field]: value });
  };

  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-800">
              {props.editData ? '✏️ Edit Milestone' : '➕ Add New Milestone'}
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
              {/* Milestone Name */}
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Milestone Name <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData().milestone}
                  onInput={(e) => updateField('milestone', e.currentTarget.value)}
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Approval Kontrak"
                />
              </div>

              {/* Level */}
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Level <span class="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData().level}
                  onChange={(e) => updateField('level', e.currentTarget.value)}
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Activity */}
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Activity <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData().activity}
                  onInput={(e) => updateField('activity', e.currentTarget.value)}
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Contract Signing"
                />
              </div>

              {/* Remark */}
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Remark <span class="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData().remark}
                  onChange={(e) => updateField('remark', e.currentTarget.value)}
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="OK">OK</option>
                  <option value="On Progress">On Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>

              {/* Event Point (Date) */}
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Event Point <span class="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData().eventPoint}
                  onInput={(e) => updateField('eventPoint', e.currentTarget.value)}
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                {props.editData ? 'Update Milestone' : 'Add Milestone'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Show>
  );
}
