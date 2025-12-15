# Paket Area Unified Modal - Implementation Guide

## 📋 Overview

Implementasi **Unified Modal** untuk CRUD Paket Area yang mengintegrasikan semua level (Area, Lokasi, dan Ruas Kontrak) dalam **satu form modal**. User dapat melakukan create/edit untuk semua level sekaligus dalam satu interface yang kohesif.

## 🎯 Key Features

### 1. Single Modal for All Operations
- ✅ **Create**: Tambah Area + Multiple Lokasi + Multiple Ruas sekaligus
- ✅ **Edit**: Edit semua data (Area, Lokasi, Ruas) dalam satu form
- ✅ **Nested Structure**: Menampilkan hierarki data dengan accordion/collapse
- ✅ **Reactive Forms**: Semua field update secara reaktif

### 2. User Experience Improvements
- 🎨 **Color-coded Sections**: 
  - Area = Blue
  - Lokasi = Purple  
  - Ruas Kontrak = Orange
- 📊 **Real-time Summary**: Menampilkan jumlah lokasi dan ruas di footer
- 🔄 **Expandable Lokasi**: Klik untuk expand/collapse detail lokasi
- ✨ **Clean UI**: Interface yang intuitif dan mudah digunakan

### 3. Validation & Error Handling
- ✅ Minimal 1 lokasi harus diisi
- ✅ Semua required fields tervalidasi
- ✅ Konfirmasi sebelum delete

## 📁 File Structure

```
src/components/
├── PaketAreaUnifiedModal.tsx    # NEW - Modal unified untuk CRUD
├── ProjectDetail.tsx             # UPDATED - Simplified handlers
├── AreaModal.tsx                 # DEPRECATED - Tidak digunakan lagi
├── LokasiModal.tsx               # DEPRECATED - Tidak digunakan lagi
└── RuasModal.tsx                 # DEPRECATED - Tidak digunakan lagi
```

## 🚀 Usage

### Opening the Modal

```tsx
// Add New Area
<button onClick={() => {
  setEditingPaketArea(null);
  setShowUnifiedModal(true);
}}>
  Add Area
</button>

// Edit Existing Area
<button onClick={() => {
  setEditingPaketArea(paketAreaData);
  setShowUnifiedModal(true);
}}>
  Edit Area
</button>
```

### Modal Component

```tsx
<PaketAreaUnifiedModal
  show={showUnifiedModal()}
  onClose={() => {
    setShowUnifiedModal(false);
    setEditingPaketArea(null);
  }}
  onSave={handleSavePaketArea}
  editingData={editingPaketArea()}
/>
```

## 🔧 Component Details

### PaketAreaUnifiedModal Props

```typescript
interface PaketAreaUnifiedModalProps {
  show: boolean;                    // Modal visibility
  onClose: () => void;               // Close handler
  onSave: (data: UnifiedFormData) => void;  // Save handler
  editingData?: {                    // Optional - for edit mode
    id: string;
    areaId: string;
    namaArea: string;
    lokasis: any[];
  } | null;
}
```

### Data Structure

```typescript
interface UnifiedFormData {
  areaId: string;
  namaArea: string;
  lokasis: LokasiFormData[];
}

interface LokasiFormData {
  id?: string;
  kode: string;
  mitra: string;
  witel: string;
  siteName: string;
  ruasKontraks: RuasFormData[];
}

interface RuasFormData {
  id?: string;
  noRuas: string;
  namaRuas: string;
  panjangKM: number;
  volumeMeter: number;
  progressGalian: number;
  progressHDPE: number;
  nilaiDRM: number;
  nilaiRekon: number;
}
```

## 📝 Implementation Steps

### Step 1: Modal Structure

Modal dibagi menjadi 3 section dengan color-coding:

```tsx
// SECTION 1: Area Info (Blue)
<div class="bg-blue-50 border-2 border-blue-200">
  <input name="areaId" />
  <input name="namaArea" />
</div>

// SECTION 2: Lokasi List (Purple)
<div class="bg-purple-50 border-2 border-purple-200">
  <For each={lokasis()}>
    {(lokasi) => (
      // Expandable lokasi card
      <div>
        <input name="kode" />
        <input name="siteName" />
        <input name="mitra" />
        <input name="witel" />
        
        // SECTION 3: Ruas Kontrak (Orange)
        <For each={lokasi.ruasKontraks}>
          {(ruas) => (
            // Ruas fields...
          )}
        </For>
      </div>
    )}
  </For>
</div>
```

### Step 2: State Management

```tsx
// Area fields
const [areaId, setAreaId] = createSignal('');
const [namaArea, setNamaArea] = createSignal('');

// Lokasi array (with nested ruas)
const [lokasis, setLokasis] = createSignal<LokasiFormData[]>([]);

// Expanded states for accordion
const [expandedLokasiIndex, setExpandedLokasiIndex] = createSignal<number | null>(null);
```

