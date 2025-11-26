import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getSoilTypeColor } from './StyleEngine';
import type { SoilType } from '../types';

/**
 * Property-Based Tests for StyleEngine Service
 * 
 * Feature: underground-cable-map, Property 4: Soil type color mapping
 * Validates: Requirements 2.1, 2.2, 2.3
 */

describe('StyleEngine - Property-Based Tests', () => {
  describe('Property 4: Soil type color mapping', () => {
    /**
     * Feature: underground-cable-map, Property 4: Soil type color mapping
     * Validates: Requirements 2.1, 2.2, 2.3
     * 
     * For any cable route with a valid soil type (Pasir, Tanah Liat, or Batuan),
     * the rendered line color should match the specified mapping:
     * - Pasir → yellow (#FFFF00)
     * - Tanah Liat → brown (#8B4513)
     * - Batuan → gray (#808080)
     */
    it('should map valid soil types to their correct colors', () => {
      // Define the valid soil types and their expected colors
      const soilTypeColorMap: Record<SoilType, string> = {
        'Pasir': '#FFFF00',        // Yellow - Requirement 2.1
        'Tanah Liat': '#8B4513',   // Brown - Requirement 2.2
        'Batuan': '#808080',       // Gray - Requirement 2.3
      };

      // Generator for valid soil types
      const validSoilTypeArbitrary = fc.constantFrom<SoilType>(
        'Pasir',
        'Tanah Liat',
        'Batuan'
      );

      // Property: For any valid soil type, the color should match the specification
      fc.assert(
        fc.property(validSoilTypeArbitrary, (soilType) => {
          const actualColor = getSoilTypeColor(soilType);
          const expectedColor = soilTypeColorMap[soilType];
          
          expect(actualColor).toBe(expectedColor);
        }),
        { numRuns: 100 } // Run 100 iterations as specified in design document
      );
    });
  });

  describe('Property 5: Invalid soil type default handling', () => {
    /**
     * Feature: underground-cable-map, Property 5: Invalid soil type default handling
     * Validates: Requirements 2.4
     * 
     * For any cable route with missing or invalid soil type data,
     * the system should render the line in a default color without throwing errors.
     */
    it('should return default color for invalid or missing soil types', () => {
      const DEFAULT_COLOR = '#000000'; // Black as specified in design

      // Generator for invalid soil type strings
      // This includes: empty strings, random strings, numbers as strings, special characters
      const invalidSoilTypeArbitrary = fc.oneof(
        fc.constant(''),                           // Empty string
        fc.constant(undefined as any),             // Undefined
        fc.constant(null as any),                  // Null
        fc.string().filter(s => 
          s !== 'Pasir' && 
          s !== 'Tanah Liat' && 
          s !== 'Batuan'
        ),                                         // Any string that's not a valid soil type
        fc.integer().map(n => n.toString()),       // Numbers as strings
        fc.constant('PASIR'),                      // Wrong case
        fc.constant('pasir'),                      // Wrong case
        fc.constant('tanah liat'),                 // Wrong case
        fc.constant('batuan'),                     // Wrong case
        fc.constant('Unknown'),                    // Common invalid value
        fc.constant('N/A'),                        // Common invalid value
      );

      // Property: For any invalid soil type, should return default color without errors
      fc.assert(
        fc.property(invalidSoilTypeArbitrary, (invalidSoilType) => {
          // Should not throw an error
          expect(() => {
            getSoilTypeColor(invalidSoilType);
          }).not.toThrow();

          // Should return the default color
          const actualColor = getSoilTypeColor(invalidSoilType);
          expect(actualColor).toBe(DEFAULT_COLOR);
        }),
        { numRuns: 100 } // Run 100 iterations as specified in design document
      );
    });
  });
});
