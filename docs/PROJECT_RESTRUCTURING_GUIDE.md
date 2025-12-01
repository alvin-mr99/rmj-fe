# Project Restructuring Implementation Guide

## Summary of Changes Made

### 1. Type Definitions (✅ COMPLETED)
**File:** `src/types/index.ts`

Added new types for unified project structure:
- `ProjectMetadata`: Project metadata including creation date, status, description
- `ProjectStatistics`: KML statistics (points, lines, polygons, distance)
- `ProjectData`: Main unified type that combines KML and BOQ data

```typescript
export interface ProjectData {
  id: string;
  projectName: string; // e.g., "RMJ-MONAS-DKI"
  projectCode: string; // e.g., "RMJ-MONAS-001"
  kml: {
    fileName: string;
    fileSize: number;
    data: CableFeatureCollection;
  };
  boq: {
    fileName: string;
    fileSize: number;
    data: BoQData;
  } | null;
  metadata: ProjectMetadata;
  statistics?: ProjectStatistics;
  uploadDate: string;
}
```

### 2. Dummy Project Data (✅ COMPLETED)
**Location:** `public/data/projects/`

Created 4 sample projects with proper naming:
1. **RMJ-MONAS-DKI** (project-rmj-monas-dki.json)
   - Code: RMJ-MONAS-001
   - 2,500m cable, 8 BOQ items
   - Total cost: Rp 976,250,000

2. **RMJ-BUNDARAN-HI** (project-rmj-bundaran-hi.json)
   - Code: RMJ-BHI-002
   - 3,200m cable, 8 BOQ items
   - Total cost: Rp 1,616,900,000

3. **RMJ-SENAYAN** (project-rmj-senayan.json)
   - Code: RMJ-SNY-003
   - 1,800m cable, 7 BOQ items
   - Total cost: Rp 699,000,000

4. **RMJ-THAMRIN** (project-rmj-thamrin.json)
   - Code: RMJ-THM-004
   - 4,500m cable, 9 BOQ items
   - Total cost: Rp 2,697,500,000

### 3. Project Loader Service (✅ COMPLETED)
**File:** `src/services/ProjectLoader.ts`

New service with utility functions:
- `loadProject()`: Load project from JSON and link with KML data
- `loadDefaultProjects()`: Load all 4 default projects
- `calculateProjectStatistics()`: Compute KML statistics
- `saveProjectsToStorage()`: Save projects to localStorage
- `loadProjectsFromStorage()`: Load projects from localStorage
- `createProjectFromUpload()`: Create project from uploaded files

### 4. Unified Upload Modal (✅ COMPLETED)
**File:** `src/components/ProjectUploadModal.tsx`

New modal that combines KML + BOQ upload:
- Single form for project information (name, code)
- Upload both KML and BOQ files together
- BOQ is optional
- Auto-generates project name from KML filename
- Progress indicators during processing
- Error handling

### 5. Project Detail Panel (✅ COMPLETED)
**File:** `src/components/ProjectDetailPanel.tsx`

Comprehensive project detail view with 3 tabs:
- **Overview Tab**: Project info, files, quick statistics, BOQ summary
- **KML Tab**: Detailed KML statistics and file information
- **BOQ Tab**: BOQ summary and detailed items table

Features:
- Beautiful UI with gradient cards
- Currency formatting (IDR)
- Date formatting
- Status badges (planning, in-progress, completed)
- Color-coded categories

### 6. New Sidebar Component (✅ COMPLETED)
**File:** `src/components/SidebarNew.tsx`

Updated sidebar for project-based structure:
- Shows projects instead of separate KML/BOQ lists
- Expandable project items showing KML and BOQ files
- Info button to open project details
- Search functionality across all project data
- Unified "Upload Project" menu item
- Delete project functionality

## Next Steps - App.tsx Refactoring

### Current State Issues:
- App.tsx still uses separate `kmlFiles` and `boqFiles` signals
- Need to migrate to unified `projects` signal
- All handlers need updating

### Required Changes in App.tsx:

#### 1. Update Imports
```typescript
// Add new imports
import { ProjectUploadModal } from './components/ProjectUploadModal';
import { ProjectDetailPanel } from './components/ProjectDetailPanel';
import { Sidebar as SidebarNew } from './components/SidebarNew';
import { loadDefaultProjects, saveProjectsToStorage, loadProjectsFromStorage } from './services/ProjectLoader';
import type { ProjectData } from './types';
```

