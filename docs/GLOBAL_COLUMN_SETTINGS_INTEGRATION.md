# Global Column Settings Integration

## Overview

`GlobalColumnSettings` telah diintegrasikan dengan `RMJModal` untuk mengatur kolom dari tabel Sitelist Project. Sekarang Anda dapat menggunakan data real dari tabel sitelist daripada mock data.

## Cara Penggunaan

### 1. Membuka Column Settings dari RMJ Modal

Ketika Anda berada di tab "Sitelist Project" di RMJ Modal:
1. Klik tombol **"Column Settings"** di header
2. Modal Global Column Settings akan terbuka
3. Table "RMJ Sitelist" akan otomatis terseleksi

### 2. Fitur yang Tersedia

#### a. Melihat Informasi Tabel
- **Nama**: RMJ Sitelist
- **Deskripsi**: Project site list with installation details
- **Kategori**: Projects
- **Jumlah Kolom**: Menampilkan total kolom yang tersedia
- **Lokasi**: RMJ Modal

#### b. Mengatur Visibility Kolom
- ✅ **Select All**: Menampilkan semua kolom
- ❌ **Clear Selection**: Menyembunyikan semua kolom (kecuali yang locked)
- 🔒 **Locked Columns**: Kolom yang di-pin (Unix ID, Action) tidak dapat disembunyikan
- ✏️ **Toggle Individual**: Klik checkbox untuk show/hide kolom tertentu

#### c. Apply Settings ke Grid
- Klik tombol **"Apply to Grid"** untuk menerapkan perubahan visibility
- Perubahan akan langsung terlihat di AG Grid

#### d. Menyimpan Template
1. Atur kolom sesuai keinginan
2. Klik tombol **"Save Template"**
3. Isi nama dan deskripsi template
4. Pilih apakah template bersifat public atau private
5. Klik **"Save Template"**
6. Template tersimpan di localStorage

#### e. Menggunakan Saved Templates
- Lihat daftar template yang tersimpan
- Klik **"Apply"** untuk menggunakan template
- Klik **"Delete"** untuk menghapus template
- Expand template untuk melihat detail kolom

## Struktur Kode

### 1. Props GlobalColumnSettings

```typescript
interface GlobalColumnSettingsProps {
    gridApi: GridApi | null              // AG Grid API instance
    userEmail?: string                   // Email user untuk tracking
    onClose: () => void                  // Handler untuk close modal
    tables?: TableInfo[]                 // (Optional) List semua tabel
    getColumnsForTable?: (tableId: string) => ColumnInfo[]  // (Optional) Getter columns
    getTemplatesForTable?: (tableId: string) => ColumnTemplate[]  // (Optional) Getter templates
    // New props untuk direct integration
    currentTableInfo?: TableInfo         // Info tabel yang aktif
    currentColumns?: ColumnInfo[]        // Daftar kolom tabel aktif
}
```

### 2. Data yang Dikirim dari RMJModal

#### Table Info
```typescript
{
  id: 'rmj_sitelist',
  name: 'RMJ Sitelist',
  description: 'Project site list with installation details',
  category: 'Projects',
  columnCount: 20,  // jumlah kolom dari columnDefs
  location: 'RMJ Modal'
}
```

#### Columns Info
Dikonversi dari AG Grid `ColDef[]` menjadi:
```typescript
[
  {
    field: 'unixId',
    headerName: 'Unix ID',
    isLocked: true  // karena pinned: 'left'
  },
  {
    field: 'customerId',
    headerName: 'Customer ID',
    isLocked: false
  },
  // ... kolom lainnya
  {
    field: 'action',
    headerName: 'Action',
    isLocked: true  // karena pinned: 'right'
  }
]
```

### 3. State Management di RMJModal

```typescript
// State untuk show/hide modal
const [showGlobalColumnSettings, setShowGlobalColumnSettings] = createSignal(false);

// Function untuk convert metadata
const getSitelistTableInfo = () => { ... }
const getSitelistColumns = () => { ... }
```

### 4. Render GlobalColumnSettings

```tsx
<Show when={showGlobalColumnSettings()}>
  <GlobalColumnSettings
    gridApi={gridApi()}
    userEmail={props.userEmail}
    onClose={() => setShowGlobalColumnSettings(false)}
    currentTableInfo={getSitelistTableInfo()}
    currentColumns={getSitelistColumns()}
  />
</Show>
```

## Kolom RMJ Sitelist

