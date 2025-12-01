 # Panduan Implementasi Struktur Project Baru

## ✅ Yang Sudah Selesai

### 1. **Definisi Tipe Data Baru** 
File: `src/types/index.ts`

Ditambahkan tipe `ProjectData` yang menyatukan KML dan BOQ:
```typescript
interface ProjectData {
  id: string;
  projectName: string;     // "RMJ-MONAS-DKI"
  projectCode: string;     // "RMJ-MONAS-001"
  kml: { fileName, fileSize, data };
  boq: { fileName, fileSize, data } | null;  // BOQ opsional
  metadata: { createdDate, status, description };
  statistics: { totalPoints, totalLines, totalDistance };
}
```

### 2. **4 Data Dummy Project**
Lokasi: `public/data/projects/`

Dibuat 4 project contoh dengan nama standar:

1. **RMJ-MONAS-DKI** - Kode: RMJ-MONAS-001
   - Kabel: 2,500 meter
   - BOQ: 8 item
   - Total Biaya: Rp 976.250.000

2. **RMJ-BUNDARAN-HI** - Kode: RMJ-BHI-002
   - Kabel: 3,200 meter
   - BOQ: 8 item
   - Total Biaya: Rp 1.616.900.000

3. **RMJ-SENAYAN** - Kode: RMJ-SNY-003
   - Kabel: 1,800 meter
   - BOQ: 7 item
   - Total Biaya: Rp 699.000.000

4. **RMJ-THAMRIN** - Kode: RMJ-THM-004
   - Kabel: 4,500 meter
   - BOQ: 9 item
   - Total Biaya: Rp 2.697.500.000

### 3. **Service Project Loader**
File: `src/services/ProjectLoader.ts`

Fungsi-fungsi utilitas:
- `loadDefaultProjects()` - Muat 4 project default
- `loadProject()` - Muat project dari JSON + KML
- `calculateProjectStatistics()` - Hitung statistik KML
- `createProjectFromUpload()` - Buat project dari upload
- `saveProjectsToStorage()` / `loadProjectsFromStorage()` - localStorage

### 4. **Modal Upload Terpadu**
File: `src/components/ProjectUploadModal.tsx`

Modal baru yang menggabungkan upload KML + BOQ:
- Satu form untuk info project (nama, kode)
- Upload KML dan BOQ bersamaan
- BOQ bersifat opsional
- Auto-generate nama project dari filename KML
- Progress indicator dan error handling

### 5. **Panel Detail Project**
File: `src/components/ProjectDetailPanel.tsx`

Panel detail lengkap dengan 3 tab:

**Tab Overview:**
- Info project (tanggal, lokasi, status)
- File yang diupload (KML + BOQ)
- Statistik cepat (features, lines, points, distance)
- Summary BOQ (total cost, material, labor)

**Tab KML:**
- Statistik detail KML
- Info file (nama, ukuran, tanggal upload)

**Tab BOQ:**
- Summary BOQ dengan breakdown biaya
- Tabel lengkap semua item BOQ
- Format currency Indonesia (IDR)
- Kategori berwarna (Material, Labor, Equipment)

### 6. **Sidebar Baru**
File: `src/components/SidebarNew.tsx`

Sidebar dengan struktur project:
- Tampilkan list project (bukan KML/BOQ terpisah)
- Bisa di-expand untuk lihat KML dan BOQ files
- Tombol info (ℹ) untuk buka detail project
- Search di semua data project
- Menu "Upload Project" (gabungan KML + BOQ)
- Tombol delete project

Tampilan project:
```
📁 PROJECTS (4)
  
  [+] 🔵 RMJ-MONAS-DKI
         RMJ-MONAS-001      [ℹ] [×]
      
  [−] 🟢 RMJ-BUNDARAN-HI
         RMJ-BHI-002        [ℹ] [×]
         └─ 🔵 KML: kml-bundaran-hi.kml
            └─ 74 features, 3.20 km
         └─ 🟢 BOQ: boq-bundaran-hi.xlsx
            └─ 8 items
```

## 📋 Yang Perlu Dilakukan di App.tsx

File App.tsx masih menggunakan struktur lama (kmlFiles & boqFiles terpisah). Perlu diubah ke struktur project.

### Langkah-langkah:

1. **Import komponen baru:**
```typescript
import { ProjectUploadModal } from './components/ProjectUploadModal';
import { ProjectDetailPanel } from './components/ProjectDetailPanel';
import { Sidebar as SidebarNew } from './components/SidebarNew';
import { loadDefaultProjects, saveProjectsToStorage, loadProjectsFromStorage } from './services/ProjectLoader';
import type { ProjectData } from './types';
```

2. **Ganti state signals:**
```typescript
// HAPUS:
const [kmlFiles, setKmlFiles] = ...
const [boqFiles, setBoqFiles] = ...
const [selectedKmlId, ...] = ...
const [selectedBoqId, ...] = ...

// GANTI dengan:
const [projects, setProjects] = createSignal<ProjectData[]>([]);
const [selectedProjectId, setSelectedProjectId] = createSignal<string | null>(null);
const [isProjectUploadModalOpen, setIsProjectUploadModalOpen] = createSignal(false);
const [showProjectDetail, setShowProjectDetail] = createSignal(false);
const [detailProject, setDetailProject] = createSignal<ProjectData | null>(null);
```

