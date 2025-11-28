/**
 * BOQ (Bill of Quantity) Type Definitions – Improved Version
 */

export interface BoQItem {
  id: number;
  category: string;            // e.g. "Soil", "Cor", "Boring", "Handhole", "Material"
  subCategory?: string;        // e.g. "Segment STO A – Desa X", "HDPE 40mm"
  
  description: string;         // item description
  unit: string;                // meter, unit, pcs, etc.
  quantity: number;
  unitPrice?: number;          // optional if price is not available yet
  totalPrice?: number;

  // Additional fields common in OSP BOQ
  depth?: number;              // for galian 1.5m
  diameter?: number;           // for boring, duct
  location?: string;           // segment/lokasi item
  notes?: string;
}

export interface BoQCategorySummary {
  category: string;            // Soil, Cor, Boring, etc.
  totalQuantity: number;
  totalCost?: number;
}

export interface BoQSummary {
  totalItems: number;
  totalCost: number;

  // Optional breakdown
  materialCost?: number;
  laborCost?: number;
  equipmentCost?: number;

  // Additional aggregated data
  categorySummary?: BoQCategorySummary[];
}

export interface BoQData {
  projectName?: string;
  projectCode?: string;
  date?: string;

  items: BoQItem[];
  summary: BoQSummary;
}
