import type { CableFeatureCollection } from '../types';

/**
 * DataLoader Service
 * Handles loading and validation of GeoJSON cable data from various sources
 * Requirements: 8.2, 8.4, 8.5
 */

const LOCAL_STORAGE_KEY = 'underground-cable-data';
const SAMPLE_DATA_PATH = '/data/sample-cables.json';

/**
 * Validates GeoJSON structure for cable data
 * @param data - Data to validate
 * @returns true if valid, false otherwise
 */
function validateGeoJSON(data: any): data is CableFeatureCollection {
  try {
    // Add try-catch for GeoJSON parsing - Requirement 8.5
    if (!data || typeof data !== 'object') {
      console.warn('Invalid data: not an object');
      return false;
    }

    if (data.type !== 'FeatureCollection') {
      console.warn('Invalid data: not a FeatureCollection');
      return false;
    }

    if (!Array.isArray(data.features)) {
      console.warn('Invalid data: features is not an array');
      return false;
    }

    // Validate each feature
    for (const feature of data.features) {
      if (feature.type !== 'Feature') {
        console.warn('Invalid feature: type is not "Feature"');
        return false;
      }

      if (!feature.geometry || feature.geometry.type !== 'LineString') {
        console.warn('Invalid feature: geometry is not LineString');
        return false;
      }

      if (!Array.isArray(feature.geometry.coordinates) || feature.geometry.coordinates.length < 2) {
        console.warn('Invalid feature: LineString must have at least 2 coordinates');
        return false;
      }

      // Validate required properties
      if (!feature.properties || typeof feature.properties !== 'object') {
        console.warn('Invalid feature: missing properties');
        return false;
      }

      const props = feature.properties;
      if (!props.id || typeof props.id !== 'string') {
        console.warn('Invalid feature: missing or invalid id');
        return false;
      }

      if (!props.soilType || !['Pasir', 'Tanah Liat', 'Batuan'].includes(props.soilType)) {
        console.warn(`Invalid feature: invalid soil type "${props.soilType}"`);
        return false;
      }

      if (typeof props.depth !== 'number' || props.depth < 0) {
        console.warn('Invalid feature: invalid depth');
        return false;
      }
    }

    return true;
  } catch (error) {
    // Handle validation errors - Requirement 8.5
    console.error('Error during GeoJSON validation:', error);
    return false;
  }
}

/**
 * Loads GeoJSON data from a static file
 * Requirements: 8.2, 8.5
 * @param filePath - Path to the GeoJSON file
 * @returns Promise resolving to CableFeatureCollection
 * @throws Error if file cannot be loaded or parsed
 */
export async function loadFromStaticFile(filePath: string = SAMPLE_DATA_PATH): Promise<CableFeatureCollection> {
  try {
    // Add try-catch for GeoJSON parsing - Requirement 8.5
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const data = await response.json();

    if (!validateGeoJSON(data)) {
      throw new Error('Invalid GeoJSON structure. Please ensure the file contains valid cable route data with required properties (id, soilType, depth).');
    }

    return data;
  } catch (error) {
    // Log errors to console for debugging - Requirement 8.5
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading from static file:', errorMsg);
    throw new Error(`Failed to load GeoJSON file: ${errorMsg}`);
  }
}

/**
 * Loads GeoJSON data from local storage
 * Requirements: 8.2, 8.5
 * @returns CableFeatureCollection or null if not found
 */
export function loadFromLocalStorage(): CableFeatureCollection | null {
  try {
    // Add try-catch for GeoJSON parsing - Requirement 8.5
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    
    if (!stored) {
      return null;
    }

    const data = JSON.parse(stored);

    if (!validateGeoJSON(data)) {
      console.warn('Invalid GeoJSON in local storage, removing...');
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    // Handle errors gracefully - Requirement 8.5
    // Log errors to console for debugging
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading from local storage:', errorMsg);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return null;
  }
}

/**
 * Saves GeoJSON data to local storage
 * @param data - CableFeatureCollection to save
 * @throws Error if data is invalid or save fails
 */
export function saveToLocalStorage(data: CableFeatureCollection): void {
  try {
    // Add try-catch for GeoJSON parsing - Requirement 8.5
    if (!validateGeoJSON(data)) {
      throw new Error('Invalid GeoJSON structure');
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    // Log errors to console for debugging - Requirement 8.5
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error saving to local storage:', errorMsg);
    throw new Error(`Failed to save data: ${errorMsg}`);
  }
}

/**
 * Loads cable data with fallback strategy:
 * 1. Try local storage first
 * 2. Fall back to sample data if local storage is empty or invalid
 * 3. Handle errors gracefully with fallback to empty collection
 * Requirements: 8.2, 8.4, 8.5
 * @returns Promise resolving to CableFeatureCollection
 */
export async function loadCableData(): Promise<CableFeatureCollection> {
  try {
    // Try loading from local storage first
    const localData = loadFromLocalStorage();
    if (localData) {
      console.log('Loaded cable data from local storage');
      return localData;
    }

    // Fall back to sample data
    console.log('Loading sample cable data');
    const sampleData = await loadFromStaticFile();
    return sampleData;
  } catch (error) {
    // Handle errors gracefully with fallback - Requirement 8.5
    // Log errors to console for debugging
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading cable data, using empty fallback:', errorMsg);
    
    // Display user-friendly error message
    console.warn('Unable to load cable data. The map will be displayed without cable routes.');
    
    // Return empty feature collection as last resort - graceful degradation
    return {
      type: 'FeatureCollection',
      features: []
    };
  }
}

/**
 * Validates and loads custom GeoJSON data from a file
 * @param file - File object containing GeoJSON data
 * @returns Promise resolving to CableFeatureCollection
 * @throws Error if file cannot be read or parsed
 */
export async function loadFromFile(file: File): Promise<CableFeatureCollection> {
  return new Promise((resolve, reject) => {
    // Add try-catch for GeoJSON parsing - Requirement 8.5
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        
        if (!text || text.trim().length === 0) {
          reject(new Error('File is empty'));
          return;
        }

        const data = JSON.parse(text);

        if (!validateGeoJSON(data)) {
          reject(new Error('Invalid GeoJSON format. Please ensure the file contains valid cable route data with required properties (id, soilType, depth).'));
          return;
        }

        resolve(data);
      } catch (error) {
        // Handle errors gracefully - Requirement 8.5
        // Log errors to console for debugging
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error parsing file:', errorMsg);
        
        if (error instanceof SyntaxError) {
          reject(new Error('Failed to parse JSON file. Please ensure the file contains valid JSON.'));
        } else {
          reject(new Error(`Failed to load file: ${errorMsg}`));
        }
      }
    };

    reader.onerror = () => {
      // Handle file read errors - Requirement 8.5
      console.error('FileReader error:', reader.error);
      reject(new Error('Failed to read file. Please try again.'));
    };

    reader.readAsText(file);
  });
}

export const DataLoader = {
  loadFromStaticFile,
  loadFromLocalStorage,
  saveToLocalStorage,
  loadCableData,
  loadFromFile,
  validateGeoJSON
};
