import { createSignal, Show, For } from 'solid-js';
import { EnhancedKmlConverter } from '../services/EnhancedKmlConverter';
import type { CableFeatureCollection, KMLFileData } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (files: KMLFileData[]) => void;
}

interface FilePreview {
  file: File;
  data: CableFeatureCollection | null;
  error: string | null;
  isConverting: boolean;
}

export function UploadModal(props: UploadModalProps) {
  const [isDragging, setIsDragging] = createSignal(false);
  const [selectedFiles, setSelectedFiles] = createSignal<FilePreview[]>([]);
  const [globalError, setGlobalError] = createSignal<string | null>(null);
  let fileInputRef: HTMLInputElement | undefined;

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await processFiles(Array.from(files));
    }
  };

  const handleFileSelect = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      await processFiles(Array.from(files));
    }
  };

  const processFiles = async (files: File[]) => {
    setGlobalError(null);
    
    // Validate all files first
    const validFiles: File[] = [];
    for (const file of files) {
      // Validate file type
      if (!file.name.endsWith('.kml')) {
        setGlobalError(`${file.name}: Please upload valid KML files only`);
        continue;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setGlobalError(`${file.name}: File is too large. Maximum size is 10MB.`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length === 0) {
      return;
    }

    // Create preview entries for all valid files
    const previews: FilePreview[] = validFiles.map(file => ({
      file,
      data: null,
      error: null,
      isConverting: true
    }));
    
    setSelectedFiles(previews);

    // Process each file
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      
      try {
        // Read file content
        const content = await file.text();
        console.log(`Processing ${file.name}, content length:`, content.length);
        
        // Convert KML to GeoJSON with Enhanced Converter
        const geoJsonData = EnhancedKmlConverter.convertKmlToGeoJson(content);
        console.log(`✓ ${file.name} conversion successful!`);
        console.log('  - Features:', geoJsonData.features.length);
        
        // Log segment information
        const totalSegments = geoJsonData.features.reduce((sum, f) => sum + (f.properties.segments?.length || 0), 0);
        const totalDistance = geoJsonData.features.reduce((sum, f) => sum + (f.properties.totalDistance || 0), 0);
        console.log('  - Total segments:', totalSegments);
        console.log('  - Total distance:', (totalDistance / 1000).toFixed(2), 'km');
        
        if (geoJsonData.features.length === 0) {
          setSelectedFiles(prev => prev.map((p, idx) => 
            idx === i ? { ...p, error: 'No cable routes found in KML file', isConverting: false } : p
          ));
          continue;
        }

        // Update preview with successful data
        setSelectedFiles(prev => prev.map((p, idx) => 
          idx === i ? { ...p, data: geoJsonData, isConverting: false } : p
        ));
      } catch (err) {
        console.error(`Error processing ${file.name}:`, err);
        const errorMsg = err instanceof Error ? err.message : 'Failed to convert KML file';
        setSelectedFiles(prev => prev.map((p, idx) => 
          idx === i ? { ...p, error: errorMsg, isConverting: false } : p
        ));
      }
    }
  };

  const handleConfirmUpload = () => {
    const previews = selectedFiles();
    const successfulFiles = previews.filter(p => p.data !== null);
    
    if (successfulFiles.length === 0) {
      setGlobalError('No valid KML files to upload');
      return;
    }
    
    console.log('Upload confirmed,', successfulFiles.length, 'files ready');
    
    // Convert to KMLFileData format
    const kmlFiles: KMLFileData[] = successfulFiles.map((preview, index) => ({
      id: `kml-${Date.now()}-${index}`,
      fileName: preview.file.name,
      fileSize: preview.file.size,
      data: preview.data!,
      uploadDate: new Date().toISOString()
    }));
    
    props.onUploadSuccess(kmlFiles);
    handleClose();
  };

  const handleClose = () => {
    console.log('Modal closing, resetting state');
    setSelectedFiles([]);
    setGlobalError(null);
    setIsDragging(false);
    props.onClose();
  };

  const handleBrowseClick = () => {
    fileInputRef?.click();
  };
  
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const hasValidFiles = () => {
    return selectedFiles().some(p => p.data !== null);
  };
  
  const isAnyConverting = () => {
    return selectedFiles().some(p => p.isConverting);
  };

  return (
    <Show when={props.isOpen}>
      <div 
        class="fixed top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000] animate-[fadeIn_0.2s_ease-in]" 
        onClick={handleClose}
        style={{"font-family": "'Poppins', sans-serif"}}
      >
        <div 
          class="bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-[90%] max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col animate-[slideUp_0.3s_ease-out]" 
          onClick={(e) => e.stopPropagation()}
        >
          <div class="flex items-center justify-between px-7 py-6 border-b border-gray-200">
            <h2 class="text-2xl font-bold text-gray-800 m-0 tracking-[-0.5px]">Upload KML Files</h2>
            <button 
              class="bg-gray-100 hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-600 hover:text-red-500 w-9 h-9 rounded-[10px] cursor-pointer text-xl flex items-center justify-center transition-all duration-200 hover:scale-105" 
              onClick={handleClose}
            >
              ✕
            </button>
          </div>

          <div class="flex-1 p-7 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded">
            {/* Upload Zone - Show when no files selected */}
            <Show when={selectedFiles().length === 0}>
              <div
                class={`border-2 border-dashed rounded-2xl px-8 py-12 text-center transition-all duration-300 cursor-pointer ${
                  isDragging() 
                    ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                    : 'border-gray-300 bg-gray-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div class="text-[64px] mb-4" style={{"filter": "drop-shadow(0 4px 12px rgba(59, 130, 246, 0.2))"}}>📁</div>
                <h3 class="text-xl font-semibold text-gray-800 m-0 mb-2">Drag & Drop KML Files</h3>
                <p class="text-sm text-gray-500 my-3">or</p>
                <button 
                  class="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl text-base font-semibold cursor-pointer border-none transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)] hover:scale-105" 
                  onClick={handleBrowseClick}
                >
                  Browse Files
                </button>
                <p class="text-xs text-gray-400 mt-3 mb-0">Supports multiple .kml files, up to 10MB each</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".kml"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </div>
            </Show>

            {/* File List - Show when files are selected */}
            <Show when={selectedFiles().length > 0}>
              <div class="space-y-4">
                {/* Global Error Message */}
                <Show when={globalError()}>
                  <div class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <div class="text-xl">⚠️</div>
                    <div class="flex-1">
                      <p class="text-sm text-red-700 m-0">{globalError()}</p>
                    </div>
                  </div>
                </Show>

                {/* File Preview Cards */}
                <For each={selectedFiles()}>
                  {(preview, index) => (
                    <div class="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                      {/* File Header */}
                      <div class="flex items-start justify-between gap-4 mb-4">
                        <div class="flex items-center gap-3 flex-1 min-w-0">
                          <div class="text-[32px]">
                            {preview.isConverting ? '⏳' : preview.error ? '❌' : '✅'}
                          </div>
                          <div class="flex-1 min-w-0">
                            <h4 class="text-base font-semibold text-gray-800 m-0 mb-1 truncate" title={preview.file.name}>
                              {preview.file.name}
                            </h4>
                            <p class="text-sm text-gray-500 m-0">
                              {((preview.file.size) / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button 
                          class="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                          onClick={() => handleRemoveFile(index())}
                        >
                          Remove
                        </button>
                      </div>

                      {/* Loading State */}
                      <Show when={preview.isConverting}>
                        <div class="text-center py-4">
                          <div class="inline-block w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-2"></div>
                          <p class="text-sm text-gray-600 m-0">Converting...</p>
                        </div>
                      </Show>

                      {/* Error State */}
                      <Show when={preview.error}>
                        <div class="bg-red-50 border border-red-200 rounded-xl p-3">
                          <p class="text-sm text-red-700 m-0">{preview.error}</p>
                        </div>
                      </Show>

                      {/* Success State - Show Stats */}
                      <Show when={preview.data && !preview.isConverting}>
                        <div class="grid grid-cols-2 gap-2">
                          <div class="bg-white rounded-xl p-3 border border-blue-200">
                            <p class="text-xs font-medium text-blue-600 uppercase tracking-wide m-0 mb-1">Routes</p>
                            <p class="text-lg font-bold text-blue-900 m-0">{preview.data!.features.length}</p>
                          </div>
                          <div class="bg-white rounded-xl p-3 border border-purple-200">
                            <p class="text-xs font-medium text-purple-600 uppercase tracking-wide m-0 mb-1">Points</p>
                            <p class="text-lg font-bold text-purple-900 m-0">
                              {preview.data!.features.reduce((sum, f) => 
                                sum + (f.geometry.type === 'LineString' ? f.geometry.coordinates.length : 1), 0
                              )}
                            </p>
                          </div>
                          <div class="bg-white rounded-xl p-3 border border-green-200">
                            <p class="text-xs font-medium text-green-600 uppercase tracking-wide m-0 mb-1">Segments</p>
                            <p class="text-lg font-bold text-green-900 m-0">
                              {preview.data!.features.reduce((sum, f) => 
                                sum + (f.properties.segments?.length || 0), 0
                              )}
                            </p>
                          </div>
                          <div class="bg-white rounded-xl p-3 border border-orange-200">
                            <p class="text-xs font-medium text-orange-600 uppercase tracking-wide m-0 mb-1">Distance</p>
                            <p class="text-lg font-bold text-orange-900 m-0">
                              {(() => {
                                const totalDist = preview.data!.features.reduce((sum, f) => 
                                  sum + (f.properties.totalDistance || 0), 0
                                );
                                return totalDist >= 1000 
                                  ? `${(totalDist / 1000).toFixed(2)} km`
                                  : `${totalDist.toFixed(0)} m`;
                              })()}
                            </p>
                          </div>
                        </div>
                      </Show>
                    </div>
                  )}
                </For>

                {/* Add More Files Button */}
                <button
                  class="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer bg-transparent text-sm font-medium"
                  onClick={handleBrowseClick}
                >
                  + Add More KML Files
                </button>
              </div>
            </Show>
          </div>

          {/* Footer Actions */}
          <Show when={selectedFiles().length > 0}>
            <div class="flex items-center justify-between gap-3 px-7 py-5 border-t border-gray-200 bg-gray-50">
              <div class="text-sm text-gray-600">
                {selectedFiles().filter(p => p.data !== null).length} of {selectedFiles().length} files ready
              </div>
              <div class="flex gap-3">
                <button 
                  class="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-100" 
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button 
                  class="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer border-none transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                  onClick={handleConfirmUpload}
                  disabled={!hasValidFiles() || isAnyConverting()}
                >
                  Load to Map ({selectedFiles().filter(p => p.data !== null).length})
                </button>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
}
