import { createSignal, Show } from 'solid-js';
import type { ProjectHierarchyProject } from '../types';

interface ProjectFormModalProps {
  project?: ProjectHierarchyProject | null;
  onClose: () => void;
  onSave: (data: Partial<ProjectHierarchyProject>) => void;
}

export default function ProjectFormModal(props: ProjectFormModalProps) {
  const [formData, setFormData] = createSignal({
    tahunProject: props.project?.tahunProject || '',
    program: props.project?.program || '',
    noKontrak: props.project?.noKontrak || '',
    regional: props.project?.regional || '',
    treg: props.project?.treg || '',
    planRFS: props.project?.planRFS || '',
    currentMilestone: props.project?.currentMilestone || '',
  });

  const [errors, setErrors] = createSignal<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData(), [field]: value });
    // Clear error when user starts typing
    if (errors()[field]) {
      setErrors({ ...errors(), [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const data = formData();

    if (!data.tahunProject.trim()) {
      newErrors.tahunProject = 'Tahun Project is required';
    }
    if (!data.program.trim()) {
      newErrors.program = 'Program is required';
    }
    if (!data.noKontrak.trim()) {
      newErrors.noKontrak = 'No Kontrak is required';
    }
    if (!data.regional.trim()) {
      newErrors.regional = 'Regional is required';
    }
    if (!data.treg.trim()) {
      newErrors.treg = 'TREG is required';
    }
    if (!data.planRFS.trim()) {
      newErrors.planRFS = 'Plan RFS is required';
    }
    if (!data.currentMilestone.trim()) {
      newErrors.currentMilestone = 'Current Milestone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    
    if (validateForm()) {
      props.onSave(formData());
      props.onClose();
    }
  };

  const isEditMode = () => !!props.project;

  return (
    <div 
      class="fixed inset-0 bg-black/50 z-[2200] flex items-center justify-center p-4"
      onClick={props.onClose}
    >
      <div 
        class="bg-white rounded-2xl w-full max-w-3xl flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ "font-family": "'Poppins', sans-serif" }}
      >
        {/* Header */}
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-100">
          <div>
            <h2 class="text-xl font-bold text-gray-800">
              {isEditMode() ? '✏️ Edit Project' : '➕ Create New Project'}
            </h2>
            <p class="text-sm text-gray-600 mt-1">
              {isEditMode() ? 'Update project information' : 'Fill in the project details'}
            </p>
          </div>
          <button
            class="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-colors shadow-sm border border-gray-200"
            onClick={props.onClose}
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} class="flex-1 overflow-y-auto px-6 py-6">
          <div class="grid grid-cols-2 gap-6">
            {/* Tahun Project */}
            <div class="col-span-1">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Tahun Project <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData().tahunProject}
                onInput={(e) => handleInputChange('tahunProject', e.currentTarget.value)}
                class={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors().tahunProject ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 2024"
              />
              <Show when={errors().tahunProject}>
                <p class="text-red-500 text-xs mt-1">{errors().tahunProject}</p>
              </Show>
            </div>

            {/* Program */}
            <div class="col-span-1">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Program <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData().program}
                onInput={(e) => handleInputChange('program', e.currentTarget.value)}
                class={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors().program ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., FO-Deployment"
              />
              <Show when={errors().program}>
                <p class="text-red-500 text-xs mt-1">{errors().program}</p>
              </Show>
            </div>

            {/* No Kontrak */}
            <div class="col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                No Kontrak <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData().noKontrak}
                onInput={(e) => handleInputChange('noKontrak', e.currentTarget.value)}
                class={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors().noKontrak ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., KTR-2024-001"
              />
              <Show when={errors().noKontrak}>
                <p class="text-red-500 text-xs mt-1">{errors().noKontrak}</p>
              </Show>
            </div>

            {/* Regional */}
            <div class="col-span-1">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Regional <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData().regional}
                onInput={(e) => handleInputChange('regional', e.currentTarget.value)}
                class={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors().regional ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Jakarta Pusat"
              />
              <Show when={errors().regional}>
                <p class="text-red-500 text-xs mt-1">{errors().regional}</p>
              </Show>
            </div>

            {/* TREG */}
            <div class="col-span-1">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                TREG <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData().treg}
                onInput={(e) => handleInputChange('treg', e.currentTarget.value)}
                class={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors().treg ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., TREG-01"
              />
              <Show when={errors().treg}>
                <p class="text-red-500 text-xs mt-1">{errors().treg}</p>
              </Show>
            </div>

            {/* Plan RFS */}
            <div class="col-span-1">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Plan RFS <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData().planRFS}
                onInput={(e) => handleInputChange('planRFS', e.currentTarget.value)}
                class={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors().planRFS ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 2024-12-31"
              />
              <Show when={errors().planRFS}>
                <p class="text-red-500 text-xs mt-1">{errors().planRFS}</p>
              </Show>
            </div>

            {/* Current Milestone */}
            <div class="col-span-1">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Current Milestone <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData().currentMilestone}
                onInput={(e) => handleInputChange('currentMilestone', e.currentTarget.value)}
                class={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors().currentMilestone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Construction"
              />
              <Show when={errors().currentMilestone}>
                <p class="text-red-500 text-xs mt-1">{errors().currentMilestone}</p>
              </Show>
            </div>
          </div>

          {/* Info Box */}
          <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-sm text-blue-800">
              <strong>Note:</strong> All fields marked with <span class="text-red-500">*</span> are required.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={props.onClose}
            class="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            class="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 font-medium transition-all shadow-lg hover:shadow-xl"
          >
            {isEditMode() ? '💾 Update Project' : '➕ Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