Berikut daftar kolom yang tersedia:

| No | Field Name | Header Name | Locked |
|----|-----------|-------------|---------|
| 1 | unixId | Unix ID | ✅ Yes (Left) |
| 2 | customerId | Customer ID | No |
| 3 | siteId | Site ID | No |
| 4 | siteName | Site Name | No |
| 5 | deliveryRegion | Delivery Region | No |
| 6 | areaName | Area Name | No |
| 7 | installation | Installation | No |
| 8 | wiDnUgas | WI DN Ugas | No |
| 9 | subcontractor | Subcontractor | No |
| 10 | siteOwner | Site Owner | No |
| 11 | installationPd | Installation PD | No |
| 12 | wiWeeklyPlan | WI Weekly Plan | No |
| 13 | mosCnInstallationCompleted | MOS CN Installation | No |
| 14 | planEndDate | Plan End Date | No |
| 15 | actualEndDate | Actual End Date | No |
| 16 | owner | Owner | No |
| 17 | milestone1 | Milestone 1 | No |
| 18 | milestone2 | Milestone 2 | No |
| 19 | milestone3 | Milestone 3 | No |
| 20 | action | Action | ✅ Yes (Right) |

## Storage

Template disimpan di **localStorage** dengan key:
```
column_templates_rmj_sitelist
```

Format data:
```json
[
  {
    "id": "template_1234567890",
    "name": "Basic View",
    "description": "View dasar untuk sitelist",
    "lockedColumns": ["unixId"],
    "visibleColumns": ["unixId", "siteId", "siteName", "..."],
    "columnState": [ /* AG Grid column state */ ],
    "createdAt": "2024-12-08T10:30:00.000Z",
    "createdBy": "user@example.com",
    "isPublic": true,
    "userRole": "Admin"
  }
]
```

## Future Enhancements

### Planned Features:
1. ✨ **Multi-table Support**: Tambahkan tabel lain (Report RMJ, User Management)
2. 🔄 **Template Sync**: Sync template antar user (backend integration)
3. 📊 **Column Analytics**: Track kolom yang sering digunakan
4. 🎨 **Custom Styling**: Atur warna dan format per kolom
5. 📱 **Responsive Templates**: Template khusus untuk mobile view
6. 🔐 **Role-based Templates**: Template berdasarkan user role
7. 💾 **Export/Import Templates**: Share template antar user

### Known Limitations:
- Template hanya tersimpan di localStorage (per browser)
- Belum ada validasi duplicate template name
- Column reordering belum terintegrasi dengan drag-drop

## Testing

### Manual Testing Steps:

1. **Basic Flow**:
   ```
   - Buka RMJ Modal
   - Klik tab "Sitelist Project"
   - Klik tombol "Column Settings"
   - Verify: Modal terbuka dengan tabel "RMJ Sitelist" terseleksi
   - Verify: Semua 20 kolom terlihat di list
   ```

2. **Hide/Show Columns**:
   ```
   - Uncheck beberapa kolom (non-locked)
   - Klik "Apply to Grid"
   - Verify: Kolom tersembunyi di AG Grid
   - Check kembali kolom tersebut
   - Klik "Apply to Grid"
   - Verify: Kolom muncul kembali
   ```

3. **Save Template**:
   ```
   - Atur visibility kolom
   - Klik "Save Template"
   - Isi nama: "Test Template"
   - Isi deskripsi: "Template untuk testing"
   - Klik "Save Template"
   - Verify: Template muncul di list "Saved Templates"
   ```

4. **Apply Template**:
   ```
   - Ubah visibility kolom secara manual
   - Klik "Apply" pada saved template
   - Verify: Kolom berubah sesuai template
   ```

5. **Delete Template**:
   ```
   - Klik "Delete" pada template
   - Confirm delete
   - Verify: Template hilang dari list
   ```

## Troubleshooting

### Issue: Modal tidak muncul
**Solution**: Pastikan `gridApi` sudah initialized (grid sudah ready)

### Issue: Column visibility tidak berubah
**Solution**: 
- Check console untuk error
- Pastikan field name di template match dengan AG Grid colDef
- Refresh browser dan try again

### Issue: Template tidak tersimpan
**Solution**:
- Check browser localStorage quota
- Clear localStorage dan try again
- Check console untuk localStorage errors

## Support

Untuk pertanyaan atau issue, silakan hubungi tim development atau buat issue di repository.
