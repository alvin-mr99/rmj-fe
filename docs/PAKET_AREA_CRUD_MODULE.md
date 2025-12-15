# Paket Area CRUD Module - Documentation

## 📋 Overview

Modul CRUD untuk mengelola Paket Area dengan fitur lengkap:
- ✅ Create, Read, Update, Delete (CRUD) Area
- ✅ Dynamic Sites Management (multiple sites per area)
- ✅ Dynamic Ruas Kontrak Sections (multiple ruas per site)
- ✅ Multiple Values per Field (repeatable inputs)
- ✅ State Management menggunakan SolidJS `createSignal`
- ✅ Data persistence dengan localStorage
- ✅ Fully typed dengan TypeScript

## 📁 File Structure

```
src/
├── types/
│   └── paketArea.ts              # TypeScript interfaces
├── services/
│   └── paketAreaService.ts       # localStorage CRUD operations
├── components/
│   ├── PaketAreaManager.tsx      # Main container component
│   ├── PaketAreaList.tsx         # List view with actions
│   ├── PaketAreaModal.tsx        # Modal form dengan tabs
│   ├── SiteSection.tsx           # Dynamic site form section
│   └── RuasKontrakSection.tsx    # Dynamic ruas kontrak section
```

## 🚀 Quick Start

### 1. Import dan gunakan di aplikasi Anda:

```tsx
import { PaketAreaManager } from './components/PaketAreaManager';

function App() {
  return (
    <div>
      <PaketAreaManager />
    </div>
  );
}
```

### 2. Atau gunakan component secara terpisah:

```tsx
import { createSignal, onMount } from 'solid-js';
import { PaketAreaList } from './components/PaketAreaList';
import { PaketAreaModal } from './components/PaketAreaModal';
import { paketAreaService } from './services/paketAreaService';

function CustomComponent() {
  const [areas, setAreas] = createSignal([]);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [editingArea, setEditingArea] = createSignal(null);

  onMount(() => {
    setAreas(paketAreaService.getAll());
  });

  return (
    <>
      <PaketAreaList
        areas={areas()}
        onAdd={() => setIsModalOpen(true)}
        onEdit={(area) => {
          setEditingArea(area);
          setIsModalOpen(true);
        }}
        onDelete={(id) => {
          paketAreaService.delete(id);
          setAreas(paketAreaService.getAll());
        }}
      />
      
      <PaketAreaModal
        isOpen={isModalOpen()}
        editingArea={editingArea()}
        onClose={() => setIsModalOpen(false)}
        onSave={(area) => {
          setAreas(paketAreaService.getAll());
          setIsModalOpen(false);
        }}
      />
    </>
  );
}
```

## 📊 Data Structure

### PaketArea
```typescript
interface PaketArea {
  id: string;
  areaId: string;          // e.g., "A-01"
  namaArea: string;        // e.g., "Area Jakarta Pusat"
  sites: Site[];
  createdAt: string;
  updatedAt: string;
}
```

### Site
```typescript
interface Site {
  id: string;
  kode: string;            // Site code
  mitra: string;           // Partner name
  witel: string;           // Witel name
  siteName: string;        // Site name
  ruasKontraks: RuasKontrak[];
}
```

### RuasKontrak
```typescript
interface RuasKontrak {
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

interface RuasKontrakField {
  id: string;
  values: string[];  // Multiple values per field!
}
```

## 🎯 Key Features

### 1. Dynamic Sites
- Tambah/hapus sites secara dinamis dalam form
- Setiap site memiliki form terpisah
- Tidak ada batasan jumlah sites

### 2. Dynamic Ruas Kontrak Sections
- Setiap site dapat memiliki multiple ruas kontrak
- Tambah/hapus ruas kontrak per site
- Setiap ruas adalah section terpisah, bukan row dalam tabel

### 3. Multiple Values per Field
- Setiap field dalam ruas kontrak dapat memiliki multiple values
- Implementasi: array of strings per field
- User dapat tambah/hapus value per field

**Example:**
```
Ruas Kontrak #1
├── No Ruas:
│   ├── R-001
│   ├── R-001A
│   └── R-001B
├── Nama Ruas:
│   ├── Ruas Utama
│   └── Ruas Alternatif
└── ...
```

### 4. localStorage Persistence
- Data otomatis disimpan ke localStorage
- Tidak ada API call / backend
- Data persisten antar session

### 5. Form dengan Tabs
- Tab "Informasi Dasar": Area ID & Nama Area
- Tab "Sites & Ruas Kontrak": Dynamic sections

## 🔧 Service API

### paketAreaService

```typescript
// Get all areas
const areas = paketAreaService.getAll();

// Get by ID
const area = paketAreaService.getById('pa-123');

// Create new
const newArea = paketAreaService.create({
  areaId: 'A-01',
  namaArea: 'Area Jakarta Pusat',
  sites: []
});

// Update
const updated = paketAreaService.update('pa-123', {
  namaArea: 'Area Jakarta Pusat (Updated)'
});

// Delete
const success = paketAreaService.delete('pa-123');

// Generate IDs
const areaId = paketAreaService.generateId();
const siteId = paketAreaService.generateSiteId();
const ruasId = paketAreaService.generateRuasId();

// Clear all data
paketAreaService.clear();
```

