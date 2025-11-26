import { Show } from 'solid-js';
import type { PopupProps } from '../types';
import type { CableProperties, MarkerProperties } from '../types';
import './PopupComponent.css';

/**
 * PopupComponent
 * 
 * Displays detailed information about cable routes and markers in an interactive popup.
 * Shows soil type, depth, and coordinates with proper formatting.
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
   * Get properties from feature (handles both cable and marker features)
   */
  const getProperties = (): CableProperties | MarkerProperties => {
    return props.feature.properties as CableProperties | MarkerProperties;
  };

  const properties = getProperties();

  return (
    <div class="popup-container">
      <div class="popup-content">
        {/* Close button - Requirement: 4.1, 4.2 */}
        <button 
          class="popup-close-button"
          onClick={() => props.onClose()}
          aria-label="Close popup"
        >
          ×
        </button>

        {/* Popup header */}
        <div class="popup-header">
          <h3 class="popup-title">Cable Information</h3>
        </div>

        {/* Popup body with information - Requirements: 4.1, 4.2 */}
        <div class="popup-body">
          {/* Soil Type */}
          <div class="popup-field">
            <span class="popup-label">Soil Type:</span>
            <span class="popup-value">{properties.soilType}</span>
          </div>

          {/* Depth - Requirement: 4.4 */}
          <div class="popup-field">
            <span class="popup-label">Depth:</span>
            <span class="popup-value">{formatDepth(properties.depth)}</span>
          </div>

          {/* Coordinates - Requirement: 4.3 */}
          <div class="popup-field">
            <span class="popup-label">Coordinates:</span>
            <span class="popup-value">{formatCoordinates(props.coordinates)}</span>
          </div>

          {/* Additional info for markers */}
          <Show when={'distanceFromStart' in properties}>
            <div class="popup-field">
              <span class="popup-label">Distance from Start:</span>
              <span class="popup-value">
                {((properties as MarkerProperties).distanceFromStart).toFixed(2)} m
              </span>
            </div>
          </Show>

          {/* Additional info for cables */}
          <Show when={'name' in properties && (properties as CableProperties).name}>
            <div class="popup-field">
              <span class="popup-label">Route Name:</span>
              <span class="popup-value">{(properties as CableProperties).name}</span>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
