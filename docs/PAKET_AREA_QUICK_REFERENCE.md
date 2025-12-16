# Quick Reference - Paket Area CRUD Module

## 🚀 Quick Start (Copy-Paste Ready)

### 1. Add to your App
```tsx
// src/App.tsx
import { PaketAreaManager } from './components/PaketAreaManager';

function App() {
  return (
    <div class="min-h-screen bg-gray-100">
      <PaketAreaManager />
    </div>
  );
}
```

### 2. Or add as a route (SolidJS Router)
```tsx
import { Route } from '@solidjs/router';
import { PaketAreaManager } from './components/PaketAreaManager';

<Route path="/paket-area" component={PaketAreaManager} />
```

---

## 📋 Component API

### PaketAreaManager
Main container component - no props needed!
```tsx
<PaketAreaManager />
```

### PaketAreaList
```tsx
<PaketAreaList
  areas={areas()}                    // PaketArea[]
  onAdd={() => void}                 // Open create modal
  onEdit={(area) => void}            // Open edit modal
  onDelete={(id: string) => void}    // Delete area
/>
```

### PaketAreaModal
```tsx
<PaketAreaModal
  isOpen={boolean}                   // Modal visibility
  editingArea={PaketArea | null}     // Area to edit (null = create mode)
  onClose={() => void}               // Close modal
  onSave={(area: PaketArea) => void} // Save callback
/>
```

---

## 🔧 Service API

```typescript
import { paketAreaService } from './services/paketAreaService';

// CREATE
const newArea = paketAreaService.create({
  areaId: 'A-01',
  namaArea: 'Area Jakarta Pusat',
  sites: []
});

// READ ALL
const allAreas = paketAreaService.getAll();

// READ ONE
const area = paketAreaService.getById('pa-123');

// UPDATE
const updated = paketAreaService.update('pa-123', {
  namaArea: 'New Name'
});

// DELETE
const success = paketAreaService.delete('pa-123');

// CLEAR ALL
paketAreaService.clear();

// GENERATE IDS
const areaId = paketAreaService.generateId();
const siteId = paketAreaService.generateSiteId();
const ruasId = paketAreaService.generateRuasId();
```

---

## 📦 Data Structure (Quick Ref)

```typescript
PaketArea {
  id: string                    // Auto-generated
  areaId: string                // e.g., "A-01"
  namaArea: string              // e.g., "Area Jakarta Pusat"
  sites: Site[]                 // Array of sites
  createdAt: string             // ISO date string
  updatedAt: string             // ISO date string
}

Site {
  id: string                    // Auto-generated
  kode: string                  // Site code
  mitra: string                 // Partner name
  witel: string                 // Witel name
  siteName: string              // Site name
  ruasKontraks: RuasKontrak[]   // Array of ruas
}

RuasKontrak {
  id: string                    // Auto-generated
  noRuas: {                     // Multiple values!
    id: string
    values: string[]            // ["R-001", "R-001A"]
  }
  namaRuas: {
    id: string
    values: string[]
  }
  panjangKM: {
    id: string
    values: string[]
  }
  // ... 5 more fields with same structure
}
```

---

## 🎯 Common Operations

### Add New Area Programmatically
```typescript
import { paketAreaService } from './services/paketAreaService';

const area = paketAreaService.create({
  areaId: 'A-TEST-001',
  namaArea: 'Test Area',
  sites: [
    {
      id: paketAreaService.generateSiteId(),
      kode: 'SITE-001',
      mitra: 'PT. Test',
      witel: 'WITEL-TEST',
      siteName: 'Test Site',
      ruasKontraks: [
        {
          id: paketAreaService.generateRuasId(),
          noRuas: { id: 'nr-1', values: ['R-001'] },
          namaRuas: { id: 'nm-1', values: ['Test Ruas'] },
          panjangKM: { id: 'pk-1', values: ['2.5'] },
          volumeMeter: { id: 'vm-1', values: ['2500'] },
          progressGalian: { id: 'pg-1', values: ['80'] },
          progressHDPE: { id: 'ph-1', values: ['60'] },
          nilaiDRM: { id: 'nd-1', values: ['150000000'] },
          nilaiRekon: { id: 'nrk-1', values: ['145000000'] },
        }
      ]
    }
  ]
});
```

