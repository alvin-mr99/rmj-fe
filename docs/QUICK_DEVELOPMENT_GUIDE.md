# 🚀 Quick Development Guide - RMJ Project

## 📊 Current vs Required Features

### ✅ Sudah Ada (Current Features)
```
✅ Interactive map dengan MapLibre GL
✅ KML upload & conversion
✅ Cable visualization dengan color coding
✅ Soil type detection (Pasir, Tanah Liat, Batuan)
✅ Distance calculation otomatis
✅ Filter tab (by soil type, depth, distance, width)
✅ Analysis tab (point & line features)
✅ Drawing tools untuk add route
✅ Search & popup info
✅ Login/auth system
✅ Responsive design
```

### ❌ Yang Harus Dikembangkan (dari MoM Brief)

#### 🔥 CRITICAL (Must Have - Phase 1)
```
❌ Photo Evidence System
   └─ Camera capture + GPS auto-tagging
   └─ Photo gallery per cable
   └─ Photo markers on map

❌ Offline Mode (PWA)
   └─ Service Worker
   └─ IndexedDB storage
   └─ Background sync

❌ BOQ Calculator
   └─ Auto-calculate dari route data
   └─ Excavation by soil type (soil/cor/boring)
   └─ Handhole per 3km
   └─ Material requirements

❌ BOQ Editor
   └─ Manual edit quantities
   └─ Price list management
   └─ Export to Excel/PDF
```

#### 🔶 HIGH (Should Have - Phase 2)
```
❌ GPS Tracking
   └─ Real-time track recording
   └─ Actual vs planned route comparison

❌ Elevation Profile
   └─ MapTiler Terrain API integration
   └─ 3D visualization
   └─ Slope analysis

❌ Report Generator
   └─ Auto-generate survey report
   └─ Include photos, maps, stats
   └─ Export PDF/Word

❌ Handhole Auto-Placement
   └─ Every 3km algorithm
   └─ Consider elevation & existing infrastructure
```

#### 🔷 MEDIUM (Nice to Have - Phase 3)
```
❌ KML Edit Mode
   └─ Edit coordinates langsung
   └─ Add/remove points
   └─ Split/merge routes

❌ Material Calculator
   └─ Detailed material breakdown
   └─ Cost estimation

❌ Backend API
   └─ User management
   └─ Data persistence (PostgreSQL + PostGIS)
   └─ File storage
```

#### 🟢 LOW (Future Enhancement - Phase 4)
```
❌ Photo Validation AI
   └─ Auto-detect depth from photo
   └─ Soil type classification
   └─ Quality check

❌ Garmin GPS Integration
   └─ GPX file import
   └─ Waypoint matching

❌ Multi-User Collaboration
   └─ Real-time sync
   └─ Comments & version control
```

---

## 🎯 Development Priority (Berdasarkan MoM Brief)

### Sprint 1-2 (Week 1-4): Photo Evidence + Offline
**Goal:** Enable field survey dengan foto evidence

**Tasks:**
```typescript
// 1. Create PhotoEvidence type
interface PhotoEvidence {
  id: string;
  cableId: string;
  location: [number, number];
  timestamp: string;
  photoType: 'excavation' | 'depth' | 'soil_condition' | 'handhole';
  photoUrl: string;
  depth?: number;
  soilType?: SoilType;
  notes?: string;
  metadata: {
    altitude?: number;
    accuracy?: number;
    device?: string;
  };
}

// 2. Create components
- src/components/survey/PhotoEvidenceUpload.tsx
- src/components/survey/PhotoGallery.tsx
- src/components/survey/PhotoMarker.tsx

// 3. Create services
- src/services/storage/PhotoStorage.ts
- src/services/geo/GeoLocation.ts

// 4. Setup PWA
- public/sw.js
- public/manifest.json
- src/services/storage/OfflineStorage.ts
```

**Acceptance Criteria:**
- [ ] User bisa take photo dengan camera
- [ ] GPS coordinates auto-tagged
- [ ] Photo tersimpan lokal (offline mode)
- [ ] Photo sync saat online
- [ ] Photo tampil di map sebagai marker
- [ ] Gallery view per cable route

