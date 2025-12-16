// Types for Paket Area CRUD Module

export interface RuasKontrakField {
  id: string;
  values: string[]; // Multiple values per field
}

export interface RuasKontrak {
  id: string;
  noRuas: RuasKontrakField;
  namaRuas: RuasKontrakField;
  panjangKM: RuasKontrakField;
  volumeMeter: RuasKontrakField;
  progressGalian: RuasKontrakField;
  progressHDPE: RuasKontrakField;
  nilaiDRM: RuasKontrakField;
  nilaiRekon: RuasKontrakField;
}

export interface Site {
  id: string;
  kode: string;
  mitra: string;
  witel: string;
  siteName: string;
  ruasKontraks: RuasKontrak[];
}

export interface PaketArea {
  id: string;
  areaId: string;
  namaArea: string;
  sites: Site[];
  createdAt: string;
  updatedAt: string;
}

// Form state types
export interface RuasKontrakFormState {
  id: string;
  noRuas: string[];
  namaRuas: string[];
  panjangKM: string[];
  volumeMeter: string[];
  progressGalian: string[];
  progressHDPE: string[];
  nilaiDRM: string[];
  nilaiRekon: string[];
}

export interface SiteFormState {
  id: string;
  kode: string;
  mitra: string;
  witel: string;
  siteName: string;
  ruasKontraks: RuasKontrakFormState[];
}

export interface PaketAreaFormState {
  id: string;
  areaId: string;
  namaArea: string;
  sites: SiteFormState[];
}
