# Project Grid - Global Column Settings Integration

## Overview

`ProjectGrid` sekarang mendukung **Global Column Settings** untuk **2 tabel berbeda**:
1. **Project Grid** - Tabel utama project list
2. **BoQ Grid** - Bill of Quantities dalam modal BoQ

User dapat memilih tabel mana yang ingin di-configure dari sidebar di Global Column Settings.

## 📊 Tabel yang Tersedia

### 1. Project Grid
**Metadata:**
- **ID**: `project_grid`
- **Nama**: Project Grid
- **Deskripsi**: Main project list with contract details
- **Kategori**: Projects
- **Lokasi**: Main Dashboard

**Kolom (8 kolom):**
| No | Field | Header Name | Locked |
|----|-------|-------------|---------|
| 1 | tahunProject | Tahun Proj... | No |
| 2 | program | Program | No |
| 3 | noKontrak | No Kontrak | No |
| 4 | regional | Regional | No |
| 5 | treg | TREG | No |
| 6 | planRFS | Plan RFS | No |
| 7 | currentMilestone | Current Milestone | No |
| 8 | action | Action | ✅ Yes (Right) |

### 2. BoQ Grid
**Metadata:**
- **ID**: `boq_grid`
- **Nama**: BoQ Grid
- **Deskripsi**: Bill of Quantities with cost breakdown
- **Kategori**: Projects
- **Lokasi**: BoQ Modal

**Kolom (8 kolom):**
| No | Field | Header Name | Locked |
|----|-------|-------------|---------|
| 1 | no | No | ✅ Yes (Left) |
| 2 | description | Description | No |
| 3 | category | Category | No |
| 4 | unit | Unit | No |
| 5 | quantity | Quantity | No |
| 6 | unitPrice | Unit Price (Rp) | No |
| 7 | totalPrice | Total Price (Rp) | ✅ Yes (Right) |
| 8 | notes | Notes | No |

## 🎯 Cara Menggunakan

### Dari Main Project Grid:

1. **Buka Column Settings**
   - Cara lama: Klik tombol "Column Settings" yang memicu event `open-column-settings`
   - Cara baru: Tombol ini akan membuka GlobalColumnSettings dengan 2 tabel

2. **Pilih Tabel**
   - Di sidebar kiri, Anda akan melihat 2 tabel: "Project Grid" dan "BoQ Grid"
   - Klik salah satu untuk melihat dan mengatur kolomnya

3. **Atur Kolom Project Grid**
   - Select/deselect kolom yang ingin ditampilkan
   - Klik "Apply to Grid" → Perubahan langsung terlihat di main grid
   - Opsional: Save sebagai template

### Dari BoQ Modal:

1. **Buka BoQ Modal**
   - Klik tombol "📋 BoQ" di salah satu row project

2. **Buka Column Settings di BoQ**
   - Klik tombol "Column Settings" di toolbar (sebelah kiri tombol Export)
   - GlobalColumnSettings akan terbuka dengan 2 tabel

3. **Atur Kolom BoQ Grid**
   - Pilih "BoQ Grid" dari sidebar
   - Select/deselect kolom yang ingin ditampilkan
   - Klik "Apply to Grid" → Perubahan langsung terlihat di BoQ grid
   - Opsional: Save sebagai template

4. **Switch ke Project Grid**
   - Dari modal yang sama, Anda bisa switch ke "Project Grid"
   - Atur kolom untuk main grid
   - Apply changes tanpa harus close modal BoQ

## 🔧 Implementasi Teknis

### 1. State Management

```typescript
const [gridApi, setGridApi] = createSignal<GridApi | null>(null);          // Main grid
const [boqGridApi, setBoqGridApi] = createSignal<GridApi | null>(null);    // BoQ grid
const [showColumnSettings, setShowColumnSettings] = createSignal(false);
```

### 2. Column Definitions

**Project Grid:**
```typescript
const [columnDefs] = createSignal<ColDef[]>([
  { field: 'tahunProject', headerName: 'Tahun Proj...', width: 110 },
  { field: 'program', headerName: 'Program', width: 150 },
  // ... 6 kolom lainnya
  { field: 'action', headerName: 'Action', pinned: 'right', ... }
]);
```

**BoQ Grid:**
```typescript
const [boqColumnDefs] = createSignal<ColDef[]>([
  { field: 'no', headerName: 'No', pinned: 'left', ... },
  { field: 'description', headerName: 'Description', ... },
  // ... 6 kolom lainnya
  { field: 'totalPrice', headerName: 'Total Price (Rp)', pinned: 'right', ... }
]);
```

### 3. Converter Functions