---

### Sprint 3-4 (Week 5-8): BOQ System
**Goal:** Generate BOQ otomatis dari survey data

**Tasks:**
```typescript
// 1. Create BOQ types
interface BOQItem {
  id: string;
  category: 'excavation' | 'cable' | 'handhole' | 'material' | 'labor';
  itemName: string;
  unit: 'meter' | 'km' | 'unit' | 'cubic_meter';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface BOQSummary {
  projectId: string;
  cableId: string;
  totalDistance: number;
  excavationType: {
    soil: number;    // km
    concrete: number; // km (cor-coran)
    boring: number;   // km
  };
  handholeCount: number;
  totalCost: number;
  items: BOQItem[];
}

// 2. Create components
- src/components/boq/BOQTab.tsx
- src/components/boq/BOQEditor.tsx
- src/components/boq/BOQCalculator.tsx
- src/components/boq/MaterialSummary.tsx

// 3. Create services
- src/services/analysis/BOQService.ts
- src/services/analysis/MaterialCalculator.ts
- src/services/ExportService.ts
```

**Calculation Logic:**
```typescript
// Auto-calculate BOQ items
function calculateBOQ(cableRoute: CableFeature): BOQSummary {
  // 1. Total distance (already available)
  const totalDistance = cableRoute.properties.totalDistance / 1000; // km
  
  // 2. Excavation by soil type
  const segments = cableRoute.properties.segments || [];
  let soilKm = 0, concreteKm = 0, boringKm = 0;
  
  segments.forEach(seg => {
    const km = seg.distance / 1000;
    // Determine excavation type based on soil type & terrain
    if (soilType === 'Pasir') soilKm += km;
    else if (soilType === 'Tanah Liat') soilKm += km * 0.7; // mixed
    else if (soilType === 'Batuan') boringKm += km;
    
    // If near road/building → concrete
    if (isNearInfrastructure(seg)) concreteKm += km;
  });
  
  // 3. Handhole count (every 3km)
  const handholeCount = Math.ceil(totalDistance / 3);
  
  // 4. Generate BOQ items
  const items = [
    {
      category: 'excavation',
      itemName: 'Galian Tanah (Soil)',
      unit: 'km',
      quantity: soilKm,
      unitPrice: 5000000, // per km
      totalPrice: soilKm * 5000000
    },
    {
      category: 'excavation',
      itemName: 'Galian Cor-coran (Concrete)',
      unit: 'km',
      quantity: concreteKm,
      unitPrice: 8000000,
      totalPrice: concreteKm * 8000000
    },
    {
      category: 'excavation',
      itemName: 'Galian Boring',
      unit: 'km',
      quantity: boringKm,
      unitPrice: 12000000,
      totalPrice: boringKm * 12000000
    },
    {
      category: 'handhole',
      itemName: 'Handhole Installation',
      unit: 'unit',
      quantity: handholeCount,
      unitPrice: 2000000,
      totalPrice: handholeCount * 2000000
    }
    // ... more items
  ];
  
  return { totalDistance, excavationType, handholeCount, items };
}
```

**Acceptance Criteria:**
- [ ] Auto-calculate excavation by type
- [ ] Auto-calculate handhole count
- [ ] Manual edit BOQ items
- [ ] Save/load BOQ templates
- [ ] Export to Excel
- [ ] Export to PDF dengan logo & header

---

### Sprint 5-6 (Week 9-12): GPS Tracking & Reports
**Goal:** Track survey progress & generate reports

**Tasks:**
```typescript
// 1. GPS Tracking
- src/components/survey/GPSTracker.tsx
- src/services/geo/RouteTracker.ts
- src/services/geo/RouteComparison.ts

// 2. Report Generator
- src/components/reports/ReportGenerator.tsx
- src/services/ReportService.ts
- src/templates/ReportTemplate.tsx
```

