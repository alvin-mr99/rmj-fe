import { createSignal, Show } from 'solid-js';
import { KmlConverter } from '../services/KmlConverter';
import type { CableFeatureCollection } from '../types';
import './UploadModal.css';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (data: CableFeatureCollection) => void;
}

export function UploadModal(props: UploadModalProps) {
  const [isDragging, setIsDragging] = createSignal(false);
  const [selectedFile, setSelectedFile] = createSignal<File | null>(null);
  const [previewData, setPreviewData] = createSignal<CableFeatureCollection | null>(null);
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
    if (!file.name.endsWith('.kml')) {
      setError('Please upload a valid KML file');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }

    setSelectedFile(file);
    setIsConverting(true);

    try {
      // Read file content
      const content = await file.text();
      console.log('File content loaded, length:', content.length);
      
      // Convert KML to GeoJSON
      console.log('Converting KML to GeoJSON...');
      const geoJsonData = KmlConverter.convertKmlToGeoJson(content);
      console.log('Conversion successful, features:', geoJsonData.features.length);
      
      if (geoJsonData.features.length === 0) {
        setError('No cable routes found in KML file');
        setIsConverting(false);
        return;
      }

      setPreviewData(geoJsonData);
      setIsConverting(false);
      console.log('Preview data set');
    } catch (err) {
      console.error('Error during conversion:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to convert KML file';
      setError(errorMsg);
      setIsConverting(false);
      setSelectedFile(null);
    }
  };

  const handleConfirmUpload = () => {
    const data = previewData();
    console.log('Upload confirmed, data:', data);
    if (data) {
      console.log('Calling onUploadSuccess with', data.features.length, 'features');
      props.onUploadSuccess(data);
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

  return (
    <Show when={props.isOpen}>
      <div class="upload-modal-overlay" onClick={handleClose}>
        <div class="upload-modal" onClick={(e) => e.stopPropagation()}>
          <div class="upload-modal-header">
            <h2 class="upload-modal-title">Upload KML File</h2>
            <button class="upload-modal-close" onClick={handleClose}>✕</button>
          </div>

          <div class="upload-modal-content">
            <Show when={!selectedFile()}>
              <div
                class={`upload-dropzone ${isDragging() ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div class="upload-icon">📁</div>
                <h3 class="upload-title">Drag & Drop KML File</h3>
                <p class="upload-subtitle">or</p>
                <button class="upload-browse-btn" onClick={handleBrowseClick}>
                  Browse Files
                </button>
                <p class="upload-hint">Supports .kml files up to 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".kml"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </div>
            </Show>

            <Show when={isConverting()}>
              <div class="upload-converting">
                <div class="upload-spinner"></div>
                <p class="upload-converting-text">Converting KML to GeoJSON...</p>
              </div>
            </Show>

            <Show when={selectedFile() && previewData() && !isConverting()}>
              <div class="upload-preview">
                <div class="preview-header">
                  <div class="preview-file-info">
                    <div class="preview-file-icon">✅</div>
                    <div>
                      <h4 class="preview-file-name">{selectedFile()?.name}</h4>
                      <p class="preview-file-size">
                        {((selectedFile()?.size || 0) / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button 
                    class="preview-change-btn"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewData(null);
                    }}
                  >
                    Change File
                  </button>
                </div>

                <div class="preview-stats">
                  <div class="preview-stat-card">
                    <div class="stat-icon">🗺️</div>
                    <div class="stat-content">
                      <p class="stat-label">Cable Routes</p>
                      <p class="stat-value">{previewData()?.features.length || 0}</p>
                    </div>
                  </div>

                  <div class="preview-stat-card">
                    <div class="stat-icon">📍</div>
                    <div class="stat-content">
                      <p class="stat-label">Total Points</p>
                      <p class="stat-value">
                        {previewData()?.features.reduce((sum, f) => 
                          sum + (f.geometry.coordinates?.length || 0), 0
                        ) || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="preview-details">
                  <h4 class="preview-details-title">Route Details</h4>
                  <div class="preview-routes-list">
                    {previewData()?.features.slice(0, 5).map((feature, index) => (
                      <div class="preview-route-item">
                        <span class="route-number">{index + 1}</span>
                        <div class="route-info">
                          <p class="route-name">{feature.properties.name}</p>
                          <p class="route-meta">
                            {feature.properties.soilType} • {feature.properties.depth}m depth
                          </p>
                        </div>
                      </div>
                    ))}
                    {(previewData()?.features.length || 0) > 5 && (
                      <p class="preview-more">
                        +{(previewData()?.features.length || 0) - 5} more routes
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Show>

            <Show when={error()}>
              <div class="upload-error">
                <div class="error-icon">⚠️</div>
                <p class="error-message">{error()}</p>
                <button 
                  class="error-retry-btn"
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
            <div class="upload-modal-footer">
              <button class="upload-cancel-btn" onClick={handleClose}>
                Cancel
              </button>
              <button class="upload-confirm-btn" onClick={handleConfirmUpload}>
                Load to Map
              </button>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
}
