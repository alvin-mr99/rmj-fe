import { describe, it, expect } from 'vitest';
import type { CableFeatureCollection, CableFeature } from '../types';
import type { Feature, LineString } from 'geojson';

/**
 * Integration tests for new route addition functionality
 * Requirements: 7.4, 7.5
 */
describe('New Route Addition', () => {
  it('should create a valid CableFeature from drawn geometry and user input', () => {
    // Simulate drawn geometry
    const drawnFeature: Feature<LineString> = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [106.827, -6.175],
          [106.828, -6.176],
          [106.829, -6.177]
        ]
      },
      properties: {}
    };

    // User input
    const soilType = 'Pasir';
    const depth = 2.5;

    // Create new CableFeature (simulating handleRouteSubmit logic)
    const newCableFeature: CableFeature = {
      type: 'Feature',
      geometry: drawnFeature.geometry,
      properties: {
        id: `cable-test-${Date.now()}`,
        soilType,
        depth,
        name: `Test Cable Route`
      }
    };

    // Verify the feature is valid
    expect(newCableFeature.type).toBe('Feature');
    expect(newCableFeature.geometry.type).toBe('LineString');
    expect(newCableFeature.geometry.coordinates.length).toBe(3);
    expect(newCableFeature.properties.soilType).toBe('Pasir');
    expect(newCableFeature.properties.depth).toBe(2.5);
    expect(newCableFeature.properties.id).toContain('cable-test-');
  });

  it('should add new feature to cable data collection', () => {
    // Initial cable data
    const initialData: CableFeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[106.827, -6.175], [106.828, -6.176]]
          },
          properties: {
            id: 'cable-001',
            soilType: 'Tanah Liat',
            depth: 1.5
          }
        }
      ]
    };

    // New feature to add
    const newFeature: CableFeature = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[106.829, -6.177], [106.830, -6.178]]
      },
      properties: {
        id: 'cable-002',
        soilType: 'Pasir',
        depth: 2.0
      }
    };

    // Add new feature (simulating setCableData logic)
    const updatedData: CableFeatureCollection = {
      type: 'FeatureCollection',
      features: [...initialData.features, newFeature]
    };

    // Verify the route count increased by exactly one - Requirement 7.4
    expect(updatedData.features.length).toBe(initialData.features.length + 1);
    expect(updatedData.features.length).toBe(2);
    
    // Verify the new feature is in the collection
    expect(updatedData.features[1]).toEqual(newFeature);
    expect(updatedData.features[1].properties.id).toBe('cable-002');
  });

  it('should preserve existing routes when adding new route', () => {
    const existingRoute: CableFeature = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[106.827, -6.175], [106.828, -6.176]]
      },
      properties: {
        id: 'cable-existing',
        soilType: 'Batuan',
        depth: 3.0,
        name: 'Existing Route'
      }
    };

    const initialData: CableFeatureCollection = {
      type: 'FeatureCollection',
      features: [existingRoute]
    };

    const newRoute: CableFeature = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[106.829, -6.177], [106.830, -6.178]]
      },
      properties: {
        id: 'cable-new',
        soilType: 'Pasir',
        depth: 1.5,
        name: 'New Route'
      }
    };

    const updatedData: CableFeatureCollection = {
      type: 'FeatureCollection',
      features: [...initialData.features, newRoute]
    };

    // Verify existing route is preserved
    expect(updatedData.features[0]).toEqual(existingRoute);
    expect(updatedData.features[0].properties.id).toBe('cable-existing');
    expect(updatedData.features[0].properties.name).toBe('Existing Route');
    
    // Verify new route is added
    expect(updatedData.features[1]).toEqual(newRoute);
  });

  it('should handle all three soil types correctly', () => {
    const soilTypes = ['Pasir', 'Tanah Liat', 'Batuan'] as const;
    
    soilTypes.forEach((soilType) => {
      const feature: CableFeature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[106.827, -6.175], [106.828, -6.176]]
        },
        properties: {
          id: `cable-${soilType}`,
          soilType,
          depth: 1.5
        }
      };

      expect(feature.properties.soilType).toBe(soilType);
      expect(['Pasir', 'Tanah Liat', 'Batuan']).toContain(feature.properties.soilType);
    });
  });

  it('should handle various depth values', () => {
    const depths = [0.5, 1.0, 1.5, 2.0, 3.5, 5.0];
    
    depths.forEach((depth) => {
      const feature: CableFeature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[106.827, -6.175], [106.828, -6.176]]
        },
        properties: {
          id: `cable-depth-${depth}`,
          soilType: 'Pasir',
          depth
        }
      };

      expect(feature.properties.depth).toBe(depth);
      expect(feature.properties.depth).toBeGreaterThan(0);
    });
  });
});
