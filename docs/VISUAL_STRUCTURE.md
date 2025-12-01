# Project Structure - Visual Guide

## Old Structure (Before) ❌

```
┌─────────────────────────────────────────────────────────┐
│                      App State                          │
├─────────────────────────────────────────────────────────┤
│  kmlFiles: [                                            │
│    { id: 1, fileName: "map-dki.kml", data: {...} }      │
│    { id: 2, fileName: "output.json", data: {...} }      │
│  ]                                                       │
│                                                          │
│  boqFiles: [                                            │
│    { id: 1, fileName: "boq-test.xlsx", data: {...} }    │
│    { id: 2, fileName: "testing.xlsx", data: {...} }     │
│  ]                                                       │
│                                                          │
│  selectedKmlId: 1                                       │
│  selectedBoqId: 1                                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────┐
│  Upload KML     │  │  Upload BOQ     │
│  Modal          │  │  Modal          │
└─────────────────┘  └─────────────────┘

         Sidebar
┌──────────────────────┐
│ DATA LAYER           │
│  □ map-dki.kml       │
│  □ output.json       │
│                      │
│ BOQ DATA             │
│  □ boq-test.xlsx     │
│  □ testing.xlsx      │
└──────────────────────┘

Problems:
❌ KML and BOQ are separate - no connection
❌ Hard to know which BOQ belongs to which KML
❌ Confusing file names (output.json, testing.xlsx)
❌ Two separate upload processes
```

---

## New Structure (After) ✅

```
┌─────────────────────────────────────────────────────────┐
│                      App State                          │
├─────────────────────────────────────────────────────────┤
│  projects: [                                            │
│    {                                                     │
│      id: "proj-001",                                    │
│      projectName: "RMJ-MONAS-DKI",                      │
│      projectCode: "RMJ-MONAS-001",                      │
│      kml: {                                             │
│        fileName: "kml-monas-dki.kml",                   │
│        data: {...}                                      │
│      },                                                  │
│      boq: {                                             │
│        fileName: "boq-monas-dki.xlsx",                  │
│        data: {...}                                      │
│      },                                                  │
│      metadata: { status, location, description },       │
│      statistics: { points, lines, distance }            │
│    },                                                    │
│    { ... project 2 ... },                               │
│    { ... project 3 ... }                                │
│  ]                                                       │
│                                                          │
│  selectedProjectId: "proj-001"                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────┐
│  ProjectUploadModal             │
│  ┌───────────────────────────┐  │
│  │ Project Name: RMJ-XXX     │  │
│  │ Project Code: RMJ-XXX-001 │  │
│  ├───────────────────────────┤  │
│  │ Upload KML File  [Choose] │  │
│  │ Upload BOQ File  [Choose] │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘

           Sidebar
┌────────────────────────────────┐
│ PROJECTS (4)                   │
│                                │
│ [−] 🔵 RMJ-MONAS-DKI       [ℹ]│
│      RMJ-MONAS-001             │
│      └─ 🔵 KML: kml-monas.kml  │
│         └─ 57 features, 2.5km  │
│      └─ 🟢 BOQ: boq-monas.xlsx │
│         └─ 8 items             │
│                                │
│ [+] 🟢 RMJ-BUNDARAN-HI     [ℹ]│
│      RMJ-BHI-002               │
│                                │
│ [+] 🟣 RMJ-SENAYAN         [ℹ]│
│      RMJ-SNY-003               │
│                                │
│ [+] 🔴 RMJ-THAMRIN         [ℹ]│
│      RMJ-THM-004               │
└────────────────────────────────┘

Benefits:
✅ KML and BOQ united in one project
✅ Clear, standard project naming
✅ One upload modal for both files
✅ Easy to track with project codes
✅ Can see project structure at a glance
```

---

## Data Flow

### Upload Flow

