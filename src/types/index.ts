import type { Feature, FeatureCollection, LineString, Point } from 'geojson';

/**
 * Soil type classification for underground cables
 */
export type SoilType = 'Pasir' | 'Tanah Liat' | 'Batuan';

/**
 * BOQ (Bill of Quantity) Types
 */
export interface BoQItem {
  no: number;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
  notes?: string;
}

export interface BoQSummary {
  totalItems: number;
  totalCost: number;
  materialCost: number;
  laborCost: number;
  equipmentCost?: number;
}

export interface BoQData {
  projectName?: string;
  projectCode?: string;
  date?: string;
  items: BoQItem[];
  summary: BoQSummary;
}

/**
 * Style properties from KML
 */
export interface KMLStyle {
  lineColor?: string; // ABGR or RGBA format
  lineWidth?: number;
  lineOpacity?: number;
  polygonColor?: string;
  polygonOpacity?: number;
  iconHref?: string;
  iconScale?: number;
  iconColor?: string;
  labelColor?: string;
  labelScale?: number;
}

/**
 * Segment information for polylines
 */
export interface SegmentInfo {
  startPoint: [number, number];
  endPoint: [number, number];
  distance: number; // in meters
  bearing?: number; // in degrees
}

/**
 * Extended metadata from KML
 */
export interface KMLMetadata {
  description?: string;
  timestamp?: string;
  author?: string;
  visibility?: boolean;
  open?: boolean;
  snippet?: string;
  [key: string]: any; // Allow additional custom metadata
}

/**
 * Properties associated with a cable route
 */
export interface CableProperties {
  id: string;
  soilType: SoilType;
  depth: number; // in meters
  name?: string;
  installDate?: string;
  // Enhanced properties
  style?: KMLStyle;
  segments?: SegmentInfo[];
  totalDistance?: number;
  metadata?: KMLMetadata;
}

/**
 * Properties associated with a marker point
 */
export interface MarkerProperties {
  cableId: string;
  cableName?: string;
  soilType: SoilType;
  depth: number;
  distanceFromStart: number; // in meters
  coordinates?: [number, number];
  // Enhanced properties
  style?: KMLStyle;
  metadata?: KMLMetadata;
}

/**
 * GeoJSON Feature representing a cable route
 */
export type CableFeature = Feature<LineString, CableProperties>;

/**
 * GeoJSON FeatureCollection of cable routes and points
 * Supports both LineString (cable routes) and Point (individual points) geometries
 */
export type CableFeatureCollection = FeatureCollection<LineString | Point, CableProperties>;

/**
 * GeoJSON Feature representing a marker point
 */
export type MarkerFeature = Feature<Point, MarkerProperties>;

/**
 * GeoJSON FeatureCollection of marker points
 */
export type MarkerFeatureCollection = FeatureCollection<Point, MarkerProperties>;

// ============================================================================
// Component Props and State Interfaces
// ============================================================================

/**
 * Props for the App root component
 */
export interface AppProps {}

/**
 * State for the App root component
 */
export interface AppState {
  cableData: CableFeatureCollection;
  selectedFeature: Feature<LineString | Point, CableProperties | MarkerProperties> | null;
  isDrawingMode: boolean;
}

/**
 * Props for the MapView component
 */
export interface MapViewProps {
  cableData: CableFeatureCollection;
  onFeatureClick: (feature: Feature<LineString | Point, CableProperties | MarkerProperties>, coordinates: [number, number], screenPosition: { x: number; y: number }) => void;
  onMapLoad: (map: any) => void; // maplibregl.Map type
  onMapClick?: () => void; // Optional handler for clicking on empty map area
  ref?: (methods: MapViewMethods) => void; // Optional ref for programmatic control
}

/**
 * Methods exposed by MapView component for programmatic control
 */
export interface MapViewMethods {
  panTo: (coordinates: [number, number], options?: { duration?: number }) => void;
  zoomTo: (zoomLevel: number, options?: { duration?: number }) => void;
  panBy: (offset: [number, number]) => void;
  getCenter: () => [number, number] | null;
  getZoom: () => number | null;
}

/**
 * Props for the PopupComponent
 */
export interface PopupProps {
  feature: Feature<LineString | Point, CableProperties | MarkerProperties>;
  coordinates: [number, number];
  onClose: () => void;
}

/**
 * Props for the SearchControl component
 */
export interface SearchControlProps {
  onLocationSelect: (coordinates: [number, number]) => void;
}

/**
 * Props for the DrawingTools component (optional feature)
 */
export interface DrawingToolsProps {
  isActive: boolean;
  onDrawComplete: (feature: Feature<LineString>) => void;
  onCancel: () => void;
}
