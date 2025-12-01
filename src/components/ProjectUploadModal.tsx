/**
 * ProjectUploadModal Component
 * Unified modal for uploading both KML and BOQ files as a project
 */

import { createSignal, Show } from 'solid-js';
import type { ProjectData } from '../types';
import { convertKmlToGeoJson } from '../services/EnhancedKmlConverter';
import { BoQConverter } from '../services/BoQConverter';
import { createProjectFromUpload } from '../services/ProjectLoader';

export interface ProjectUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (projects: ProjectData[]) => void;
}

export function ProjectUploadModal(props: ProjectUploadModalProps) {
  const [projectName, setProjectName] = createSignal('');
  const [projectCode, setProjectCode] = createSignal('');
  const [kmlFile, setKmlFile] = createSignal<File | null>(null);
  const [boqFile, setBoqFile] = createSignal<File | null>(null);
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [uploadProgress, setUploadProgress] = createSignal<string>('');

  const resetForm = () => {
    setProjectName('');
    setProjectCode('');
    setKmlFile(null);
    setBoqFile(null);
    setError(null);
    setUploadProgress('');
  };

  const handleClose = () => {
    if (!isProcessing()) {
      resetForm();
      props.onClose();
    }
  };

  const handleKmlFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      // Validate file type
      const validExtensions = ['.kml', '.json', '.geojson'];
      const fileName = file.name.toLowerCase();
      const isValid = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isValid) {
        setError('Please select a valid KML, JSON, or GeoJSON file');
        return;
      }
      
      setKmlFile(file);
      setError(null);
      
      // Auto-generate project name from filename if not set
      if (!projectName()) {
        const name = file.name.replace(/\.(kml|json|geojson)$/i, '').toUpperCase();
        setProjectName(`RMJ-${name}`);
      }
    }
  };

  const handleBoqFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      // Validate file type
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileName = file.name.toLowerCase();
      const isValid = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isValid) {
        setError('Please select a valid Excel or CSV file');
        return;
      }
      
      setBoqFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!projectName().trim()) {
      setError('Project name is required');
      return;
    }
    
    if (!projectCode().trim()) {
      setError('Project code is required');
      return;
    }
    
    if (!kmlFile()) {
      setError('KML file is required');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Process KML file
      setUploadProgress('Processing KML file...');
      const kmlText = await kmlFile()!.text();
      const kmlData = convertKmlToGeoJson(kmlText);
      
      if (!kmlData || kmlData.features.length === 0) {
        throw new Error('KML file contains no valid data');
      }
      
      // Process BOQ file if provided
      let boqData = null;
      if (boqFile()) {
        setUploadProgress('Processing BOQ file...');
        boqData = await BoQConverter.convertExcelToBoQ(boqFile()!);
      }
      
      // Create project
      setUploadProgress('Creating project...');
      const project = createProjectFromUpload(
        projectName(),
        projectCode(),
        kmlFile()!,
        kmlData,
        boqFile() || undefined,
        boqData || undefined
      );
      
      // Success
      setUploadProgress('Upload complete!');
      setTimeout(() => {
        props.onUploadSuccess([project]);
        setIsProcessing(false);
        resetForm();
        props.onClose();
      }, 500);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      setIsProcessing(false);
      setUploadProgress('');
    }
  };

  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 z-[1002] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          class="absolute inset-0 bg-black/50 animate-[fadeIn_0.2s_ease]"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-800">Upload New Project</h2>
            <button
              onClick={handleClose}
              disabled={isProcessing()}
              class="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              title="Close"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} class="p-6 space-y-6">
            {/* Project Information */}
            <div class="space-y-4">
              <h3 class="text-sm font-medium text-gray-700">Project Information</h3>
              
              <div>
                <label for="project-name" class="block text-sm font-medium text-gray-600 mb-1">
                  Project Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={projectName()}
                  onInput={(e) => setProjectName(e.currentTarget.value)}
                  placeholder="e.g., RMJ-MONAS-DKI"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isProcessing()}
                  required
                />
              </div>

              <div>
                <label for="project-code" class="block text-sm font-medium text-gray-600 mb-1">
                  Project Code <span class="text-red-500">*</span>
                </label>
                <input
                  id="project-code"
                  type="text"
                  value={projectCode()}
                  onInput={(e) => setProjectCode(e.currentTarget.value)}
                  placeholder="e.g., RMJ-MONAS-001"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isProcessing()}
                  required
                />
              </div>
            </div>

            {/* File Uploads */}
            <div class="space-y-4">
              <h3 class="text-sm font-medium text-gray-700">Project Files</h3>
              
              {/* KML File */}
              <div>
                <label for="kml-file" class="block text-sm font-medium text-gray-600 mb-1">
                  KML File <span class="text-red-500">*</span>
                </label>
                <div class="mt-1 flex items-center gap-3">
                  <label
                    for="kml-file"
                    class="flex-1 px-4 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-green-500 transition-colors cursor-pointer"
                  >
                    <input
                      id="kml-file"
                      type="file"
                      accept=".kml,.json,.geojson"
                      onChange={handleKmlFileChange}
                      disabled={isProcessing()}
                      class="hidden"
                    />
                    <div class="text-center">
                      {kmlFile() ? (
                        <div class="text-sm">
                          <span class="text-green-600 font-medium">✓</span> {kmlFile()!.name}
                          <span class="text-gray-500 ml-2">({(kmlFile()!.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      ) : (
                        <div class="text-sm text-gray-500">
                          Click to select KML/GeoJSON file
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* BOQ File */}
              <div>
                <label for="boq-file" class="block text-sm font-medium text-gray-600 mb-1">
                  BOQ File (Optional)
                </label>
                <div class="mt-1 flex items-center gap-3">
                  <label
                    for="boq-file"
                    class="flex-1 px-4 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-green-500 transition-colors cursor-pointer"
                  >
                    <input
                      id="boq-file"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleBoqFileChange}
                      disabled={isProcessing()}
                      class="hidden"
                    />
                    <div class="text-center">
                      {boqFile() ? (
                        <div class="text-sm">
                          <span class="text-green-600 font-medium">✓</span> {boqFile()!.name}
                          <span class="text-gray-500 ml-2">({(boqFile()!.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      ) : (
                        <div class="text-sm text-gray-500">
                          Click to select Excel/CSV file
                        </div>
                      )}
                    </div>
                  </label>
                  {boqFile() && (
                    <button
                      type="button"
                      onClick={() => setBoqFile(null)}
                      disabled={isProcessing()}
                      class="px-3 py-2 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            <Show when={error()}>
              <div class="p-3 bg-red-50 border border-red-200 rounded-md">
                <p class="text-sm text-red-600">{error()}</p>
              </div>
            </Show>

            {/* Progress Message */}
            <Show when={uploadProgress()}>
              <div class="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p class="text-sm text-blue-600">{uploadProgress()}</p>
              </div>
            </Show>

            {/* Actions */}
            <div class="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isProcessing()}
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing() || !kmlFile()}
                class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing() ? 'Processing...' : 'Upload Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Show>
  );
}
