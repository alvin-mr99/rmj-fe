import { createSignal, Show, For } from 'solid-js';
import { BoQConverter } from '../services/BoQConverter';
import type { BoQFileData, BoQData } from '../types';

interface BoQUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (files: BoQFileData[]) => void;
}

interface FilePreview {
  file: File;
  data: BoQData | null;
  error: string | null;
  isConverting: boolean;
}

export function BoQUploadModal(props: BoQUploadModalProps) {
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
      const validExtensions = ['.xlsx', '.xls'];
      const isValidFile = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (!isValidFile) {
        setGlobalError(`${file.name}: Please upload valid Excel files only (.xlsx or .xls)`);
        continue;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setGlobalError(`${file.name}: File is too large. Maximum size is 5MB.`);
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
        console.log(`Processing ${file.name}, size:`, file.size);
        
        // Convert Excel to BOQ
        const boqData = await BoQConverter.convertExcelToBoQ(file);
        console.log(`✓ ${file.name} conversion successful!`);
        console.log('  - Items:', boqData.items.length);
        console.log('  - Total Cost:', boqData.summary.totalCost);
        
        if (boqData.items.length === 0) {
          setSelectedFiles(prev => prev.map((p, idx) => 
            idx === i ? { ...p, error: 'No BOQ items found in Excel file', isConverting: false } : p
          ));
          continue;
        }

        // Update preview with successful data
        setSelectedFiles(prev => prev.map((p, idx) => 
          idx === i ? { ...p, data: boqData, isConverting: false } : p
        ));
      } catch (err) {
        console.error(`Error processing ${file.name}:`, err);
        let errorMsg = err instanceof Error ? err.message : 'Failed to convert Excel file';
        
        // Make error messages more user-friendly
        if (errorMsg.includes('No valid BOQ items')) {
          errorMsg = 'No BOQ items found. Please ensure your file contains proper BOQ data.';
        } else if (errorMsg.includes('empty or has insufficient data')) {
          errorMsg = 'Excel file is empty or has insufficient data';
        }
        
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
      setGlobalError('No valid BOQ files to upload');
      return;
    }
    
    console.log('Upload confirmed,', successfulFiles.length, 'files ready');
    
    // Convert to BoQFileData format
    const boqFiles: BoQFileData[] = successfulFiles.map((preview, index) => ({
      id: `boq-${Date.now()}-${index}`,
      fileName: preview.file.name,
      fileSize: preview.file.size,
      data: preview.data!,
      uploadDate: new Date().toISOString()
    }));
    
    props.onUploadSuccess(boqFiles);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024).toFixed(2) + ' KB';
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
            <h2 class="text-2xl font-bold text-gray-800 m-0 tracking-[-0.5px]">Upload BOQ Files</h2>
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
                    ? 'border-green-500 bg-green-50 scale-[1.02]' 
                    : 'border-gray-300 bg-gray-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div class="text-[64px] mb-4" style={{"filter": "drop-shadow(0 4px 12px rgba(34, 197, 94, 0.2))"}}>📊</div>
                <h3 class="text-xl font-semibold text-gray-800 m-0 mb-2">Drag & Drop Excel Files</h3>
                <p class="text-sm text-gray-500 my-3">or</p>
                <button 
                  class="bg-gradient-to-br from-green-500 to-green-600 text-white px-8 py-3 rounded-xl text-base font-semibold cursor-pointer border-none transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-[0_4px_12px_rgba(34,197,94,0.4)] hover:scale-105" 
                  onClick={handleBrowseClick}
                >
                  Browse Files
                </button>
                <p class="text-xs text-gray-400 mt-3 mb-0">Supports multiple .xlsx and .xls files, up to 5MB each</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
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
                    <div class="text-[20px] flex-shrink-0">⚠️</div>
                    <p class="text-[13px] text-red-700 m-0 flex-1 whitespace-pre-line">{globalError()}</p>
                  </div>
                </Show>

                {/* File Preview Cards */}
                <For each={selectedFiles()}>
                  {(preview, index) => (
                    <div class="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 relative">
                      {/* Remove Button */}
                      <button
                        class="absolute top-3 right-3 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all duration-200 hover:scale-110 border-none cursor-pointer text-[12px] z-10"
                        onClick={() => handleRemoveFile(index())}
                        title="Remove file"
                      >
                        ✕
                      </button>

                      {/* File Info */}
                      <div class="flex items-start gap-3 mb-3">
                        <div class="text-[32px] flex-shrink-0">📊</div>
                        <div class="flex-1 min-w-0 pr-8">
                          <p class="text-[14px] font-semibold text-gray-800 m-0 truncate" title={preview.file.name}>
                            {preview.file.name}
                          </p>
                          <p class="text-[12px] text-gray-500 m-0 mt-0.5">
                            {formatFileSize(preview.file.size)}
                          </p>
                        </div>
                      </div>

                      {/* Converting State */}
                      <Show when={preview.isConverting}>
                        <div class="flex items-center gap-2 text-gray-600">
                          <div class="w-4 h-4 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
                          <span class="text-[13px]">Converting to BOQ...</span>
                        </div>
                      </Show>

                      {/* Error State */}
                      <Show when={preview.error && !preview.isConverting}>
                        <div class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                          <span class="text-[16px] flex-shrink-0">⚠️</span>
                          <p class="text-[12px] text-red-700 m-0 flex-1 whitespace-pre-line">{preview.error}</p>
                        </div>
                      </Show>

                      {/* Success State with Preview */}
                      <Show when={preview.data && !preview.isConverting}>
                        <div class="space-y-2">
                          <div class="flex items-center gap-2 text-green-600">
                            <span class="text-[16px]">✓</span>
                            <span class="text-[13px] font-semibold">Conversion successful</span>
                          </div>
                          
                          <div class="grid grid-cols-2 gap-2">
                            <div class="bg-white rounded-lg p-2.5 border border-gray-200">
                              <p class="text-[11px] text-gray-500 m-0 mb-0.5">Total Items</p>
                              <p class="text-[16px] font-bold text-gray-800 m-0">{preview.data!.items.length}</p>
                            </div>
                            <div class="bg-white rounded-lg p-2.5 border border-gray-200">
                              <p class="text-[11px] text-gray-500 m-0 mb-0.5">Total Cost</p>
                              <p class="text-[13px] font-bold text-green-600 m-0">
                                {formatCurrency(preview.data!.summary.totalCost)}
                              </p>
                            </div>
                          </div>

                          <Show when={preview.data!.projectName || preview.data!.projectCode}>
                            <div class="bg-blue-50 rounded-lg p-2.5 border border-blue-200">
                              <Show when={preview.data!.projectName}>
                                <p class="text-[11px] text-gray-600 m-0">
                                  <span class="font-semibold">Project:</span> {preview.data!.projectName}
                                </p>
                              </Show>
                              <Show when={preview.data!.projectCode}>
                                <p class="text-[11px] text-gray-600 m-0">
                                  <span class="font-semibold">Code:</span> {preview.data!.projectCode}
                                </p>
                              </Show>
                            </div>
                          </Show>
                        </div>
                      </Show>
                    </div>
                  )}
                </For>

                {/* Add More Files Button */}
                <button
                  class="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-gray-600 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all duration-200 cursor-pointer bg-transparent text-sm font-medium"
                  onClick={handleBrowseClick}
                >
                  + Add More BOQ Files
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
                  class="bg-gradient-to-br from-green-500 to-green-600 text-white px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer border-none transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-[0_4px_12px_rgba(34,197,94,0.4)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                  onClick={handleConfirmUpload}
                  disabled={!hasValidFiles() || isAnyConverting()}
                >
                  Load to App ({selectedFiles().filter(p => p.data !== null).length})
                </button>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
}
