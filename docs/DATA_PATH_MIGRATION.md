# Migrasi Path Data dari Public ke Src

## Ringkasan
File-file default BoQ dan KML telah dipindahkan dari `public/data/` ke `src/data/` agar dapat di-bundle oleh Vite dan tersedia setelah build.

## Perubahan

### 1. Struktur Folder
**Sebelum:**
```
public/data/
├── BoQ/
│   ├── boq-bundaran-hi.xlsx
│   ├── boq-monas-dki.xlsx
│   ├── boq-senayan.xlsx
│   └── boq-thamrin.xlsx
└── KML/
    ├── kml-bundaran-hi.kml
    ├── kml-monas-dki.kml
    ├── kml-senayan.kml
    └── kml-thamrin.kml
```

**Sesudah:**
```
src/data/
├── BoQ/
│   ├── boq-bundaran-hi.xlsx
│   ├── boq-monas-dki.xlsx
│   ├── boq-senayan.xlsx
│   └── boq-thamrin.xlsx
└── KML/
    ├── kml-bundaran-hi.kml
    ├── kml-monas-dki.kml
    ├── kml-senayan.kml
    └── kml-thamrin.kml
```

### 2. File yang Diubah

#### `src/services/ProjectLoader.ts`
- **Sebelum:** Menggunakan `fetch()` untuk load file dari path public
- **Sesudah:** Menggunakan ES6 import dengan Vite special queries:
  - File KML: `import kmlFile from '../data/KML/file.kml?raw'` (sebagai raw text)
  - File BoQ: `import boqUrl from '../data/BoQ/file.xlsx?url'` (sebagai URL)

#### `vite.config.ts`
- Menambahkan `assetsInclude: ['**/*.kml', '**/*.xlsx']` untuk mendukung import file KML dan XLSX

#### `src/vite-env.d.ts` (Baru)
- Menambahkan type declarations untuk:
  - `*.kml?raw` → string
  - `*.xlsx?url` → string
  - `*.kml?url` → string

## Keuntungan

1. **Bundle Optimization**: File KML di-inline sebagai string dalam JavaScript bundle, mengurangi HTTP requests
2. **Build Reliability**: File BoQ dan KML dijamin tersedia setelah build
3. **Type Safety**: TypeScript mengenali import file KML dan XLSX
4. **No Runtime Errors**: Tidak ada lagi error "file not found" saat aplikasi di-deploy

## Cara Kerja

### Import KML sebagai Raw Text
```typescript
import kmlContent from '../data/KML/file.kml?raw';
// kmlContent adalah string berisi konten KML
const geoJson = convertKmlToGeoJson(kmlContent);
```

### Import XLSX sebagai URL
```typescript
import boqUrl from '../data/BoQ/file.xlsx?url';
// boqUrl adalah URL yang di-generate oleh Vite
const response = await fetch(boqUrl);
const blob = await response.blob();
```

## Testing

Build berhasil dengan output:
```
✓ 382 modules transformed.
dist/assets/boq-senayan-CzWT0b7M.xlsx          9.51 kB
dist/assets/boq-thamrin-BREonqC5.xlsx          9.61 kB
dist/assets/boq-bundaran-hi-BWaVPHvm.xlsx      9.61 kB
dist/assets/boq-monas-dki-bWcRj3wy.xlsx        9.72 kB
```

File BoQ ter-bundle di `dist/assets/` dengan hash untuk cache busting.
File KML di-inline dalam JavaScript bundle (tidak terlihat sebagai file terpisah).

## Catatan

- Folder `public/data/BoQ` dan `public/data/KML` masih ada untuk backward compatibility
- Jika ingin menghapus folder tersebut, pastikan tidak ada referensi lain yang menggunakannya
- File-file di `src/data/` akan otomatis ter-bundle saat build
