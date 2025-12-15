import type { PaketArea } from '../types/paketArea';

const STORAGE_KEY = 'paket_areas';

export const paketAreaService = {
  /**
   * Get all Paket Areas from localStorage
   */
  getAll(): PaketArea[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  /**
   * Get a single Paket Area by ID
   */
  getById(id: string): PaketArea | null {
    const areas = this.getAll();
    return areas.find(area => area.id === id) || null;
  },

  /**
   * Create a new Paket Area
   */
  create(area: Omit<PaketArea, 'id' | 'createdAt' | 'updatedAt'>): PaketArea {
    const areas = this.getAll();
    const newArea: PaketArea = {
      ...area,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    areas.push(newArea);
    this.saveAll(areas);
    return newArea;
  },

  /**
   * Update an existing Paket Area
   */
  update(id: string, updates: Partial<Omit<PaketArea, 'id' | 'createdAt'>>): PaketArea | null {
    const areas = this.getAll();
    const index = areas.findIndex(area => area.id === id);
    
    if (index === -1) {
      return null;
    }

    areas[index] = {
      ...areas[index],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    this.saveAll(areas);
    return areas[index];
  },

  /**
   * Delete a Paket Area
   */
  delete(id: string): boolean {
    const areas = this.getAll();
    const filtered = areas.filter(area => area.id !== id);
    
    if (filtered.length === areas.length) {
      return false; // ID not found
    }

    this.saveAll(filtered);
    return true;
  },

  /**
   * Save all areas to localStorage
   */
  saveAll(areas: PaketArea[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(areas));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw new Error('Failed to save data');
    }
  },

  /**
   * Clear all data
   */
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Generate a unique ID
   */
  generateId(): string {
    return `pa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Generate a unique Site ID
   */
  generateSiteId(): string {
    return `site-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Generate a unique Ruas Kontrak ID
   */
  generateRuasId(): string {
    return `ruas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
};