## 💾 localStorage Key

Data disimpan dengan key: `paket_areas`

```javascript
// Manual access (if needed)
const data = localStorage.getItem('paket_areas');
const areas = JSON.parse(data);
```

## 🎨 Styling

Module ini menggunakan Tailwind CSS classes. Pastikan Tailwind sudah dikonfigurasi di project Anda.

Jika perlu custom styling, edit class pada:
- `PaketAreaModal.tsx` - Modal dan tabs
- `PaketAreaList.tsx` - List cards
- `SiteSection.tsx` - Site sections
- `RuasKontrakSection.tsx` - Ruas sections

## 📝 Form Flow

1. User klik "Tambah Area Baru"
2. Modal terbuka dengan tab "Informasi Dasar"
3. User isi Area ID dan Nama Area
4. User pindah ke tab "Sites & Ruas Kontrak"
5. User klik "Tambah Site"
6. User isi data site (kode, mitra, witel, siteName)
7. User klik "Tambah Ruas Kontrak" di dalam site
8. User isi data ruas kontrak dengan multiple values
9. User dapat tambah value per field dengan tombol "+ Tambah"
10. User dapat tambah site dan ruas sebanyak yang diperlukan
11. User klik "Simpan"
12. Data tersimpan ke localStorage dan list diupdate

## 🔍 Validation

Basic validation yang sudah ada:
- Area ID dan Nama Area: required
- Site fields (kode, mitra, witel, siteName): required
- Minimum 1 value per field di ruas kontrak

Untuk validation tambahan, edit function `handleSubmit` di `PaketAreaModal.tsx`

## 🧪 Testing

Untuk test modul ini:

1. Buka aplikasi
2. Tambah area baru dengan beberapa sites
3. Tambah ruas kontrak dengan multiple values
4. Simpan dan cek localStorage
5. Refresh page - data harus tetap ada
6. Edit area yang sudah dibuat
7. Hapus area

## 🚨 Common Issues

### Modal tidak muncul?
- Cek z-index di CSS
- Pastikan `isOpen` prop bernilai true

### Data hilang setelah refresh?
- Cek browser localStorage
- Pastikan tidak ada error di console
- Cek quota localStorage (max 5-10MB per domain)

### Form tidak submit?
- Cek validation errors
- Cek console untuk error messages

## 🔄 Migration dari Mock Data

Jika ingin import mock data dari `mockProjects.ts`:

```typescript
import { mockProjects } from './data/mockProjects';
import { paketAreaService } from './services/paketAreaService';

// Convert dan import
mockProjects.forEach(project => {
  project.paketAreas.forEach(area => {
    paketAreaService.create({
      areaId: area.areaId,
      namaArea: area.namaArea,
      sites: area.lokasis.map(lokasi => ({
        id: lokasi.id,
        kode: lokasi.kode,
        mitra: lokasi.mitra,
        witel: lokasi.witel,
        siteName: lokasi.siteName,
        ruasKontraks: lokasi.ruasKontraks.map(ruas => ({
          id: ruas.id,
          noRuas: { id: `${ruas.id}-noRuas`, values: [ruas.noRuas] },
          namaRuas: { id: `${ruas.id}-namaRuas`, values: [ruas.namaRuas] },
          panjangKM: { id: `${ruas.id}-panjangKM`, values: [ruas.panjangKM.toString()] },
          volumeMeter: { id: `${ruas.id}-volumeMeter`, values: [ruas.volumeMeter.toString()] },
          progressGalian: { id: `${ruas.id}-progressGalian`, values: [ruas.progressGalian.toString()] },
          progressHDPE: { id: `${ruas.id}-progressHDPE`, values: [ruas.progressHDPE.toString()] },
          nilaiDRM: { id: `${ruas.id}-nilaiDRM`, values: [ruas.nilaiDRM.toString()] },
          nilaiRekon: { id: `${ruas.id}-nilaiRekon`, values: [ruas.nilaiRekon.toString()] },
        })),
      })),
    });
  });
});
```

## 📚 Further Customization

### Tambah field baru:
1. Update interfaces di `types/paketArea.ts`
2. Update form di component yang sesuai
3. Update conversion functions di `PaketAreaModal.tsx`

### Ganti localStorage dengan API:
1. Edit `paketAreaService.ts`
2. Ganti localStorage calls dengan fetch/axios
3. Handle async operations dengan createResource

### Tambah notification:
1. Install library seperti solid-toast
2. Panggil toast di handleSave, handleDelete, dll

## 📞 Support

Untuk pertanyaan atau issues, silakan buka issue di repository atau hubungi tim development.

---

**Happy Coding! 🚀**