### Step 3: CRUD Operations

#### Add Lokasi
```tsx
const addLokasi = () => {
  const newLokasi: LokasiFormData = {
    id: `lok-${Date.now()}-${Math.random()}`,
    kode: '',
    mitra: '',
    witel: '',
    siteName: '',
    ruasKontraks: []
  };
  setLokasis([...lokasis(), newLokasi]);
  setExpandedLokasiIndex(lokasis().length); // Auto-expand new lokasi
};
```

#### Update Lokasi Field
```tsx
const updateLokasi = (index: number, field: keyof LokasiFormData, value: any) => {
  const updated = [...lokasis()];
  updated[index] = { ...updated[index], [field]: value };
  setLokasis(updated);
};
```

#### Add Ruas to Lokasi
```tsx
const addRuas = (lokasiIndex: number) => {
  const newRuas: RuasFormData = {
    id: `ruas-${Date.now()}-${Math.random()}`,
    noRuas: '',
    namaRuas: '',
    panjangKM: 0,
    volumeMeter: 0,
    progressGalian: 0,
    progressHDPE: 0,
    nilaiDRM: 0,
    nilaiRekon: 0
  };
  
  const updated = [...lokasis()];
  updated[lokasiIndex].ruasKontraks.push(newRuas);
  setLokasis(updated);
};
```

#### Update Ruas Field
```tsx
const updateRuas = (lokasiIndex: number, ruasIndex: number, field: keyof RuasFormData, value: any) => {
  const updated = [...lokasis()];
  updated[lokasiIndex].ruasKontraks[ruasIndex] = {
    ...updated[lokasiIndex].ruasKontraks[ruasIndex],
    [field]: value
  };
  setLokasis(updated);
};
```

### Step 4: Save Handler (ProjectDetail.tsx)

```tsx
const handleSavePaketArea = (data: {
  areaId: string;
  namaArea: string;
  lokasis: any[];
}) => {
  if (editingPaketArea()) {
    // Edit mode - update existing area
    const editId = editingPaketArea().id;
    setPaketAreas(
      area => area.id === editId,
      {
        areaId: data.areaId,
        namaArea: data.namaArea,
        lokasis: data.lokasis.map(lok => ({
          id: lok.id || `lokasi-${Date.now()}-${Math.random()}`,
          kode: lok.kode,
          mitra: lok.mitra,
          witel: lok.witel,
          siteName: lok.siteName,
          ruasKontraks: lok.ruasKontraks.map((ruas: any) => ({
            id: ruas.id || `ruas-${Date.now()}-${Math.random()}`,
            ...ruas,
            boqCustomers: ruas.boqCustomers || [],
            boqIndikatifs: ruas.boqIndikatifs || []
          }))
        }))
      }
    );
  } else {
    // Create mode - add new area
    const newArea = {
      id: `area-${Date.now()}`,
      areaId: data.areaId,
      namaArea: data.namaArea,
      lokasis: data.lokasis.map(/* ... same mapping ... */)
    };
    setPaketAreas(paketAreas.length, newArea);
  }
  
  setEditingPaketArea(null);
  setShowUnifiedModal(false);
};
```

## 🎨 UI/UX Features

### 1. Accordion for Lokasi
```tsx
<div 
  class="cursor-pointer hover:bg-purple-150"
  onClick={() => toggleLokasi(lokasiIdx())}
>
  <span>{expandedLokasiIndex() === lokasiIdx() ? '📂' : '📁'}</span>
  <h4>{lokasi.siteName || `Lokasi #${lokasiIdx() + 1}`}</h4>
  <p>{lokasi.ruasKontraks.length} ruas kontrak</p>
</div>
```

### 2. Summary Footer
```tsx
<div class="bg-gray-50 flex justify-between">
  <div>
    <strong>Summary:</strong> 
    {lokasis().length} lokasi, 
    {lokasis().reduce((sum, lok) => sum + lok.ruasKontraks.length, 0)} ruas kontrak
  </div>
  <button type="submit">
    {editingData ? '💾 Update Data' : '✨ Simpan Semua'}
  </button>
</div>
```

### 3. Compact Ruas Grid
```tsx
<div class="grid grid-cols-4 gap-3">
  <input name="noRuas" class="col-span-1" />
  <input name="namaRuas" class="col-span-3" />
  <input name="panjangKM" />
  <input name="volumeMeter" />
  <input name="progressGalian" />
  <input name="progressHDPE" />
  <input name="nilaiDRM" class="col-span-2" />
  <input name="nilaiRekon" class="col-span-2" />
</div>
```

## 🗑️ Simplified Button Actions

### Before (3 separate modals):
```tsx
// In ProjectDetail - OLD
<button onClick={() => {
  setEditingArea(null);
  setShowAreaModal(true);
}}>Add Area</button>

