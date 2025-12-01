import { Show } from 'solid-js';
import type { PopupProps } from '../types';
import type { CableProperties, MarkerProperties } from '../types';

/**
 * PopupComponent
 * 
 * Displays detailed information about cable routes and markers in an interactive popup.
 * Shows soil type, depth, and coordinates with proper formatting.
 * Size scales with map zoom level.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export function PopupComponent(props: PopupProps) {
  /**
   * Format coordinates with at least 6 decimal places
   * Requirement: 4.3
   */
  const formatCoordinates = (coords: [number, number]): string => {
    const [lng, lat] = coords;
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  /**
   * Format depth with unit indicator
   * Requirement: 4.4
   */
  const formatDepth = (depth: number): string => {
    return `${depth.toFixed(2)} m`;
  };

  /**
   * Format distance
   */
  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${(distance * 100).toFixed(0)} cm`;
    } else if (distance < 1000) {
      return `${distance.toFixed(2)} m`;
    } else {
      return `${(distance / 1000).toFixed(2)} km`;
    }
  };

  /**
   * Get properties from feature (handles both cable and marker features)
   */
  const getProperties = (): CableProperties | MarkerProperties => {
    return props.feature.properties as CableProperties | MarkerProperties;
  };

  const properties = getProperties();

  return (
    <div class="relative bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] overflow-hidden w-[320px] z-[1000] pointer-events-auto" style={{"font-family": "'Poppins', sans-serif"}}>
      {/* Header with branding */}
      <div class="relative bg-white px-6 pt-5 pb-4 border-b border-gray-100">
        {/* Title */}
        <h3 class="m-0 text-[22px] font-bold text-gray-900 leading-tight">Point Information</h3>
        
        {/* Close button */}
        <button 
          class="absolute top-4 right-4 bg-blue-500 text-white w-9 h-9 flex items-center justify-center transition-all duration-200 rounded-lg hover:bg-blue-600 active:bg-blue-700 border-none text-lg font-bold"
          onClick={() => props.onClose()}
          aria-label="Close popup"
        >
          ✕
        </button>
      </div>

      {/* Content body */}
      <div class="px-6 py-5">
        <div class="flex flex-col gap-4">
          {/* Soil Type */}
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Soil Type:</span>
            </div>
            <span class="text-[17px] font-medium text-gray-900">{properties.soilType}</span>
          </div>

          {/* Depth */}
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Depth:</span>
            </div>
            <span class="text-[17px] font-medium text-gray-900">{formatDepth(properties.depth)}</span>
          </div>

          {/* Coordinates */}
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Coordinates:</span>
            </div>
            <span class="text-[15px] font-medium text-gray-900 font-mono">{formatCoordinates(props.coordinates)}</span>
          </div>

          {/* Distance from Start (for markers) */}
          <Show when={'distanceFromStart' in properties}>
            <div class="flex flex-col">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Distance:</span>
              </div>
              <span class="text-[17px] font-medium text-gray-900">
                {((properties as MarkerProperties).distanceFromStart).toFixed(2)} m
              </span>
            </div>
          </Show>

          {/* Route Name */}
          <Show when={'name' in properties && (properties as CableProperties).name}>
            <div class="flex flex-col">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Route Name:</span>
              </div>
              <span class="text-[17px] font-medium text-gray-900">{(properties as CableProperties).name}</span>
            </div>
          </Show>

          {/* Total Distance (for cable routes with segments) */}
          <Show when={'totalDistance' in properties && typeof (properties as CableProperties).totalDistance === 'number'}>
            <div class="flex flex-col">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Total Distance:</span>
              </div>
              <span class="text-[17px] font-medium text-gray-900">
                {formatDistance((properties as CableProperties).totalDistance!)}
              </span>
            </div>
          </Show>

          {/* Number of Segments */}
          <Show when={'segments' in properties && Array.isArray((properties as CableProperties).segments) && (properties as CableProperties).segments!.length > 0}>
            <div class="flex flex-col">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Segments:</span>
              </div>
              <span class="text-[17px] font-medium text-gray-900">
                {(properties as CableProperties).segments!.length} segments
              </span>
            </div>
          </Show>

          {/* Style Information */}
          <Show when={'style' in properties && (properties as CableProperties).style}>
            <div class="flex flex-col">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Style:</span>
              </div>
              <div class="flex gap-2 items-center">
                <Show when={(properties as CableProperties).style?.lineColor}>
                  <div 
                    class="w-8 h-3 rounded border border-gray-300" 
                    style={{ 'background-color': (properties as CableProperties).style?.lineColor }}
                  />
                  <span class="text-[14px] text-gray-700">
                    Width: {(properties as CableProperties).style?.lineWidth || 'default'}
                  </span>
                </Show>
              </div>
            </div>
          </Show>

          {/* Metadata Description */}
          <Show when={'metadata' in properties && (properties as CableProperties).metadata?.description}>
            <div class="flex flex-col">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Description:</span>
              </div>
              <span class="text-[14px] text-gray-700 leading-relaxed">
                {(properties as CableProperties).metadata!.description}
              </span>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
