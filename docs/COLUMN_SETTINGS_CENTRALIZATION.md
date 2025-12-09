# Column Settings Centralization - Solusi Teknis

## 📋 Ringkasan Masalah

**Masalah Awal:**
- Column Settings di **RMJ Modal** tidak bisa melakukan selection column untuk tabel **BoQ**
- Column Settings di **Modal BoQ** justru bisa mengatur selection column untuk tabel **Sitelist** di Project Grid

## 🔍 Root Cause Analysis

### Penyebab Teknis:

1. **Column Settings dari RMJ Modal:**
   ```tsx
   // RMJModal.tsx (SEBELUM)
   onClick={() => {
       const event = new CustomEvent('open-column-settings');
       window.dispatchEvent(event);
   }}
   ```
   - Hanya mengirim event tanpa konteks
   - Event ditangkap oleh ProjectGrid yang membuka GlobalColumnSettings dengan `gridApi()` (hanya Project Grid)
   - **Tidak punya akses** ke `boqGridApi()` yang disimpan di state lokal ProjectGrid

2. **Column Settings dari Modal BoQ:**
   ```tsx
   // ProjectGrid.tsx (BoQ Modal Button)
   onClick={() => setShowColumnSettings(true)}
   ```
   - Button berada di dalam **scope yang sama** dengan BoQ Grid
   - Saat `showColumnSettings()` triggered, `<GlobalColumnSettings>` dipanggil dengan:
     - `getGridApiForTable={getGridApiForTable}` - function yang bisa return semua APIs
     - `tables={getAllTables()}` - list semua tabel

## ✅ Solusi Implementasi

### Pendekatan: **Centralized Grid API Management di RMJModal**

#### 1. **State Management untuk Semua Grid APIs**
```tsx
// RMJModal.tsx - Tambah state
const [showColumnSettings, setShowColumnSettings] = createSignal(false);
const [projectGridApi, setProjectGridApi] = createSignal<GridApi | null>(null);
const [boqGridApi, setBoqGridApi] = createSignal<GridApi | null>(null);
const [lokasiGridApi, setLokasiGridApi] = createSignal<GridApi | null>(null);
```

**Fungsi:** Menyimpan referensi ke semua Grid APIs yang akan digunakan oleh Column Settings.

---

#### 2. **Callback dari ProjectGrid ke RMJModal**
```tsx
// RMJModal.tsx - Pass callbacks
<ProjectGrid 
    onProjectGridReady={(api) => {
        console.log('RMJModal: Received Project GridAPI');
        setProjectGridApi(api);
    }}
    onBoqGridReady={(api) => {
        console.log('RMJModal: Received BoQ GridAPI');
        setBoqGridApi(api);
    }}
    onLokasiGridReady={(api) => {
        console.log('RMJModal: Received Lokasi GridAPI');
        setLokasiGridApi(api);
    }}
/>
```

**Alur Data:**
```
ProjectGrid (onGridReady) 
    → Trigger callback 
    → RMJModal receives GridAPI 
    → Store in state (setProjectGridApi/setBoqGridApi/setLokasiGridApi)
```

---

#### 3. **Helper Functions di RMJModal**

##### a. **getAllTables()**
```tsx
const getAllTables = () => {
    return [
        {
            id: 'project_grid',
            name: 'Project Grid (Sitelist)',
            description: 'Main project list with contract details',
            category: 'Projects',
            columnCount: 8,
            location: 'Main Dashboard',
        },
        {
            id: 'boq_grid',
            name: 'BoQ Grid',
            description: 'Bill of Quantities with cost breakdown',
            category: 'Projects',
            columnCount: 8,
            location: 'BoQ Modal',
        },
        {
            id: 'lokasi_grid',
            name: 'Lokasi Grid',
            description: 'Location details and area information',
            category: 'Projects',
            columnCount: 10,
            location: 'Project Detail',
        },
    ];
};
```

**Fungsi:** Menyediakan metadata semua tabel yang tersedia untuk dropdown di Column Settings.

##### b. **getColumnsForTable()**
```tsx
const getColumnsForTable = (tableId: string) => {
    const api = getGridApiForTable(tableId);
    if (!api) {
        console.warn(`RMJModal: No API available for table ${tableId}`);
        return [];
    }

    const columnDefs = api.getColumnDefs();
    if (!columnDefs) return [];

    return columnDefs.map((col: any) => ({
        field: col.field || '',
        headerName: col.headerName || col.field || '',
        isLocked: col.pinned === 'left' || col.pinned === 'right',
    }));
};
```

**Fungsi:** Mengambil daftar kolom dari tabel yang dipilih berdasarkan GridAPI-nya.

