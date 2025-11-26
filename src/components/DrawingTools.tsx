import { createEffect, onCleanup } from 'solid-js';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import type { DrawingToolsProps } from '../types';
import type maplibregl from 'maplibre-gl';

/**
 * DrawingTools Component
 * 
 * Integrates MapLibre GL Draw for drawing new cable routes on the map.
 * Handles drawing mode activation, geometry capture, and validation.
 * 
 * Requirements: 7.1, 7.2, 7.3, 8.5
 */
export interface DrawingToolsComponentProps extends DrawingToolsProps {
  map: maplibregl.Map | null;
}

export function DrawingTools(props: DrawingToolsComponentProps) {
  let draw: MapboxDraw | null = null;

  createEffect(() => {
    const map = props.map;
    
    if (!map) return;

    try {
      // Initialize MapLibre GL Draw - Requirement 7.1
      // Graceful degradation for optional feature - Requirement 8.5
      if (!draw) {
        draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            line_string: true,
            trash: true
          },
          defaultMode: 'simple_select'
        });

        // Add draw control to map
        map.addControl(draw as any, 'top-left');

        // Listen for draw.create event - Requirement 7.2
        map.on('draw.create', handleDrawCreate);
      }

      // Enable/disable drawing mode based on isActive prop - Requirement 7.1
      if (props.isActive && draw) {
        draw.changeMode('draw_line_string');
      } else if (!props.isActive && draw) {
        draw.changeMode('simple_select');
        // Clear any existing drawings
        draw.deleteAll();
      }
    } catch (error) {
      // Graceful degradation for optional drawing feature - Requirement 8.5
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error initializing drawing tools:', errorMsg);
      console.warn('Drawing tools are unavailable. Core map functionality will continue to work.');
    }
  });

  /**
   * Handle drawing completion
   * Requirements: 7.2, 7.3, 8.5
   */
  const handleDrawCreate = (e: any) => {
    if (!draw) return;

    try {
      const features = e.features;
      if (!features || features.length === 0) return;

      const feature = features[0];

      // Validate geometry has at least 2 points - Requirement 7.2
      if (feature.geometry.type !== 'LineString' || 
          feature.geometry.coordinates.length < 2) {
        console.error('Invalid geometry: LineString must have at least 2 points');
        draw.delete(feature.id);
        return;
      }

      // Validate coordinates are valid numbers
      for (const coord of feature.geometry.coordinates) {
        if (!Array.isArray(coord) || coord.length < 2 || 
            isNaN(coord[0]) || isNaN(coord[1])) {
          console.error('Invalid coordinates in drawn geometry');
          draw.delete(feature.id);
          return;
        }
      }

      // Emit draw complete event with the feature - Requirement 7.3
      props.onDrawComplete(feature);

      // Clear the drawing after capturing
      draw.delete(feature.id);
    } catch (error) {
      // Handle drawing errors - Requirement 8.5
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error handling draw completion:', errorMsg);
    }
  };

  // Cleanup on component unmount
  onCleanup(() => {
    try {
      if (draw && props.map) {
        props.map.off('draw.create', handleDrawCreate);
        props.map.removeControl(draw as any);
        draw = null;
      }
    } catch (error) {
      // Handle cleanup errors - Requirement 8.5
      console.error('Error cleaning up drawing tools:', error);
    }
  });

  return null; // This component doesn't render anything visible
}
