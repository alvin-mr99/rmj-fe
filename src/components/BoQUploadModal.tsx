import { createSignal, Show } from 'solid-js';
import { BoQConverter } from '../services/BoQConverter';
import type { BoQData, BoQItem } from '../types';

interface BoQUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (data: BoQData, fileName?: string, fileSize?: number) => void;
}

export function BoQUploadModal(props: BoQUploadModalProps) {
  const [isDragging, setIsDragging] = createSignal(false);
  const [selectedFile, setSelectedFile] = createSignal<File | null>(null);
  const [previewData, setPreviewData] = createSignal<BoQData | null>(null);
  const [isConverting, setIsConverting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
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
      await processFile(files[0]);
    }
  };

  const handleFileSelect = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    
    // Validate file type
    const validExtensions = ['.xlsx', '.xls'];
    const isValidFile = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidFile) {
      setError('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File is too large. Maximum size is 5MB.');
      return;
    }

    setSelectedFile(file);
    setIsConverting(true);

    try {
      console.log('Converting Excel to BOQ data...');
      console.log('File:', file.name, 'Size:', file.size);
      const boqData = await BoQConverter.convertExcelToBoQ(file);
      console.log('Conversion successful!');
      console.log('- Items:', boqData.items.length);
      console.log('- Total Cost:', boqData.summary.totalCost);
      
      if (boqData.items.length === 0) {
        setError('No BOQ items found in Excel file. Please check the file format.');
        setIsConverting(false);
        return;
      }

      setPreviewData(boqData);
      setIsConverting(false);
      console.log('Preview data set');
    } catch (err) {
      console.error('Error during conversion:', err);
      let errorMsg = 'Failed to convert Excel file';
      
      if (err instanceof Error) {
        errorMsg = err.message;
        
        // Make error messages more user-friendly
        if (errorMsg.includes('No valid BOQ items')) {
          errorMsg = 'No BOQ items found in Excel file. Please ensure your file contains:\n• A header row with columns like "Description" or "Uraian"\n• At least one data row with item description';
        } else if (errorMsg.includes('empty or has insufficient data')) {
          errorMsg = 'Excel file is empty or has insufficient data';
        }
      }
      
      setError(errorMsg);
      setIsConverting(false);
      setSelectedFile(null);
    }
  };

  const handleConfirmUpload = () => {
    const data = previewData();
    const file = selectedFile();
    console.log('Upload confirmed, data:', data);
    if (data && file) {
      console.log('Calling onUploadSuccess with', data.items.length, 'items');
      props.onUploadSuccess(data, file.name, file.size);
      handleClose();
    }
  };

  const handleClose = () => {
    console.log('Modal closing, resetting state');
    setSelectedFile(null);
    setPreviewData(null);
    setError(null);
    setIsConverting(false);
    setIsDragging(false);
    props.onClose();
  };

  const handleBrowseClick = () => {
    fileInputRef?.click();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
            <div>
              <h2 class="text-2xl font-bold text-gray-800 m-0 tracking-[-0.5px]">Upload BOQ File</h2>
              <p class="text-sm text-gray-500 mt-1 mb-0">Bill of Quantity Excel File</p>
            </div>
            <button 
              class="bg-gray-100 hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-600 hover:text-red-500 w-9 h-9 rounded-[10px] cursor-pointer text-xl flex items-center justify-center transition-all duration-200 hover:scale-105" 
              onClick={handleClose}
            >
              ✕
            </button>
          </div>

          <div class="flex-1 p-7 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded">
            <Show when={!selectedFile()}>
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
                <h3 class="text-xl font-semibold text-gray-800 m-0 mb-2">Drag & Drop Excel File</h3>
                <p class="text-sm text-gray-500 my-3">or</p>
                <button 
                  class="bg-gradient-to-br from-green-500 to-green-600 text-white px-8 py-3 rounded-xl text-base font-semibold cursor-pointer border-none transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-[0_4px_12px_rgba(34,197,94,0.4)] hover:scale-105" 
                  onClick={handleBrowseClick}
                >
                  Browse Files
                </button>
                <p class="text-xs text-gray-400 mt-3 mb-0">Supports .xlsx and .xls files up to 5MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </div>
            </Show>

            <Show when={isConverting()}>
              <div class="text-center py-12">
                <div class="inline-block w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mb-4"></div>
                <p class="text-gray-600 text-base m-0">Converting Excel to BOQ...</p>
              </div>
            </Show>

            <Show when={selectedFile() && previewData() && !isConverting()}>
              <div>
                <div class="bg-gray-50 rounded-2xl p-5 mb-4 border border-gray-200 flex items-start justify-between gap-4 flex-wrap">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="text-[32px]">✅</div>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-base font-semibold text-gray-800 m-0 mb-1 truncate">{selectedFile()?.name}</h4>
                      <p class="text-sm text-gray-500 m-0">
                        {((selectedFile()?.size || 0) / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button 
                    class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-100"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewData(null);
                    }}
                  >
                    Change File
                  </button>
                </div>

                <div class="grid grid-cols-2 gap-3 mb-4">
                  <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200 flex items-center gap-3">
                    <div class="text-2xl">📋</div>
                    <div>
                      <p class="text-xs font-medium text-green-600 uppercase tracking-wide m-0 mb-1">Total Items</p>
                      <p class="text-2xl font-bold text-green-900 m-0">{previewData()?.items.length || 0}</p>
                    </div>
                  </div>

                  <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200 flex items-center gap-3">
                    <div class="text-2xl">💰</div>
                    <div>
                      <p class="text-xs font-medium text-blue-600 uppercase tracking-wide m-0 mb-1">Total Cost</p>
                      <p class="text-xl font-bold text-blue-900 m-0">
                        {formatCurrency(previewData()?.summary.totalCost || 0).replace('Rp', 'Rp ')}
                      </p>
                    </div>
                  </div>

                  <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200 flex items-center gap-3">
                    <div class="text-2xl">⚡</div>
                    <div>
                      <p class="text-xs font-medium text-purple-600 uppercase tracking-wide m-0 mb-1">Material Cost</p>
                      <p class="text-lg font-bold text-purple-900 m-0">
                        {formatCurrency(previewData()?.summary.materialCost || 0).replace('Rp', 'Rp ')}
                      </p>
                    </div>
                  </div>

                  <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200 flex items-center gap-3">
                    <div class="text-2xl">👷</div>
                    <div>
                      <p class="text-xs font-medium text-orange-600 uppercase tracking-wide m-0 mb-1">Labor Cost</p>
                      <p class="text-lg font-bold text-orange-900 m-0">
                        {formatCurrency(previewData()?.summary.laborCost || 0).replace('Rp', 'Rp ')}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                  <h4 class="text-base font-semibold text-gray-800 m-0 mb-4 pb-3 border-b border-gray-200">BOQ Items Preview</h4>
                  <div class="flex flex-col gap-2 max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded">
                    {previewData()?.items.slice(0, 10).map((item: BoQItem, index: number) => (
                      <div class="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-200 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm">
                        <span class="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-gray-800 m-0 mb-0.5 truncate">{item.description}</p>
                          <p class="text-xs text-gray-500 m-0">
                            {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.totalPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(previewData()?.items.length || 0) > 10 && (
                      <p class="text-sm text-center text-gray-500 italic m-0 mt-2">
                        +{(previewData()?.items.length || 0) - 10} more items
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Show>

            <Show when={error()}>
              <div class="text-center py-8 px-4">
                <div class="text-[64px] mb-4" style={{"filter": "drop-shadow(0 4px 12px rgba(239, 68, 68, 0.2))"}}>⚠️</div>
                <p class="text-gray-700 text-base mb-6 whitespace-pre-line">{error()}</p>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                  <p class="text-sm font-semibold text-blue-800 mb-2">💡 Tips:</p>
                  <ul class="text-sm text-blue-700 text-left list-disc list-inside space-y-1 m-0">
                    <li>Ensure your Excel has a header row</li>
                    <li>Column names should include: "Description" / "Uraian"</li>
                    <li>Optional columns: "No", "Unit", "Quantity", "Price"</li>
                    <li>Data should start from the row after headers</li>
                  </ul>
                </div>
                <button 
                  class="bg-gradient-to-br from-red-500 to-red-600 text-white px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer border-none transition-all duration-200 hover:from-red-600 hover:to-red-700 hover:scale-105"
                  onClick={() => {
                    setError(null);
                    setSelectedFile(null);
                  }}
                >
                  Try Again
                </button>
              </div>
            </Show>
          </div>

          <Show when={previewData() && !isConverting()}>
            <div class="flex items-center justify-end gap-3 px-7 py-5 border-t border-gray-200 bg-gray-50">
              <button 
                class="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-100" 
                onClick={handleClose}
              >
                Cancel
              </button>
              <button 
                class="bg-gradient-to-br from-green-500 to-green-600 text-white px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer border-none transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-[0_4px_12px_rgba(34,197,94,0.4)] hover:scale-105" 
                onClick={handleConfirmUpload}
              >
                Load BOQ Data
              </button>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
}
