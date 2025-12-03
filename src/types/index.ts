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
 * BOQ File data with metadata (similar to KMLFileData)
 */
export interface BoQFileData {
  id: string;
  fileName: string;
  fileSize: number;
  data: BoQData;
  uploadDate: string;
}

/**
 * Project metadata
 */
export interface ProjectMetadata {
  createdDate: string;
  lastModified: string;
  description?: string;
  location?: string;
  status?: 'planning' | 'in-progress' | 'completed';
}

/**
 * Project statistics (derived from KML data)
 */
export interface ProjectStatistics {
  totalPoints: number;
  totalLines: number;
  totalPolygons: number;
  totalDistance: number; // in meters
  totalFeatures: number;
}

/**
 * Unified Project Data that combines KML and BOQ
 */
export interface ProjectData {
  id: string;
  projectName: string; // e.g., "RMJ-MONAS-DKI"
  projectCode: string; // e.g., "RMJ-MONAS-001"
  kml: {
    fileName: string; // e.g., "kml-monas-dki.kml"
    fileSize: number;
    data: CableFeatureCollection;
  };
  boq: {
    fileName: string; // e.g., "boq-monas-dki.xlsx"
    fileSize: number;
    data: BoQData;
  } | null; // BOQ is optional
  metadata: ProjectMetadata;
  statistics?: ProjectStatistics; // Computed statistics
  uploadDate: string;
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
 * KML File data with metadata
 */
export interface KMLFileData {
  id: string;
  fileName: string;
  fileSize: number;
  data: CableFeatureCollection;
  uploadDate: string;
}

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
  kmlFiles: KMLFileData[];
  selectedKmlId: string | null;
  selectedFeature: Feature<LineString | Point, CableProperties | MarkerProperties> | null;
  isDrawingMode: boolean;
}

/**
 * Props for the MapView component
 */
export interface MapViewProps {
  kmlFiles: KMLFileData[];
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
 * Props for the TopSearchInput component
 */
export interface TopSearchInputProps {
  kmlFiles: KMLFileData[];
  map: maplibregl.Map | null;
  onFeatureSelect?: (feature: Feature<LineString | Point, CableProperties>, coordinates: [number, number]) => void;
}

/**
 * Props for the DrawingTools component (optional feature)
 */
export interface DrawingToolsProps {
  isActive: boolean;
  onDrawComplete: (feature: Feature<LineString>) => void;
  onCancel: () => void;
}

// ============================================================================
// RMJ Tools Types
// ============================================================================

/**
 * User roles for RMJ system
 */
export type UserRole = 'Admin' | 'Internal TI' | 'Mitra';

/**
 * Access level for users
 */
export type AccessLevel = 'view' | 'modify' | 'full';

/**
 * User data
 */
export interface RMJUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  accessLevel: AccessLevel;
  unit?: string;
  division?: string;
  regional?: string;
  createdDate: string;
  lastLogin?: string;
}

/**
 * Contract/Project information
 */
export interface RMJContract {
  id: string;
  contractNumber: string;
  contractName: string;
  ruasKontrak: string;
  ruasDRM: string;
  program?: string;
  regional?: string;
  project?: string;
  mitra?: string;
  tahunProject?: string;
  createdDate: string;
  createdBy: string;
}

/**
 * UnixID/DRM Ruas data row
 */
export interface RMJSitelistRow {
  unixId: string; // Primary key
  customerId: string;
  siteId: string;
  siteName: string;
  deliveryRegion?: string;
  areaName?: string;
  installation?: string;
  wiDnUgas?: string;
  subcontractor?: string;
  siteOwner?: string;
  installationPd?: string;
  wiWeeklyPlan?: string;
  mosCnInstallationCompleted?: string;
  planEndDate?: string;
  actualEndDate?: string;
  owner?: string;
  action?: string;
  // Milestone fields
  milestone1?: string;
  milestone2?: string;
  milestone3?: string;
  // Activity fields
  activity1?: string;
  activity2?: string;
  activity3?: string;
  // Properties fields
  properties1?: string;
  properties2?: string;
  properties3?: string;
  // Additional attributes (dynamic columns)
  [key: string]: any;
}

/**
 * Column definition for dynamic attributes
 */
export interface RMJColumnDefinition {
  id: string;
  fieldName: string;
  displayName: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  category: 'default' | 'milestone' | 'activity' | 'properties' | 'custom';
  options?: string[]; // For select type
  required?: boolean;
  editable?: boolean;
  visible?: boolean;
  order?: number;
  createdBy?: string;
  createdDate?: string;
}

/**
 * View template for saving column configurations
 */
export interface RMJViewTemplate {
  id: string;
  name: string;
  description?: string;
  lockedColumns: string[]; // Column IDs that are always visible
  visibleColumns: string[]; // Column IDs that are visible in this template
  columnOrder?: string[]; // Custom column order
  filters?: any; // Saved filter state
  createdBy: string;
  createdDate: string;
  isPublic?: boolean; // Can be used by other users
  userRole?: UserRole; // Template specific to role
}

/**
 * Communication/Issue entry for a row
 */
export interface RMJCommunication {
  id: string;
  unixId: string; // Reference to sitelist row
  message: string;
  type: 'comment' | 'issue' | 'update';
  createdBy: string;
  createdDate: string;
  attachments?: string[]; // File URLs
  resolved?: boolean;
}

/**
 * History entry for tracking changes
 */
export interface RMJHistory {
  id: string;
  unixId: string;
  fieldName: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedDate: string;
  reason?: string;
}

/**
 * Evidence/Document for a row
 */
export interface RMJEvidence {
  id: string;
  unixId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  category?: string;
  uploadedBy: string;
  uploadedDate: string;
  description?: string;
}

// ============================================================================
// Hierarchical Project Interfaces (for Project -> PaketArea -> Lokasi -> Ruas)
// ============================================================================

export interface ProjectHierarchyProject {
  id: string;
  noKontrak: string;
  namaKontrak: string;
  treg: string;
  area?: string;
  tahunProject: string;
  program: string;
  regional: string;
  planRFS?: string;
  currentMilestone?: string;
  paketAreas: PaketArea[];
}

export interface PaketArea {
  id: string;
  areaId: string;
  namaArea: string;
  lokasis: Lokasi[];
}

export interface Lokasi {
  id: string;
  kode: string;
  mitra: string;
  witel: string;
  siteName: string;
  ruasKontraks: RuasKontrak[];
}

export interface RuasKontrak {
  id: string;
  noRuas: string;
  namaRuas: string;
  panjangKM: number;
  volumeMeter: number;
  progressGalian: number; // percent
  progressHDPE: number; // percent
  nilaiDRM: number;
  nilaiRekon: number;
  boqCustomers: BOQItem[];
  boqIndikatifs: BOQItem[];
}

export interface BOQItem {
  id: string;
  boqId: string;
  category: string;
  designator: string;
  uraian: string;
  satuan: string;
  type: 'Material' | 'Jasa';
  hargaSatuan: number;
  qty: number;
  totalHarga: number;
  segmentasi?: Segmentasi[];
}

export interface Segmentasi {
  id: string;
  panjang: number; // meters
  startPoint: string;
  endPoint: string;
  cells: Cell[];
}

export interface Cell {
  id: string;
  lat: number;
  long: number;
  status: 'DONE' | 'IN_PROGRESS' | 'PENDING';
}