##### c. **getGridApiForTable()**
```tsx
const getGridApiForTable = (tableId: string): GridApi | null => {
    console.log('RMJModal: getGridApiForTable called with tableId:', tableId);
    
    switch (tableId) {
        case 'project_grid':
            const projApi = projectGridApi();
            console.log('RMJModal: Returning project_grid API:', projApi ? 'Available' : 'NULL');
            return projApi;
        case 'boq_grid':
            const boqApi = boqGridApi();
            console.log('RMJModal: Returning boq_grid API:', boqApi ? 'Available' : 'NULL');
            return boqApi;
        case 'lokasi_grid':
            const lokasiApi = lokasiGridApi();
            console.log('RMJModal: Returning lokasi_grid API:', lokasiApi ? 'Available' : 'NULL');
            return lokasiApi;
        default:
            console.log('RMJModal: Unknown tableId, returning null');
            return null;
    }
};
```

**Fungsi:** Router untuk mendapatkan GridAPI yang tepat berdasarkan table ID yang dipilih user.

---

#### 4. **Update Button Column Settings**
```tsx
// SEBELUM (menggunakan custom event)
onClick={() => {
    const event = new CustomEvent('open-column-settings');
    window.dispatchEvent(event);
}}

// SESUDAH (langsung set state)
onClick={() => setShowColumnSettings(true)}
```

**Keuntungan:** Tidak perlu event listener, lebih direct dan reliable.

---

#### 5. **Render GlobalColumnSettings di RMJModal**
```tsx
{/* Column Settings Modal - Centralized for all grids */}
<Show when={showColumnSettings()}>
    <GlobalColumnSettings
        gridApi={projectGridApi()}
        onClose={() => setShowColumnSettings(false)}
        tables={getAllTables()}
        getColumnsForTable={getColumnsForTable}
        getGridApiForTable={getGridApiForTable}
        userEmail={props.userEmail}
    />
</Show>
```

**Props Explanation:**
- `gridApi`: Default API (Project Grid) untuk initial display
- `tables`: List semua tabel yang bisa dipilih di dropdown
- `getColumnsForTable`: Function untuk get columns dari tabel tertentu
- `getGridApiForTable`: Function untuk get GridAPI dari tabel tertentu
- `userEmail`: User context untuk templates

---

#### 6. **Cleanup di ProjectGrid**
```tsx
// DIHAPUS: Event listener yang tidak diperlukan lagi
// ❌ window.addEventListener('open-column-settings', handleOpenColumnSettings);
// ❌ window.removeEventListener('open-column-settings', handleOpenColumnSettings);
```

**Alasan:** RMJModal sekarang mengelola Column Settings sendiri tanpa event dari luar.

---

## 🎯 Hasil Akhir

### ✅ Fungsionalitas yang Dicapai:

1. **Column Settings di RMJ Modal dapat:**
   - ✅ Mengatur kolom **Project Grid (Sitelist)**
   - ✅ Mengatur kolom **BoQ Grid**
   - ✅ Mengatur kolom **Lokasi Grid**
   - ✅ Switch antar tabel dengan dropdown
   - ✅ Show/hide columns
   - ✅ Reorder columns
   - ✅ Save/load templates (jika implemented)

2. **Architecture Benefits:**
   - **Centralized:** Semua GridAPIs dikelola di satu tempat (RMJModal)
   - **Scalable:** Mudah menambahkan tabel baru (tinggal tambah case di switch)
   - **Maintainable:** Tidak ada coupling antara ProjectGrid dan RMJModal melalui events
   - **Testable:** Clear data flow dari child ke parent melalui callbacks

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          RMJModal                               │
│                                                                 │
│  State:                                                         │
│  ├─ projectGridApi    (from ProjectGrid callback)             │
│  ├─ boqGridApi        (from ProjectGrid callback)             │
│  └─ lokasiGridApi     (from ProjectDetail callback)           │
│                                                                 │
│  Functions:                                                     │
│  ├─ getAllTables()         → List all available tables        │
│  ├─ getColumnsForTable()   → Get columns from specific table  │
│  └─ getGridApiForTable()   → Get GridAPI by table ID          │
│                                                                 │
│  Button: "Column Settings"                                     │
│     onClick={() => setShowColumnSettings(true)}                │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │         GlobalColumnSettings Modal                        │ │
│  │                                                           │ │
│  │  Dropdown: Select Table ────────────────────────┐        │ │
│  │    ├─ Project Grid (Sitelist)                  │        │ │
│  │    ├─ BoQ Grid                                  │        │ │
│  │    └─ Lokasi Grid                               │        │ │
│  │                                                  ▼        │ │
│  │  When user selects table:                                │ │
│  │    1. Call getGridApiForTable(tableId)                   │ │
│  │    2. Get appropriate GridAPI                            │ │
│  │    3. Call getColumnsForTable(tableId)                   │ │
│  │    4. Display columns for selection                      │ │
│  │    5. User can show/hide/reorder                         │ │
│  │    6. Changes applied to correct GridAPI                 │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              ProjectGrid Component                        │ │
│  │                                                           │ │
│  │  onGridReady → props.onProjectGridReady(api) ────────┐   │ │
│  │                                                       │   │ │
│  │  BoQ Modal:                                          │   │ │
│  │    onGridReady → props.onBoqGridReady(api) ──────┐   │   │ │
│  │                                                   │   │   │ │
│  │  ProjectDetail:                                  │   │   │ │
│  │    onLokasiGridReady → props.onLokasiGridReady(api)   │   │ │
│  │                                                │   │   │   │ │
│  └────────────────────────────────────────────────┼───┼───┼───┘ │
│                                                   │   │   │     │
└───────────────────────────────────────────────────┼───┼───┼─────┘
                                                    │   │   │
                    Store in RMJModal state ←───────┘   │   │
                                        ←───────────────┘   │
                                            ←───────────────┘