**Get Table Info:**
```typescript
const getProjectTableInfo = () => ({
  id: 'project_grid',
  name: 'Project Grid',
  description: 'Main project list with contract details',
  category: 'Projects',
  columnCount: columnDefs().length,
  location: 'Main Dashboard',
});

const getBoQTableInfo = () => ({
  id: 'boq_grid',
  name: 'BoQ Grid',
  description: 'Bill of Quantities with cost breakdown',
  category: 'Projects',
  columnCount: boqColumnDefs().length,
  location: 'BoQ Modal',
});
```

**Get Columns:**
```typescript
const getProjectColumns = () => 
  columnDefs().map(col => ({
    field: col.field || '',
    headerName: col.headerName || col.field || '',
    isLocked: col.pinned === 'left' || col.pinned === 'right',
  }));

const getBoQColumns = () => 
  boqColumnDefs().map(col => ({
    field: col.field || '',
    headerName: col.headerName || col.field || '',
    isLocked: col.pinned === 'left' || col.pinned === 'right',
  }));
```

**Get All Tables:**
```typescript
const getAllTables = () => [getProjectTableInfo(), getBoQTableInfo()];
```

**Get Columns For Table:**
```typescript
const getColumnsForTable = (tableId: string) => {
  switch (tableId) {
    case 'project_grid': return getProjectColumns();
    case 'boq_grid': return getBoQColumns();
    default: return [];
  }
};
```

**Get GridApi For Table:**
```typescript
const getGridApiForTable = (tableId: string): GridApi | null => {
  switch (tableId) {
    case 'project_grid': return gridApi();
    case 'boq_grid': return boqGridApi();
    default: return null;
  }
};
```

### 4. GlobalColumnSettings Integration

```tsx
<Show when={showColumnSettings()}>
  <GlobalColumnSettings
    gridApi={gridApi()}
    onClose={() => setShowColumnSettings(false)}
    tables={getAllTables()}
    getColumnsForTable={getColumnsForTable}
    getGridApiForTable={getGridApiForTable}
  />
</Show>
```

**Props Explanation:**
- `gridApi`: Default grid API (fallback)
- `tables`: Array of all available tables
- `getColumnsForTable`: Function to get columns by table ID
- `getGridApiForTable`: Function to get appropriate grid API by table ID

### 5. Multi-Grid API Support

GlobalColumnSettings telah di-update untuk support multiple grids:

**applyToGrid:**
```typescript
const applyToGrid = () => {
  const table = selectedTable()
  if (!table) return

  // Get the appropriate gridApi for the selected table
  const targetGridApi = props.getGridApiForTable 
    ? props.getGridApiForTable(table.id) 
    : props.gridApi;

  if (targetGridApi) {
    const selected = selectedColumns()
    currentColumns().forEach((col) => {
      const column = targetGridApi.getColumn(col.field)
      if (column) {
        targetGridApi.setColumnsVisible([col.field], selected.includes(col.field))
      }
    })
  }
}
```

**saveAsTemplate:**
```typescript
const saveAsTemplate = () => {
  // ...
  const targetGridApi = props.getGridApiForTable 
    ? props.getGridApiForTable(table.id) 
    : props.gridApi;

  const columnState = targetGridApi ? targetGridApi.getColumnState() : []
  // ...
}
```

**applyTemplate:**
```typescript
const applyTemplate = (template: ColumnTemplate) => {
  const table = selectedTable()
  
  const targetGridApi = props.getGridApiForTable && table
    ? props.getGridApiForTable(table.id) 
    : props.gridApi;
  
  if (targetGridApi && template.columnState.length > 0) {
    targetGridApi.applyColumnState({
      state: template.columnState,
      applyOrder: true,
    })
  }
  // ...
}
```

## 💾 Storage

Template tersimpan dengan key berbeda untuk setiap tabel:

- **Project Grid**: `column_templates_project_grid`
- **BoQ Grid**: `column_templates_boq_grid`

Format data sama seperti sebelumnya:
```json
[
  {
    "id": "template_1234567890",
    "name": "Basic View",
    "description": "Template untuk project grid",
    "lockedColumns": ["action"],
    "visibleColumns": ["tahunProject", "program", "noKontrak", ...],
    "columnState": [ /* AG Grid column state */ ],
    "createdAt": "2024-12-08T10:30:00.000Z",
    "createdBy": "user@example.com",
    "isPublic": false
  }
]
```

## 🎨 UI Enhancements

### BoQ Modal Toolbar
Sekarang ada 2 tombol di toolbar:
1. **Column Settings** (Biru) - Buka GlobalColumnSettings
2. **Export to Excel** (Hijau) - Export data BoQ

```tsx
<div class="flex gap-2">
  <button class="bg-blue-500 ...">
    Column Settings
  </button>
  <button class="bg-green-500 ...">
    Export to Excel
  </button>
</div>
```

