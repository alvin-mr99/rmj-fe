# RMJ Tools Implementation Guide

## Overview
RMJ Tools adalah modul baru yang ditambahkan ke aplikasi SmartWFM RMJ untuk mengelola Project Delivery Reengineering dengan sistem tabel yang dinamis dan terintegrasi.

## Fitur Utama

### 1. **Sitelist Project Management**
- Tabel interaktif menggunakan AG Grid Solid
- Pagination dengan opsi 15, 50, 100, 500 rows per page
- Multi-row selection dengan checkbox
- Sortable dan filterable columns
- Editable cells untuk update data langsung

### 2. **Search & Filter**
- Search box untuk mencari Unix ID, Site Name, dan field lainnya
- Filter dialog untuk filtering data berdasarkan kriteria tertentu
- Export/Import data dalam format Excel/CSV

### 3. **Batch Operations**
- Batch Update untuk update multiple rows sekaligus
- Import data dari file Excel/CSV
- Export data ke Excel/CSV

### 4. **Template View Settings**
- Simpan konfigurasi kolom yang ditampilkan
- Multiple templates untuk different use cases
- Locked columns yang selalu visible
- Custom column order

### 5. **User Management** (Coming Soon)
- Create/Edit/Delete users
- Role-based access control (Admin, Internal TI, Mitra)
- Different access levels per user/group

## Teknologi yang Digunakan

### AG Grid Solid
- **Package**: `ag-grid-community` + `ag-grid-solid`
- **Version**: Latest
- **Theme**: Alpine (customized)

### SolidJS
- Reactive framework untuk UI
- Signal-based state management

### TypeScript
- Type-safe development
- Enhanced IDE support

## Struktur File

```
src/
├── components/
│   ├── RMJModal.tsx          # Main RMJ modal component
│   └── SidebarNew.tsx        # Updated sidebar with RMJ menu
├── types/
│   └── index.ts              # RMJ type definitions
└── index.css                 # AG Grid custom styles
```

## Type Definitions

### RMJSitelistRow
```typescript
interface RMJSitelistRow {
  unixId: string;              // Primary key
  customerId: string;
  siteId: string;
  siteName: string;
  deliveryRegion?: string;
  areaName?: string;
  installation?: string;
  // ... more fields
  [key: string]: any;          // Dynamic columns
}
```

### RMJViewTemplate
```typescript
interface RMJViewTemplate {
  id: string;
  name: string;
  lockedColumns: string[];     // Always visible
  visibleColumns: string[];    // Visible in this template
  columnOrder?: string[];      // Custom order
  filters?: any;               // Saved filters
}
```

## Cara Menggunakan

### 1. Akses RMJ Tools
- Login ke aplikasi
- Klik menu **"RMJ Tools"** di sidebar (icon 📋)
- Modal akan terbuka dengan ukuran 90% dari layar

### 2. Navigasi Tab
- **Sitelist Project**: Tabel utama untuk manage data
- **Template Settings**: Konfigurasi tampilan kolom
- **User Management**: Manage users dan access levels

### 3. Operasi Tabel
- **Search**: Ketik di search box untuk filter data
- **Sort**: Klik header kolom untuk sort
- **Select**: Checkbox untuk select multiple rows
- **Edit**: Double-click cell untuk edit (jika editable)
- **Pagination**: Gunakan controls di bawah tabel

### 4. Batch Operations
- **Import**: Upload Excel/CSV file
- **Export**: Download data sebagai Excel/CSV
- **Batch Update**: Update multiple rows sekaligus

## Customization

### AG Grid Theme
Custom styles di `src/index.css`:
```css
.ag-theme-alpine {
  --ag-font-family: 'Poppins', sans-serif;
  --ag-font-size: 13px;
  --ag-header-height: 48px;
  --ag-row-height: 42px;
  /* ... more customization */
}
```

### Column Definitions
Edit di `src/components/RMJModal.tsx`:
```typescript
const columnDefs: ColDef[] = [
  { 
    field: 'unixId', 
    headerName: 'Unix ID', 
    pinned: 'left',
    checkboxSelection: true,
    width: 150,
  },
  // ... more columns
];
```

## Roadmap

### Phase 1 (Current) ✅
- [x] Basic table with AG Grid
- [x] Search functionality
- [x] Pagination
- [x] Column sorting and filtering
- [x] Multi-row selection

### Phase 2 (Next)
- [ ] Template view settings implementation
- [ ] Save/Load templates
- [ ] Column visibility toggle
- [ ] Custom column order

### Phase 3
- [ ] User management
- [ ] Role-based access control
- [ ] Import/Export functionality
- [ ] Batch update operations

### Phase 4
- [ ] Communication/Issue tracking
- [ ] History tracking
- [ ] Evidence/Document upload
- [ ] Advanced filtering

## API Integration (Future)

Untuk integrasi dengan backend:

```typescript
// Example API calls
const fetchSitelistData = async () => {
  const response = await fetch('/api/rmj/sitelist');
  return response.json();
};

const updateSitelistRow = async (unixId: string, data: Partial<RMJSitelistRow>) => {
  const response = await fetch(`/api/rmj/sitelist/${unixId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
};
```

## Troubleshooting

### AG Grid tidak muncul
- Pastikan CSS sudah di-import: `import 'ag-grid-community/styles/ag-grid.css'`
- Check console untuk errors

### Data tidak update
- Pastikan menggunakan `setRowData()` untuk update state
- Check reactive signals di SolidJS

### Performance issues
- Gunakan pagination untuk large datasets
- Enable virtual scrolling di AG Grid
- Optimize column definitions

## Support

Untuk pertanyaan atau issues:
1. Check dokumentasi AG Grid: https://www.ag-grid.com/
2. Check dokumentasi SolidJS: https://www.solidjs.com/
3. Contact development team

## License

Internal use only - Telkominfra