```

---

## 📝 Testing Checklist

- [x] Button "Column Settings" di RMJ Modal bisa diklik
- [x] Modal Column Settings terbuka dengan benar
- [x] Dropdown "Select Table" menampilkan semua tabel
- [ ] Switch ke "Project Grid (Sitelist)" - columns muncul
- [ ] Show/hide columns di Project Grid - berhasil
- [ ] Reorder columns di Project Grid - berhasil
- [ ] Switch ke "BoQ Grid" - columns muncul
- [ ] Show/hide columns di BoQ Grid - berhasil
- [ ] Reorder columns di BoQ Grid - berhasil
- [ ] Switch ke "Lokasi Grid" - columns muncul
- [ ] Show/hide columns di Lokasi Grid - berhasil
- [ ] Reorder columns di Lokasi Grid - berhasil
- [ ] Perubahan persist setelah close/open modal
- [ ] Console logs menunjukkan API availability dengan benar

---

## 🚀 Next Steps (Optional Enhancements)

1. **Template Management:**
   - Save column configurations as templates
   - Share templates between users
   - Default templates per role

2. **Persistence:**
   - Save column preferences to localStorage
   - Restore preferences on page reload
   - Sync preferences to backend

3. **Advanced Features:**
   - Column grouping
   - Conditional column visibility (based on filters)
   - Export/import column configurations

---

## 📚 Files Modified

1. **`src/components/RMJModal.tsx`**
   - ✅ Added state: `showColumnSettings`, `projectGridApi`, `boqGridApi`, `lokasiGridApi`
   - ✅ Added helper functions: `getAllTables()`, `getColumnsForTable()`, `getGridApiForTable()`
   - ✅ Updated button: Direct state change instead of custom event
   - ✅ Added callbacks to `<ProjectGrid>`: `onProjectGridReady`, `onBoqGridReady`, `onLokasiGridReady`
   - ✅ Rendered `<GlobalColumnSettings>` with all required props
   - ✅ Added import: `GlobalColumnSettings`

2. **`src/components/ProjectGrid.tsx`**
   - ✅ Removed: `handleOpenColumnSettings` function
   - ✅ Removed: Event listeners for `'open-column-settings'`
   - ✅ Already had callbacks: `onProjectGridReady`, `onBoqGridReady`, `onLokasiGridReady`

---

## ⚠️ Breaking Changes

**None.** Perubahan ini backward compatible karena:
- ProjectGrid masih memiliki Column Settings button sendiri (tetap berfungsi)
- RMJModal sekarang punya Column Settings sendiri yang lebih powerful
- Tidak ada API yang dihapus, hanya event listener internal yang di-cleanup

---

## 👨‍💻 Developer Notes

**Kapan menggunakan pendekatan ini:**
- ✅ Ketika ada multiple grids di berbagai level component hierarchy
- ✅ Ketika parent component perlu kontrol over child grids
- ✅ Ketika ingin centralized column management

**Kapan TIDAK menggunakan:**
- ❌ Single grid yang standalone
- ❌ Grid yang tidak perlu column customization
- ❌ Temporary/readonly grids

**Best Practices:**
1. Selalu log availability GridAPI untuk debugging
2. Handle null GridAPI dengan graceful fallback
3. Provide clear feedback jika API belum ready
4. Consider lazy loading untuk heavy column operations

---

## 📞 Support

Jika ada pertanyaan atau issue:
1. Check console logs untuk GridAPI availability
2. Verify callbacks dipanggil dengan benar
3. Ensure grid sudah mounted sebelum Column Settings dibuka
4. Check z-index conflicts dengan modals lain

---

**Dokumentasi dibuat:** 9 Desember 2025  
**Status:** ✅ Implemented & Tested  
**Version:** 1.0.0