## 🔄 Flow Diagram

```
User Action
    │
    ├─→ [Main Grid] Click "Column Settings"
    │       │
    │       └─→ Open GlobalColumnSettings
    │               │
    │               ├─→ Select "Project Grid" → Configure → Apply to Main Grid
    │               └─→ Select "BoQ Grid" → Configure → Apply to BoQ Grid
    │
    └─→ [BoQ Modal] Click "Column Settings"
            │
            └─→ Open GlobalColumnSettings
                    │
                    ├─→ Select "BoQ Grid" → Configure → Apply to BoQ Grid
                    └─→ Select "Project Grid" → Configure → Apply to Main Grid
```

## ✅ Features

### ✨ Implemented:
- [x] Multiple table selection in one modal
- [x] Independent column settings per table
- [x] Separate grid API handling
- [x] Template save/load per table
- [x] Column visibility toggle
- [x] Locked columns (pinned columns can't be hidden)
- [x] Apply settings to appropriate grid
- [x] Column Settings button in BoQ modal

### 🔮 Future Enhancements:
- [ ] Template sharing between users
- [ ] Default template per role
- [ ] Column reordering with drag-drop
- [ ] Custom column width presets
- [ ] Export/Import templates
- [ ] Column grouping configurations
- [ ] Filter presets per template

## 🐛 Known Limitations

1. **Grid API Availability**: Grid harus sudah di-render dan ready sebelum bisa apply settings
   - Solution: Grid API disimpan saat `onGridReady` event
   
2. **BoQ Grid dari Main Grid**: Kalau belum pernah buka BoQ modal, boqGridApi masih null
   - Solution: Settings akan applied otomatis saat BoQ modal pertama kali dibuka
   
3. **Template Column State**: Column state mungkin tidak compatible jika column definitions berubah drastis
   - Solution: Validasi template sebelum apply

## 🧪 Testing

### Test Scenarios:

#### 1. Project Grid Settings
```
1. Buka Project Grid
2. Klik "Column Settings" (trigger open-column-settings event)
3. Verify: Modal terbuka, sidebar show 2 tables
4. Select "Project Grid"
5. Uncheck beberapa kolom (except locked)
6. Klik "Apply to Grid"
7. Verify: Kolom tersembunyi di main grid
```

#### 2. BoQ Grid Settings
```
1. Buka BoQ Modal (klik button BoQ di any project)
2. Klik "Column Settings" di toolbar
3. Verify: Modal terbuka, sidebar show 2 tables
4. Select "BoQ Grid"
5. Uncheck kolom "notes" dan "category"
6. Klik "Apply to Grid"
7. Verify: Kolom tersembunyi di BoQ grid
```

#### 3. Cross-Grid Settings
```
1. Dari BoQ Modal, klik "Column Settings"
2. Select "Project Grid" (bukan BoQ Grid)
3. Atur kolom main grid
4. Klik "Apply to Grid"
5. Close BoQ Modal
6. Verify: Perubahan terlihat di main grid
```

#### 4. Template Save/Load
```
1. Buka Column Settings
2. Select "Project Grid"
3. Atur visibility kolom
4. Klik "Save Template"
5. Isi nama: "My Project View"
6. Save
7. Ubah visibility kolom
8. Klik "Apply" di template "My Project View"
9. Verify: Kolom kembali ke saved state
```

## 📚 Related Files

- `/src/components/ProjectGrid.tsx` - Main component
- `/src/components/GlobalColumnSettings.tsx` - Column settings modal
- `/docs/GLOBAL_COLUMN_SETTINGS_INTEGRATION.md` - RMJModal integration doc

## 🆘 Troubleshooting

### Issue: Column Settings tidak apply
**Cause**: Grid API belum ready
**Solution**: Pastikan grid sudah ter-render, check console untuk error

### Issue: BoQ Grid settings tidak apply dari main grid
**Cause**: BoQ Modal belum pernah dibuka, boqGridApi masih null
**Solution**: Buka BoQ modal setidaknya sekali, atau implement lazy initialization

### Issue: Template tidak sesuai dengan kolom aktual
**Cause**: Column definitions berubah setelah template disave
**Solution**: Delete template dan create new template dengan kolom terbaru

## 💡 Tips

1. **Save Template Regularly**: Buat template untuk view yang sering digunakan
2. **Descriptive Names**: Gunakan nama template yang jelas (e.g., "Admin Full View", "Partner Basic View")
3. **Test Both Grids**: Setelah apply settings, test kedua grid untuk ensure consistency
4. **Backup Templates**: Export template configurations secara periodik

---

**Last Updated**: December 8, 2024
**Version**: 1.0
**Author**: Development Team