3. **Update onMount untuk load projects:**
```typescript
onMount(async () => {
  // ... kode login ...
  
  let loadedProjects = loadProjectsFromStorage();
  
  if (loadedProjects.length === 0) {
    loadedProjects = await loadDefaultProjects();
    saveProjectsToStorage(loadedProjects);
  }
  
  setProjects(loadedProjects);
  if (loadedProjects.length > 0) {
    setSelectedProjectId(loadedProjects[0].id);
  }
});
```

4. **Buat helper functions:**
```typescript
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

5. **Update handlers:**
```typescript
const handleProjectUploadSuccess = (newProjects: ProjectData[]) => {
  setProjects(prev => [...prev, ...newProjects]);
  if (newProjects.length > 0) {
    setSelectedProjectId(newProjects[0].id);
  }
  saveProjectsToStorage([...projects(), ...newProjects]);
};

const handleProjectDelete = (id: string) => {
  setProjects(prev => prev.filter(p => p.id !== id));
  if (selectedProjectId() === id) {
    const remaining = projects().filter(p => p.id !== id);
    setSelectedProjectId(remaining.length > 0 ? remaining[0].id : null);
  }
  saveProjectsToStorage(projects().filter(p => p.id !== id));
};
```

6. **Ganti komponen di JSX:**
```tsx
{/* Ganti Sidebar lama dengan SidebarNew */}
<SidebarNew 
  projects={projects()}
  selectedProjectId={selectedProjectId()}
  onProjectSelect={setSelectedProjectId}
  onProjectDelete={handleProjectDelete}
  onUploadClick={() => setIsProjectUploadModalOpen(true)}
  onProjectDetailClick={(project) => {
    setDetailProject(project);
    setShowProjectDetail(true);
  }}
  // ... props lainnya
/>

{/* Ganti 2 modal lama dengan 1 modal baru */}
<ProjectUploadModal 
  isOpen={isProjectUploadModalOpen()}
  onClose={() => setIsProjectUploadModalOpen(false)}
  onUploadSuccess={handleProjectUploadSuccess}
/>

{/* Tambah Project Detail Panel */}
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

7. **Update MapView:**
```tsx
<MapView 
  kmlFiles={isFilterActive() ? filteredKmlFiles() : getKmlFilesForMap()} 
  // ... props lainnya sama
/>
```

8. **Update AnalysisTab & FilterTab:**
```tsx
<Show when={showAnalysisTab() && selectedProjectId()}>
  {(() => {
    const project = getSelectedProject();
    if (!project) return null;
    return <AnalysisTab cableData={project.kml.data} ... />;
  })()}
</Show>
```

## 📁 Struktur File

```
src/
├── components/
│   ├── ProjectUploadModal.tsx    ✅ BARU
│   ├── ProjectDetailPanel.tsx     ✅ BARU  
│   ├── SidebarNew.tsx            ✅ BARU
│   ├── Sidebar.tsx               ⚠️ LAMA (simpan untuk referensi)
│   ├── UploadModal.tsx           ⚠️ LAMA (tidak dipakai lagi)
│   └── BoQUploadModal.tsx        ⚠️ LAMA (tidak dipakai lagi)
├── services/
│   └── ProjectLoader.ts          ✅ BARU
└── App.tsx                       ⏳ PERLU UPDATE

public/data/projects/
├── project-rmj-monas-dki.json    ✅ BARU
├── project-rmj-bundaran-hi.json  ✅ BARU
├── project-rmj-senayan.json      ✅ BARU
└── project-rmj-thamrin.json      ✅ BARU
```

## 🎯 Fitur Baru

### Di Sidebar:
- List project dengan nama jelas (RMJ-MONAS-DKI)
- Expand/collapse untuk lihat KML & BOQ
- Tombol info untuk detail lengkap
- Search semua data project
- 1 tombol upload untuk KML + BOQ

### Di Upload Modal:
- Input nama project & kode project
- Upload KML (wajib)
- Upload BOQ (opsional)
- Progress indicator
- Auto-generate nama dari file

### Di Dashboard (klik project):
- Tab Overview: info lengkap, statistik, summary BOQ
- Tab KML: detail statistik KML
- Tab BOQ: tabel lengkap semua item dengan harga
- Format Rupiah Indonesia
- Status badge (Planning, In Progress, Completed)

## ✨ Keuntungan Struktur Baru

1. ✅ KML & BOQ jadi satu kesatuan (1 project)
2. ✅ Nama project lebih jelas & standar
3. ✅ Upload jadi lebih simple (1 modal)
4. ✅ Dashboard menampilkan detail lengkap
5. ✅ Mudah tracking project dengan kode
6. ✅ BOQ opsional (bisa upload KML dulu)
7. ✅ Statistik otomatis dihitung
8. ✅ Data tersimpan di localStorage

## 📝 Catatan Penting

- Semua data dummy sudah termasuk BOQ realistis dengan harga Indonesia
- Statistik project dihitung otomatis dari KML
- localStorage key berubah dari `kmlFiles` & `boqFiles` menjadi `projects`
- File lama masih ada untuk referensi, tapi tidak diimport

Lihat file `docs/PROJECT_RESTRUCTURING_GUIDE.md` untuk detail lengkap dalam bahasa Inggris.