#### 2. Replace State Signals
**BEFORE:**
```typescript
const [kmlFiles, setKmlFiles] = createSignal<KMLFileData[]>([]);
const [selectedKmlId, setSelectedKmlId] = createSignal<string | null>(null);
const [boqFiles, setBoqFiles] = createSignal<BoQFileData[]>([]);
const [selectedBoqId, setSelectedBoqId] = createSignal<string | null>(null);
const [isUploadModalOpen, setIsUploadModalOpen] = createSignal(false);
const [isBoQUploadModalOpen, setIsBoQUploadModalOpen] = createSignal(false);
```

**AFTER:**
```typescript
const [projects, setProjects] = createSignal<ProjectData[]>([]);
const [selectedProjectId, setSelectedProjectId] = createSignal<string | null>(null);
const [isProjectUploadModalOpen, setIsProjectUploadModalOpen] = createSignal(false);
const [showProjectDetail, setShowProjectDetail] = createSignal(false);
const [detailProject, setDetailProject] = createSignal<ProjectData | null>(null);
```

#### 3. Update onMount Logic
```typescript
onMount(async () => {
  // ... login check code ...
  
  try {
    // Try to load from localStorage first
    let loadedProjects = loadProjectsFromStorage();
    
    if (loadedProjects.length === 0) {
      // Load default projects if localStorage is empty
      console.log('Loading default projects...');
      loadedProjects = await loadDefaultProjects();
      saveProjectsToStorage(loadedProjects);
    }
    
    setProjects(loadedProjects);
    if (loadedProjects.length > 0) {
      setSelectedProjectId(loadedProjects[0].id);
    }
    console.log('✓ Loaded', loadedProjects.length, 'projects');
  } catch (error) {
    console.error('Error loading projects:', error);
    setProjects([]);
  }
});
```

#### 4. Create Helper Function for Map Data
```typescript
// Convert projects to KMLFileData format for MapView compatibility
const getKmlFilesForMap = () => {
  return projects().map(project => ({
    id: project.id,
    fileName: project.kml.fileName,
    fileSize: project.kml.fileSize,
    data: project.kml.data,
    uploadDate: project.uploadDate
  }));
};

const getSelectedProject = () => {
  return projects().find(p => p.id === selectedProjectId());
};
```

#### 5. Update Upload Handler
```typescript
const handleProjectUploadSuccess = (newProjects: ProjectData[]) => {
  console.log('Project upload success:', newProjects.length);
  
  setProjects(prev => [...prev, ...newProjects]);
  
  if (newProjects.length > 0) {
    setSelectedProjectId(newProjects[0].id);
  }
  
  // Save to localStorage
  saveProjectsToStorage([...projects(), ...newProjects]);
  
  // Reset filters
  setIsFilterActive(false);
  setFilteredKmlFiles([]);
  setShowRightSidebar(true);
  handleClosePopup();
};
```

#### 6. Update Delete Handler
```typescript
const handleProjectDelete = (id: string) => {
  console.log('Deleting project:', id);
  setProjects(prev => prev.filter(p => p.id !== id));
  
  if (selectedProjectId() === id) {
    const remaining = projects().filter(p => p.id !== id);
    setSelectedProjectId(remaining.length > 0 ? remaining[0].id : null);
  }
  
  saveProjectsToStorage(projects().filter(p => p.id !== id));
};
```

#### 7. Update JSX - Replace Old Components
**Replace:**
```tsx
<Sidebar 
  kmlFiles={kmlFiles()}
  selectedKmlId={selectedKmlId()}
  onKmlSelect={...}
  boqFiles={boqFiles()}
  // ... old props
/>
```