**Report Contents:**
```
📄 Survey Report
├─ Cover Page (logo, title, date)
├─ Executive Summary
│  └─ Total distance, survey date, surveyor name
├─ Route Map
│  └─ Screenshot dengan actual vs planned route
├─ Photo Evidence Gallery
│  └─ All photos dengan GPS & timestamp
├─ BOQ Summary
│  └─ Table dengan quantities & costs
├─ Material Breakdown
│  └─ Soil/Concrete/Boring percentages
├─ Handhole Locations
│  └─ List dengan coordinates
└─ Appendix
   └─ Raw data, metadata
```

---

## 🛠️ Quick Start Development

### Setup Development Environment
```bash
# 1. Clone & install
git clone <repo-url>
cd rmj-fe
npm install

# 2. Install additional dependencies untuk Phase 1
npm install localforage           # Offline storage
npm install idb                    # IndexedDB wrapper
npm install workbox-window         # Service Worker helper

# 3. Run development server
npm run dev
```

### File Structure untuk New Features
```
src/
├── components/
│   ├── survey/         # NEW: Photo evidence, GPS tracking
│   ├── boq/            # NEW: BOQ calculator & editor
│   └── reports/        # NEW: Report generator
├── services/
│   ├── storage/        # NEW: Photo & offline storage
│   ├── geo/            # NEW: Geolocation & tracking
│   └── analysis/       # NEW: BOQ & material calculation
└── types/
    ├── PhotoEvidence.ts # NEW
    └── BOQ.ts          # NEW
```

---

## 📱 PWA Setup Checklist

### manifest.json
```json
{
  "name": "SmartWFM RMJ",
  "short_name": "RMJ",
  "description": "Ring Management Junction Survey App",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker (sw.js)
```javascript
// Cache static assets
const CACHE_NAME = 'rmj-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/index.css',
  '/src/App.tsx',
  // MapLibre tiles
  'https://api.maptiler.com/...'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)
```typescript
// src/services/analysis/BOQService.test.ts
describe('BOQService', () => {
  it('should calculate excavation by soil type', () => {
    const route = mockCableRoute;
    const boq = BOQService.calculate(route);
    
    expect(boq.excavationType.soil).toBeGreaterThan(0);
    expect(boq.handholeCount).toBe(Math.ceil(route.totalDistance / 3000));
  });
});

// src/services/storage/PhotoStorage.test.ts
describe('PhotoStorage', () => {
  it('should store photo with GPS metadata', async () => {
    const photo = mockPhotoEvidence;
    await PhotoStorage.save(photo);
    
    const retrieved = await PhotoStorage.get(photo.id);
    expect(retrieved.location).toEqual(photo.location);
  });
});
```

### Integration Tests
```typescript
// Test full workflow
describe('Survey Workflow', () => {
  it('should complete photo upload → BOQ generation → report export', async () => {
    // 1. Upload KML
    const kml = await loadKML('test-route.kml');
    const geoJson = EnhancedKmlConverter.convert(kml);
    
    // 2. Add photo evidence
    const photos = await addPhotoEvidence(geoJson.features[0].id, 3);
    
    // 3. Generate BOQ
    const boq = await BOQService.calculate(geoJson.features[0]);
    expect(boq.items.length).toBeGreaterThan(0);
    
    // 4. Export report
    const report = await ReportService.generate(geoJson, photos, boq);
    expect(report.format).toBe('pdf');
  });
});
```

---

## 📊 Performance Targets

### Load Time
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle size: < 500KB gzipped

### Offline Performance
- Cache hit rate: > 90%
- Sync success rate: > 95%
- Photo upload success: > 98%

### Map Performance
- Map load: < 2s
- Route rendering: < 500ms for 100 features
- Photo marker rendering: < 300ms for 50 photos

---

## 🚀 Deployment Checklist

### Production Build
```bash
# 1. Build
npm run build

# 2. Test production build locally
npm run preview

# 3. Check bundle size
npm run build:analyze
```

### Environment Variables
```env
VITE_MAPTILER_API_KEY=your_key_here
VITE_API_BASE_URL=https://api.yourbackend.com
VITE_STORAGE_BUCKET=your_s3_bucket
```

### Deploy to Vercel/Netlify
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

---

**Quick Reference:** Lihat `PROJECT_ANALYSIS_AND_DEVELOPMENT_ROADMAP.md` untuk detail lengkap!