<button onClick={() => {
  setSelectedAreaId(area.id);
  setShowLokasiModal(true);
}}>Add Lokasi</button>

<button onClick={() => {
  setSelectedAreaId(area.id);
  setSelectedLokasiId(lokasi.id);
  setShowRuasModal(true);
}}>Add Ruas</button>
```

### After (1 unified modal):
```tsx
// In ProjectDetail - NEW
<button onClick={() => {
  setEditingPaketArea(null);  // For new
  setShowUnifiedModal(true);
}}>Add Area</button>

<button onClick={() => {
  setEditingPaketArea(area);  // For edit
  setShowUnifiedModal(true);
}}>Edit Area</button>

// NO MORE separate buttons for Lokasi/Ruas
// Everything is in the unified modal!
```

## 📊 AG Grid Simplification

### Button Actions Removed:
- ❌ Edit button in AG Grid action column (removed)
- ❌ Delete button in AG Grid action column (removed)
- ❌ Add Ruas button above grid (removed)

### Remaining:
- ✅ View Detail button (untuk expand/collapse BoQ)
- ✅ Delete Area button (di area header)
- ✅ Delete Lokasi button (di lokasi header)

### Reasoning:
Karena edit dilakukan melalui unified modal di level Area, tidak perlu edit individual ruas di grid. Delete tetap bisa dilakukan di level Area/Lokasi.

## 🔄 Migration from Old Modals

### Deprecated Files:
```
src/components/AreaModal.tsx      → Not used
src/components/LokasiModal.tsx    → Not used
src/components/RuasModal.tsx      → Not used
```

### State Cleanup:
```tsx
// REMOVED from ProjectDetail
const [showAreaModal, setShowAreaModal] = createSignal(false);
const [showLokasiModal, setShowLokasiModal] = createSignal(false);
const [showRuasModal, setShowRuasModal] = createSignal(false);
const [editingArea, setEditingArea] = createSignal(null);
const [editingLokasi, setEditingLokasi] = createSignal(null);
const [editingRuas, setEditingRuas] = createSignal(null);
const [selectedAreaId, setSelectedAreaId] = createSignal(null);
const [selectedLokasiId, setSelectedLokasiId] = createSignal(null);

// NEW - Simplified
const [showUnifiedModal, setShowUnifiedModal] = createSignal(false);
const [editingPaketArea, setEditingPaketArea] = createSignal(null);
```

## ✅ Benefits

1. **User Experience**
   - Single form untuk semua data
   - Tidak perlu buka-tutup multiple modals
   - Visual hierarchy yang jelas

2. **Code Quality**
   - Reduced complexity (1 modal vs 3 modals)
   - Easier state management
   - Less prop drilling

3. **Maintainability**
   - Single source of truth untuk form logic
   - Easier to add new fields
   - Consistent validation

4. **Performance**
   - Less re-renders (consolidated state)
   - Single modal component
   - Optimized form updates

## 🐛 Known Issues & Solutions

### Issue 1: Lokasi Accordion Initial State
**Problem**: New lokasi tidak auto-expand
**Solution**: 
```tsx
const addLokasi = () => {
  // ...
  setExpandedLokasiIndex(lokasis().length); // Auto-expand
};
```

### Issue 2: Form Reset on Close
**Problem**: Form tidak reset setelah cancel
**Solution**:
```tsx
const handleClose = () => {
  setAreaId('');
  setNamaArea('');
  setLokasis([]);
  setExpandedLokasiIndex(null);
  props.onClose();
};
```

### Issue 3: ID Generation for Nested Items
**Problem**: ID collision untuk lokasi/ruas
**Solution**:
```tsx
id: `lok-${Date.now()}-${Math.random()}` // Unique per creation
```

## 📖 Future Enhancements

1. **Drag & Drop**
   - Reorder lokasi
   - Reorder ruas within lokasi

2. **Bulk Operations**
   - Import multiple ruas from CSV
   - Copy/paste lokasi between areas

3. **Validation Enhancements**
   - Async validation (check duplicate kode)
   - Custom validation rules per field

4. **UI Improvements**
   - Animation on expand/collapse
   - Progress indicator for long saves
   - Undo/redo functionality

## 🎓 Learning Points

1. **SolidJS Patterns**
   - Nested signals for complex forms
   - Using array spreading for reactivity
   - createEffect for form initialization

2. **Form State Management**
   - Single source of truth
   - Immutable updates
   - Controlled components

3. **UX Best Practices**
   - Progressive disclosure (accordion)
   - Visual hierarchy (color-coding)
   - Clear action buttons
   - Real-time feedback (summary)

---

**Last Updated**: December 15, 2024
**Status**: ✅ Production Ready
**Version**: 1.0.0