**With:**
```tsx
<SidebarNew 
  projects={projects()}
  selectedProjectId={selectedProjectId()}
  onProjectSelect={setSelectedProjectId}
  onProjectDelete={handleProjectDelete}
  onUploadClick={() => setIsProjectUploadModalOpen(true)}
  onDashboardClick={() => {
    // Show dashboard with project list
    console.log('Dashboard clicked');
  }}
  onAnalyticsClick={() => {
    if (projects().length === 0) {
      alert('Please upload a project first');
      return;
    }
    if (!selectedProjectId() && projects().length > 0) {
      setSelectedProjectId(projects()[0].id);
    }
    setShowAnalysisTab(true);
    setShowFilterTab(false);
  }}
  onFilteringClick={() => {
    if (projects().length === 0) {
      alert('Please upload a project first');
      return;
    }
    if (!selectedProjectId() && projects().length > 0) {
      setSelectedProjectId(projects()[0].id);
    }
    setShowFilterTab(true);
    setShowAnalysisTab(false);
  }}
  onProjectDetailClick={(project) => {
    setDetailProject(project);
    setShowProjectDetail(true);
  }}
/>
```

**Replace Upload Modals:**
```tsx
{/* Old modals - REMOVE */}
<UploadModal ... />
<BoQUploadModal ... />

{/* New unified modal - ADD */}
<ProjectUploadModal 
  isOpen={isProjectUploadModalOpen()}
  onClose={() => setIsProjectUploadModalOpen(false)}
  onUploadSuccess={handleProjectUploadSuccess}
/>

{/* Project Detail Panel - ADD */}
<Show when={showProjectDetail() && detailProject()}>
  <ProjectDetailPanel 
    project={detailProject()!}
    onClose={() => {
      setShowProjectDetail(false);
      setDetailProject(null);
    }}
  />
</Show>
```

#### 8. Update MapView Props
```tsx
<MapView 
  kmlFiles={isFilterActive() ? filteredKmlFiles() : getKmlFilesForMap()} 
  // ... other props remain same
/>
```

#### 9. Update Analysis/Filter Tabs
```tsx
<Show when={showAnalysisTab() && selectedProjectId()}>
  {(() => {
    const project = getSelectedProject();
    if (!project) return null;
    
    return (
      <AnalysisTab 
        cableData={project.kml.data}
        // ... other props
      />
    );
  })()}
</Show>

<Show when={showFilterTab() && selectedProjectId()}>
  {(() => {
    const project = getSelectedProject();
    if (!project) return null;
    
    return (
      <FilterTab 
        cableData={project.kml.data}
        // ... other props
      />
    );
  })()}
</Show>
```

#### 10. Update RightSidebar (if used)
The RightSidebar component will need similar updates to work with projects instead of separate files.

## Testing Checklist

After making all changes, test:
- [ ] Default projects load on first startup
- [ ] Can upload new project with KML + BOQ
- [ ] Can upload project with KML only (no BOQ)
- [ ] Project selection works
- [ ] Project detail panel opens and displays correctly
- [ ] Project deletion works
- [ ] Search functionality works
- [ ] Analytics tab works with selected project
- [ ] Filter tab works with selected project
- [ ] Map displays correctly with project data
- [ ] Feature popups still work
- [ ] Data persists in localStorage
- [ ] Expand/collapse project items in sidebar

## File Structure Summary

```
src/
├── components/
│   ├── ProjectUploadModal.tsx     ✅ NEW - Unified upload
│   ├── ProjectDetailPanel.tsx      ✅ NEW - Detail view
│   ├── SidebarNew.tsx             ✅ NEW - Updated sidebar
│   ├── Sidebar.tsx                ⚠️  OLD - Keep for reference
│   └── ... (other components)
├── services/
│   └── ProjectLoader.ts           ✅ NEW - Project utilities
├── types/
│   └── index.ts                   ✅ UPDATED - New types
└── App.tsx                        ⏳ TO UPDATE - Main refactor

public/data/projects/
├── project-rmj-monas-dki.json     ✅ NEW
├── project-rmj-bundaran-hi.json   ✅ NEW
├── project-rmj-senayan.json       ✅ NEW
└── project-rmj-thamrin.json       ✅ NEW
```

## Notes

- The old `Sidebar.tsx`, `UploadModal.tsx`, and `BoQUploadModal.tsx` can be kept for reference but should not be imported
- All localStorage keys changed from `kmlFiles` and `boqFiles` to `projects`
- Project statistics are auto-calculated from KML data
- BOQ is optional in projects
- The 4 dummy projects include realistic Indonesian BOQ data with proper pricing

## Migration Strategy

1. Make a backup of current `App.tsx`
2. Create a new branch for this refactoring
3. Apply changes incrementally, testing after each major section
4. Use TypeScript compiler to catch any missed references to old types
5. Test thoroughly before merging

Good luck with the implementation! 🚀