```
User Action: Click "Upload Project"
     │
     ▼
┌─────────────────────────────┐
│ ProjectUploadModal Opens    │
│                             │
│ 1. Enter project info       │
│    - Name: RMJ-MONAS-DKI    │
│    - Code: RMJ-MONAS-001    │
│                             │
│ 2. Select KML file          │
│    - Required               │
│                             │
│ 3. Select BOQ file          │
│    - Optional               │
└─────────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│ Processing                  │
│ - Convert KML to GeoJSON    │
│ - Parse BOQ Excel           │
│ - Calculate statistics      │
│ - Create ProjectData        │
└─────────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│ Save to App State           │
│ projects.push(newProject)   │
└─────────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│ Save to localStorage        │
│ "projects" key              │
└─────────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│ Update UI                   │
│ - Sidebar shows new project │
│ - Map displays KML data     │
│ - Project selected          │
└─────────────────────────────┘
```

### Project Detail Flow

```
User Action: Click [ℹ] button on project
     │
     ▼
┌──────────────────────────────────────────┐
│ ProjectDetailPanel Opens                 │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ [Overview] [KML] [BOQ]               │ │
│ ├──────────────────────────────────────┤ │
│ │                                      │ │
│ │ Project Information:                 │ │
│ │ - Created: Nov 15, 2025              │ │
│ │ - Location: Monas, Jakarta           │ │
│ │ - Status: In Progress                │ │
│ │                                      │ │
│ │ Files:                               │ │
│ │ 🔵 KML: kml-monas-dki.kml (45KB)     │ │
│ │ 🟢 BOQ: boq-monas-dki.xlsx (23KB)    │ │
│ │                                      │ │
│ │ Quick Statistics:                    │ │
│ │ ┌─────────┐ ┌─────────┐              │ │
│ │ │Features │ │  Lines  │              │ │
│ │ │   57    │ │   12    │              │ │
│ │ └─────────┘ └─────────┘              │ │
│ │                                      │ │
│ │ BOQ Summary:                         │ │
│ │ Total Cost: Rp 976,250,000           │ │
│ │ Material: Rp 598,750,000             │ │
│ │ Labor: Rp 325,000,000                │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

## Component Relationship

```
App.tsx (Main State)
 │
 ├─── SidebarNew
 │     │
 │     ├─── Project List
 │     │     ├─── RMJ-MONAS-DKI
 │     │     │     ├─── KML info
 │     │     │     └─── BOQ info
 │     │     └─── RMJ-BUNDARAN-HI
 │     │           ├─── KML info
 │     │           └─── BOQ info
 │     │
 │     └─── Menu Items
 │           ├─── Dashboard
 │           ├─── Upload Project
 │           ├─── Analytics
 │           └─── Filtering
 │
 ├─── MapView (displays KML data from selected project)
 │
 ├─── ProjectUploadModal
 │     ├─── Project Info Form
 │     ├─── KML File Input
 │     └─── BOQ File Input
 │
 ├─── ProjectDetailPanel
 │     ├─── Overview Tab
 │     ├─── KML Tab
 │     └─── BOQ Tab
 │
 ├─── AnalysisTab (uses selected project's KML data)
 │
 ├─── FilterTab (uses selected project's KML data)
 │
 └─── RightSidebar (shows selected project info)
```

---

## File Organization

```
rmj-fe/
├── public/
│   └── data/
│       ├── projects/                    ⭐ NEW
│       │   ├── project-rmj-monas-dki.json
│       │   ├── project-rmj-bundaran-hi.json
│       │   ├── project-rmj-senayan.json
│       │   └── project-rmj-thamrin.json
│       │
│       └── *.kml (referenced by projects)
│
├── src/
│   ├── components/
│   │   ├── ProjectUploadModal.tsx       ⭐ NEW
│   │   ├── ProjectDetailPanel.tsx       ⭐ NEW
│   │   ├── SidebarNew.tsx              ⭐ NEW
│   │   │
│   │   ├── Sidebar.tsx                 ⚠️ OLD
│   │   ├── UploadModal.tsx             ⚠️ OLD
│   │   └── BoQUploadModal.tsx          ⚠️ OLD
│   │
│   ├── services/
│   │   └── ProjectLoader.ts            ⭐ NEW
│   │
│   ├── types/
│   │   └── index.ts                    ⭐ UPDATED
│   │
│   └── App.tsx                          ⏳ NEEDS UPDATE
│
└── docs/
    ├── PROJECT_RESTRUCTURING_GUIDE.md   ⭐ NEW
    ├── PANDUAN_IMPLEMENTASI_ID.md       ⭐ NEW
    └── VISUAL_STRUCTURE.md              ⭐ THIS FILE
```

---

## State Management Before & After

### BEFORE (Old Structure) ❌
```typescript
// Separate arrays, no connection
kmlFiles: [
  { id: "1", fileName: "map.kml", data: {...} },
  { id: "2", fileName: "test.json", data: {...} }
]

boqFiles: [
  { id: "a", fileName: "boq1.xlsx", data: {...} },
  { id: "b", fileName: "boq2.xlsx", data: {...} }
]

selectedKmlId: "1"
selectedBoqId: "a"

// ❌ Problem: Which BOQ belongs to which KML?
```

### AFTER (New Structure) ✅
```typescript
// Unified array, clear relationships
projects: [
  {
    id: "proj-001",
    projectName: "RMJ-MONAS-DKI",
    projectCode: "RMJ-MONAS-001",
    kml: {
      fileName: "kml-monas-dki.kml",
      data: {...}
    },
    boq: {
      fileName: "boq-monas-dki.xlsx",
      data: {...}
    },
    metadata: {...},
    statistics: {...}
  }
]

selectedProjectId: "proj-001"

// ✅ Clear: KML and BOQ are together in one project
```

---

## localStorage Structure

### BEFORE ❌
```javascript
localStorage:
  kmlFiles: "[{id:1, ...}, {id:2, ...}]"
  boqFiles: "[{id:a, ...}, {id:b, ...}]"
```

### AFTER ✅
```javascript
localStorage:
  projects: "[{id:proj-001, projectName:..., kml:{...}, boq:{...}}, ...]"
```

---

## UI Comparison

### Sidebar - BEFORE ❌
```
┌──────────────────┐
│ DATA LAYER (2)   │
│ □ map-dki.kml    │
│ □ output.json    │  ← What is this?
│                  │
│ BOQ DATA (2)     │
│ □ testing.xlsx   │  ← Which KML?
│ □ boq.xlsx       │  ← Which KML?
└──────────────────┘

Problems:
- Unclear file names
- No connection visible
- Separate sections
```

### Sidebar - AFTER ✅
```
┌────────────────────────────┐
│ PROJECTS (4)               │
│                            │
│ [−] RMJ-MONAS-DKI      [ℹ] │
│     RMJ-MONAS-001          │
│     └─ KML: kml-monas.kml  │ ← Clear names
│     └─ BOQ: boq-monas.xlsx │ ← Belongs to MONAS
│                            │
│ [+] RMJ-BUNDARAN-HI    [ℹ] │
│     RMJ-BHI-002            │
│                            │
│ [+] RMJ-SENAYAN        [ℹ] │
│     RMJ-SNY-003            │
└────────────────────────────┘

Benefits:
✅ Clear project names
✅ Shows KML-BOQ relationship
✅ Standard naming convention
✅ Project codes for tracking
```

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Structure** | KML & BOQ separate | Unified in Project |
| **Naming** | Random (output.json) | Standard (RMJ-MONAS-DKI) |
| **Upload** | 2 separate modals | 1 unified modal |
| **Relationship** | Unclear | Clear parent-child |
| **Tracking** | File names only | Project codes |
| **Detail View** | None | Comprehensive panel |
| **localStorage** | 2 keys | 1 key |
| **User Experience** | Confusing | Intuitive |

**Result: Much better organization and user experience! 🎉**
