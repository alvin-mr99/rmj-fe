import { describe, it, expect, beforeEach } from 'vitest';
import { DataLoader } from './DataLoader';
import type { CableFeatureCollection } from '../types';

describe('DataLoader Service', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('validateGeoJSON', () => {
    it('should validate correct GeoJSON structure', () => {
      const validData: CableFeatureCollection = {
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
              soilType: 'Pasir',
              depth: 1.5
            }
          }
        ]
      };

      expect(DataLoader.validateGeoJSON(validData)).toBe(true);
    });

    it('should reject invalid GeoJSON type', () => {
      const invalidData = {
        type: 'Feature', // Should be FeatureCollection
        features: []
      };

      expect(DataLoader.validateGeoJSON(invalidData)).toBe(false);
    });

    it('should reject missing features array', () => {
      const invalidData = {
        type: 'FeatureCollection'
        // Missing features
      };

      expect(DataLoader.validateGeoJSON(invalidData)).toBe(false);
    });

    it('should reject invalid soil type', () => {
      const invalidData = {
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
              soilType: 'InvalidType', // Invalid soil type
              depth: 1.5
            }
          }
        ]
      };

      expect(DataLoader.validateGeoJSON(invalidData)).toBe(false);
    });

    it('should reject LineString with less than 2 coordinates', () => {
      const invalidData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [[106.827, -6.175]] // Only 1 coordinate
            },
            properties: {
              id: 'cable-001',
              soilType: 'Pasir',
              depth: 1.5
            }
          }
        ]
      };

      expect(DataLoader.validateGeoJSON(invalidData)).toBe(false);
    });

    it('should reject negative depth values', () => {
      const invalidData = {
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
              soilType: 'Pasir',
              depth: -1.5 // Negative depth
            }
          }
        ]
      };

      expect(DataLoader.validateGeoJSON(invalidData)).toBe(false);
    });
  });

  describe('saveToLocalStorage and loadFromLocalStorage', () => {
    it('should save and load valid data', () => {
      const testData: CableFeatureCollection = {
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
              soilType: 'Pasir',
              depth: 1.5
            }
          }
        ]
      };

      DataLoader.saveToLocalStorage(testData);
      const loaded = DataLoader.loadFromLocalStorage();

      expect(loaded).toEqual(testData);
    });

    it('should return null when localStorage is empty', () => {
      const loaded = DataLoader.loadFromLocalStorage();
      expect(loaded).toBeNull();
    });

    it('should remove invalid data from localStorage', () => {
      // Manually set invalid data
      localStorage.setItem('underground-cable-data', JSON.stringify({ invalid: 'data' }));

      const loaded = DataLoader.loadFromLocalStorage();
      expect(loaded).toBeNull();
      expect(localStorage.getItem('underground-cable-data')).toBeNull();
    });
  });

  describe('loadFromFile', () => {
    it('should load valid GeoJSON from file', async () => {
      const validGeoJSON = JSON.stringify({
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
              soilType: 'Pasir',
              depth: 1.5
            }
          }
        ]
      });

      const file = new File([validGeoJSON], 'test.json', { type: 'application/json' });
      const result = await DataLoader.loadFromFile(file);

      expect(result.type).toBe('FeatureCollection');
      expect(result.features).toHaveLength(1);
    });

    it('should reject invalid JSON', async () => {
      const invalidJSON = 'not valid json {';
      const file = new File([invalidJSON], 'test.json', { type: 'application/json' });

      await expect(DataLoader.loadFromFile(file)).rejects.toThrow('Failed to parse JSON file');
    });

    it('should reject invalid GeoJSON structure', async () => {
      const invalidGeoJSON = JSON.stringify({ type: 'Invalid' });
      const file = new File([invalidGeoJSON], 'test.json', { type: 'application/json' });

      await expect(DataLoader.loadFromFile(file)).rejects.toThrow('Invalid GeoJSON format');
    });
  });
});