### Get All Areas and Display Count
```typescript
const areas = paketAreaService.getAll();
console.log(`Total areas: ${areas.length}`);
console.log(`Total sites: ${areas.reduce((sum, a) => sum + a.sites.length, 0)}`);
```

### Update Area Name
```typescript
paketAreaService.update('pa-123', {
  namaArea: 'Updated Name'
});
```

### Delete with Confirmation
```typescript
const area = paketAreaService.getById('pa-123');
if (area && confirm(`Delete ${area.namaArea}?`)) {
  paketAreaService.delete('pa-123');
}
```

### Clear All Data
```typescript
if (confirm('Delete all areas?')) {
  paketAreaService.clear();
}
```

---

## 🎨 Customization Examples

### Change Modal Width
```tsx
// In PaketAreaModal.tsx, line ~190
<div class="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
//                                                    ↑ Change this
```

### Change Primary Color
Find and replace:
- `bg-blue-500` → `bg-green-500`
- `text-blue-600` → `text-green-600`
- `border-blue-300` → `border-green-300`

### Add Custom Field
1. Add to `types/paketArea.ts`:
```typescript
interface PaketArea {
  // ... existing fields
  customField: string;  // ← Add here
}
```

2. Add input in `PaketAreaModal.tsx`:
```tsx
<input
  type="text"
  value={formState().customField}
  onInput={(e) => updateBasicField('customField', e.currentTarget.value)}
/>
```

---

## 🐛 Troubleshooting

### Modal not showing?
```typescript
// Check z-index
class="... z-50"  // Should be high enough

// Check isOpen prop
<PaketAreaModal isOpen={true} ... />
```

### Data not persisting?
```typescript
// Check localStorage
console.log(localStorage.getItem('paket_areas'));

// Check browser quota
if (localStorage) {
  console.log('localStorage available');
}
```

### Form not submitting?
```typescript
// Check validation
console.log('Form state:', formState());

// Check event handler
const handleSubmit = (e: Event) => {
  e.preventDefault();  // Important!
  // ...
}
```

---

## 📱 Responsive Breakpoints

- `sm:` - ≥640px
- `md:` - ≥768px (form switches to 2 columns)
- `lg:` - ≥1024px
- `xl:` - ≥1280px

---

## 🔐 localStorage Info

**Key**: `paket_areas`

**Max Size**: ~5-10MB (browser dependent)

**Clear Data**:
```javascript
localStorage.removeItem('paket_areas');
// or
localStorage.clear();
```

**View Data**:
```javascript
JSON.parse(localStorage.getItem('paket_areas'));
```

---

## ⚡ Performance Tips

1. **Limit data size** - Don't store too many areas (recommend < 1000)
2. **Use indexes** - Add custom indexing if needed
3. **Lazy load** - Split into pages if list is long
4. **Debounce inputs** - For search/filter features

---

## 🎓 Learning Resources

- [SolidJS Docs](https://www.solidjs.com/docs/latest)
- [SolidJS Signals](https://www.solidjs.com/tutorial/introduction_signals)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

## 📞 Quick Commands

```bash
# Check types
npm run type-check

# Run dev server
npm run dev

# Build
npm run build

# Format code
npm run format
```

---

**Quick Start Time**: < 5 minutes ⚡

**Documentation**: `/docs/PAKET_AREA_CRUD_MODULE.md` 📚

**Full Summary**: `/docs/PAKET_AREA_IMPLEMENTATION_SUMMARY.md` 📊

---
