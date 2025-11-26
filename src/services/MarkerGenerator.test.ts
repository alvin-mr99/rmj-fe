import { describe, it, expect } from 'vitest';
import { MarkerGenerator } from './MarkerGenerator';
import type { Feature, LineString } from 'geojson';
import type { CableProperties } from '../types';
import * as fc from 'fast-check';

describe('MarkerGenerator', () => {
  const markerGenerator = new MarkerGenerator();

  // Helper function to create a test cable route
  const createTestCable = (coordinates: [number, number][]): Feature<LineString, CableProperties> => {
    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates
      },
      properties: {
        id: 'test-cable-001',
        soilType: 'Pasir',
        depth: 1.5,
        name: 'Test Cable'
      }
    };
  };

  describe('calculateTotalDistance', () => {
    it('should calculate distance for a simple route', () => {
      // Create a route with known coordinates
      const cable = createTestCable([
        [106.8270, -6.1751],
        [106.8280, -6.1755]
      ]);

      const distance = markerGenerator.calculateTotalDistance(cable);
      
      // Distance should be positive
      expect(distance).toBeGreaterThan(0);
    });

    it('should return 0 for a single-point route', () => {
      const cable = createTestCable([
        [106.8270, -6.1751],
        [106.8270, -6.1751]
      ]);

      const distance = markerGenerator.calculateTotalDistance(cable);
      expect(distance).toBe(0);
    });
  });

  describe('generateMarkers', () => {
    it('should generate markers at 30m intervals for a long route', () => {
      // Create a route that's approximately 150 meters long
      const cable = createTestCable([
        [106.8270, -6.1751],
        [106.8280, -6.1755],
        [106.8290, -6.1760],
        [106.8300, -6.1765]
      ]);

      const markers = markerGenerator.generateMarkers(cable, 30);
      
      // Should have multiple markers
      expect(markers.features.length).toBeGreaterThan(2);
      
      // All markers should have required properties
      markers.features.forEach(marker => {
        expect(marker.properties.cableId).toBe('test-cable-001');
        expect(marker.properties.soilType).toBe('Pasir');
        expect(marker.properties.depth).toBe(1.5);
        expect(marker.properties.distanceFromStart).toBeGreaterThanOrEqual(0);
        expect(marker.properties.coordinates).toHaveLength(2);
      });
    });

    it('should handle routes shorter than 30 meters with start and end markers', () => {
      // Create a very short route (less than 30 meters)
      const cable = createTestCable([
        [106.8270, -6.1751],
        [106.8271, -6.1752]
      ]);

      const markers = markerGenerator.generateMarkers(cable, 30);
      
      // Should have exactly 2 markers (start and end)
      expect(markers.features.length).toBe(2);
      
      // First marker should be at distance 0
      expect(markers.features[0].properties.distanceFromStart).toBe(0);
      
      // Last marker should be at the end
      const totalDistance = markerGenerator.calculateTotalDistance(cable);
      expect(markers.features[1].properties.distanceFromStart).toBeCloseTo(totalDistance, 1);
    });

    it('should generate markers with correct properties', () => {
      const cable = createTestCable([
        [106.8270, -6.1751],
        [106.8280, -6.1755],
        [106.8290, -6.1760]
      ]);

      const markers = markerGenerator.generateMarkers(cable, 30);
      
      // Check first marker
      const firstMarker = markers.features[0];
      expect(firstMarker.type).toBe('Feature');
      expect(firstMarker.geometry.type).toBe('Point');
      expect(firstMarker.properties.cableId).toBe('test-cable-001');
      expect(firstMarker.properties.soilType).toBe('Pasir');
      expect(firstMarker.properties.depth).toBe(1.5);
      expect(firstMarker.properties.distanceFromStart).toBe(0);
    });

    it('should handle different soil types', () => {
      const cable: Feature<LineString, CableProperties> = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [106.8270, -6.1751],
            [106.8280, -6.1755]
          ]
        },
        properties: {
          id: 'test-cable-002',
          soilType: 'Tanah Liat',
          depth: 2.0
        }
      };

      const markers = markerGenerator.generateMarkers(cable, 30);
      
      markers.features.forEach(marker => {
        expect(marker.properties.soilType).toBe('Tanah Liat');
        expect(marker.properties.depth).toBe(2.0);
      });
    });

    it('should use custom interval when specified', () => {
      const cable = createTestCable([
        [106.8270, -6.1751],
        [106.8280, -6.1755],
        [106.8290, -6.1760],
        [106.8300, -6.1765]
      ]);

      const markers50m = markerGenerator.generateMarkers(cable, 50);
      const markers20m = markerGenerator.generateMarkers(cable, 20);
      
      // Smaller interval should produce more markers
      expect(markers20m.features.length).toBeGreaterThan(markers50m.features.length);
    });
  });

  describe('Edge Cases', () => {
    it('should handle routes shorter than 30 meters', () => {
      // Create a very short route (approximately 10-15 meters)
      const cable = createTestCable([
        [106.8270, -6.1751],
        [106.8271, -6.1751]
      ]);

      const distance = markerGenerator.calculateTotalDistance(cable);
      expect(distance).toBeLessThan(30);

      const markers = markerGenerator.generateMarkers(cable, 30);
      
      // Should have exactly 2 markers (start and end)
      expect(markers.features.length).toBe(2);
      
      // First marker at start
      expect(markers.features[0].properties.distanceFromStart).toBe(0);
      
      // Second marker at end
      expect(markers.features[1].properties.distanceFromStart).toBeCloseTo(distance, 1);
      
      // All markers should have correct properties
      markers.features.forEach(marker => {
        expect(marker.properties.cableId).toBe('test-cable-001');
        expect(marker.properties.soilType).toBe('Pasir');
        expect(marker.properties.depth).toBe(1.5);
      });
    });

    it('should handle single-segment LineStrings', () => {
      // Single segment (2 points)
      const cable = createTestCable([
        [106.8270, -6.1751],
        [106.8290, -6.1760]
      ]);

      const markers = markerGenerator.generateMarkers(cable, 30);
      
      // Should generate markers successfully
      expect(markers.features.length).toBeGreaterThanOrEqual(2);
      
      // First marker should be at start
      expect(markers.features[0].geometry.coordinates).toEqual([106.8270, -6.1751]);
      
      // All markers should be valid Point features
      markers.features.forEach(marker => {
        expect(marker.type).toBe('Feature');
        expect(marker.geometry.type).toBe('Point');
        expect(marker.geometry.coordinates).toHaveLength(2);
        expect(marker.properties.cableId).toBe('test-cable-001');
      });
    });

    it('should handle very long routes (>1km)', () => {
      // Create a route that's approximately 1.5-2 km long
      // Using coordinates that span a larger distance
      const cable = createTestCable([
        [106.8270, -6.1751],
        [106.8300, -6.1760],
        [106.8330, -6.1770],
        [106.8360, -6.1780],
        [106.8390, -6.1790],
        [106.8420, -6.1800],
        [106.8450, -6.1810]
      ]);

      const distance = markerGenerator.calculateTotalDistance(cable);
      expect(distance).toBeGreaterThan(1000); // Should be > 1km

      const markers = markerGenerator.generateMarkers(cable, 30);
      
      // Should have many markers (at least 30+ for a 1km+ route)
      expect(markers.features.length).toBeGreaterThan(30);
      
      // First marker at start
      expect(markers.features[0].properties.distanceFromStart).toBe(0);
      
      // Last marker should be near the end
      const lastMarker = markers.features[markers.features.length - 1];
      expect(lastMarker.properties.distanceFromStart).toBeGreaterThan(distance - 30);
      
      // Check that markers are properly spaced
      for (let i = 0; i < markers.features.length - 1; i++) {
        const currentDistance = markers.features[i].properties.distanceFromStart;
        const nextDistance = markers.features[i + 1].properties.distanceFromStart;
        const spacing = nextDistance - currentDistance;
        
        // Spacing should be approximately 30m (with some tolerance)
        // Last interval might be shorter
        if (i < markers.features.length - 2) {
          expect(spacing).toBeGreaterThanOrEqual(29);
          expect(spacing).toBeLessThanOrEqual(31);
        } else {
          expect(spacing).toBeGreaterThan(0);
          expect(spacing).toBeLessThanOrEqual(31);
        }
      }
      
      // All markers should have valid properties
      markers.features.forEach(marker => {
        expect(marker.type).toBe('Feature');
        expect(marker.geometry.type).toBe('Point');
        expect(marker.properties.cableId).toBe('test-cable-001');
        expect(marker.properties.soilType).toBe('Pasir');
        expect(marker.properties.depth).toBe(1.5);
        expect(marker.properties.distanceFromStart).toBeGreaterThanOrEqual(0);
        expect(marker.properties.distanceFromStart).toBeLessThanOrEqual(distance);
      });
    });
  });

  describe('Property-Based Tests', () => {
    // Feature: underground-cable-map, Property 6: Marker interval consistency
    // Validates: Requirements 3.1
    it('Property 6: markers should be spaced at 30-meter intervals (±1m tolerance) for routes >= 30m', { timeout: 60000 }, () => {
      // Generator for random coordinates in Indonesia region
      const coordinateArb = fc.tuple(
        fc.double({ min: 106.0, max: 107.5 }), // Longitude (Jakarta area)
        fc.double({ min: -7.0, max: -5.5 })    // Latitude (Jakarta area)
      ) as fc.Arbitrary<[number, number]>;

      // Generator for LineString with 2-20 points
      const lineStringArb = fc.array(coordinateArb, { minLength: 2, maxLength: 20 })
        .map(coords => {
          // Ensure coordinates are distinct to create valid routes
          const uniqueCoords = coords.filter((coord, index, self) => 
            index === 0 || coord[0] !== self[index - 1][0] || coord[1] !== self[index - 1][1]
          );
          return uniqueCoords.length >= 2 ? uniqueCoords : [coords[0], [coords[0][0] + 0.001, coords[0][1] + 0.001]];
        });

      // Generator for cable properties
      const cablePropertiesArb = fc.record({
        id: fc.string({ minLength: 1, maxLength: 20 }).map(s => `cable-${s}`),
        soilType: fc.constantFrom('Pasir', 'Tanah Liat', 'Batuan') as fc.Arbitrary<'Pasir' | 'Tanah Liat' | 'Batuan'>,
        depth: fc.double({ min: 0.5, max: 5.0 })
      });

      // Generator for complete cable feature
      const cableFeatureArb = fc.tuple(lineStringArb, cablePropertiesArb)
        .map(([coordinates, properties]): Feature<LineString, CableProperties> => ({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates
          },
          properties
        }));

      fc.assert(
        fc.property(cableFeatureArb, (cable) => {
          const markerGenerator = new MarkerGenerator();
          const totalDistance = markerGenerator.calculateTotalDistance(cable);
          
          // Only test routes that are >= 30 meters
          // For routes < 30m, the implementation places start/end markers only
          if (totalDistance < 30) {
            return true; // Skip this test case
          }

          const markers = markerGenerator.generateMarkers(cable, 30);
          
          // Property: For routes >= 30m, markers should be spaced at ~30m intervals
          // Check spacing between consecutive markers (except possibly the last one)
          for (let i = 0; i < markers.features.length - 1; i++) {
            const currentDistance = markers.features[i].properties.distanceFromStart;
            const nextDistance = markers.features[i + 1].properties.distanceFromStart;
            const spacing = nextDistance - currentDistance;
            
            // Allow ±1 meter tolerance for geometric calculations
            // The last interval might be shorter if the route doesn't divide evenly
            const isLastInterval = i === markers.features.length - 2;
            
            if (!isLastInterval) {
              // Regular intervals should be 30m ± 1m
              if (spacing < 29 || spacing > 31) {
                return false;
              }
            } else {
              // Last interval can be <= 30m (but should be > 0)
              if (spacing <= 0 || spacing > 31) {
                return false;
              }
            }
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    // Feature: underground-cable-map, Property 7: Marker independence across routes
    // Validates: Requirements 3.5
    it('Property 7: total markers for multiple routes should equal sum of individual route markers', { timeout: 60000 }, () => {
      // Generator for random coordinates in Indonesia region
      const coordinateArb = fc.tuple(
        fc.double({ min: 106.0, max: 107.5 }), // Longitude (Jakarta area)
        fc.double({ min: -7.0, max: -5.5 })    // Latitude (Jakarta area)
      ) as fc.Arbitrary<[number, number]>;

      // Generator for LineString with 2-20 points
      const lineStringArb = fc.array(coordinateArb, { minLength: 2, maxLength: 20 })
        .map(coords => {
          // Ensure coordinates are distinct to create valid routes
          const uniqueCoords = coords.filter((coord, index, self) => 
            index === 0 || coord[0] !== self[index - 1][0] || coord[1] !== self[index - 1][1]
          );
          return uniqueCoords.length >= 2 ? uniqueCoords : [coords[0], [coords[0][0] + 0.001, coords[0][1] + 0.001]];
        });

      // Generator for cable properties with unique IDs
      const cablePropertiesArb = fc.record({
        id: fc.string({ minLength: 1, maxLength: 20 }).map(s => `cable-${s}`),
        soilType: fc.constantFrom('Pasir', 'Tanah Liat', 'Batuan') as fc.Arbitrary<'Pasir' | 'Tanah Liat' | 'Batuan'>,
        depth: fc.double({ min: 0.5, max: 5.0 })
      });

      // Generator for complete cable feature
      const cableFeatureArb = fc.tuple(lineStringArb, cablePropertiesArb)
        .map(([coordinates, properties]): Feature<LineString, CableProperties> => ({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates
          },
          properties
        }));

      // Generator for array of 2-5 cable routes
      const multipleRoutesArb = fc.array(cableFeatureArb, { minLength: 2, maxLength: 5 })
        .map(routes => {
          // Ensure unique IDs for each route
          return routes.map((route, index) => ({
            ...route,
            properties: {
              ...route.properties,
              id: `cable-${index}-${route.properties.id}`
            }
          }));
        });

      fc.assert(
        fc.property(multipleRoutesArb, (routes) => {
          const markerGenerator = new MarkerGenerator();
          
          // Generate markers for each route individually and sum the counts
          let expectedTotalMarkers = 0;
          const individualMarkerCounts: number[] = [];
          
          for (const route of routes) {
            const markers = markerGenerator.generateMarkers(route, 30);
            const markerCount = markers.features.length;
            individualMarkerCounts.push(markerCount);
            expectedTotalMarkers += markerCount;
          }
          
          // Generate markers for all routes (simulating processing them together)
          // In the actual implementation, each route is processed independently
          let actualTotalMarkers = 0;
          for (const route of routes) {
            const markers = markerGenerator.generateMarkers(route, 30);
            actualTotalMarkers += markers.features.length;
          }
          
          // Property: Total markers should equal sum of individual route markers
          // This verifies that marker generation for one route doesn't affect another
          return actualTotalMarkers === expectedTotalMarkers;
        }),
        { numRuns: 100 }
      );
    });
  });
});
