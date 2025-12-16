import { createSignal, For, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import AgGridSolid from 'ag-grid-solid';
import type { ColDef } from 'ag-grid-community';
import type { ProjectHierarchyProject, BoQItem } from '../types';
import BOQTree from '../components/BOQTree';
import MilestoneFormModal from './MilestoneFormModal';
import BoQFormModal from './BoQFormModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import PaketAreaUnifiedModal from './PaketAreaUnifiedModal';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface MilestoneData {
  id: number;
  no: number;
  milestone: string;
  level: 'High' | 'Medium' | 'Low';
  activity: string;
  remark: string;
  eventPoint: string;
}

interface Props {
  project: ProjectHierarchyProject;
  onClose: () => void;
}

export default function ProjectDetail(props: Props) {
  const [activeTab, setActiveTab] = createSignal<'detail' | 'milestone' | 'boq'>('detail');
  const [expandedAreaIds, setExpandedAreaIds] = createSignal<string[]>([]);
  const [expandedLokasiIds, setExpandedLokasiIds] = createSignal<string[]>([]);
  const [expandedRuasIds, setExpandedRuasIds] = createSignal<string[]>([]);
  
  // Create reactive store for paketAreas
  const [paketAreas, setPaketAreas] = createStore(props.project.paketAreas || []);
  
  // Modal states
  const [showMilestoneModal, setShowMilestoneModal] = createSignal(false);
  const [showBoQModal, setShowBoQModal] = createSignal(false);
  const [editingMilestone, setEditingMilestone] = createSignal<MilestoneData | null>(null);
  const [editingBoQ, setEditingBoQ] = createSignal<BoQItem | null>(null);

  // Paket Area CRUD states
  const [showUnifiedModal, setShowUnifiedModal] = createSignal(false);
  const [editingPaketArea, setEditingPaketArea] = createSignal<any>(null);

  // Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);
  const [deleteConfig, setDeleteConfig] = createSignal<{
    type: 'milestone' | 'boq' | 'area' | 'lokasi' | 'ruas';
    id: number | string;
    name: string;
  } | null>(null);

  function toggleArea(areaId: string) {
    if (expandedAreaIds().includes(areaId)) {
      setExpandedAreaIds(expandedAreaIds().filter(id => id !== areaId));
    } else {
      setExpandedAreaIds([...expandedAreaIds(), areaId]);
    }
  }

  function toggleLokasi(lokasiId: string) {
    if (expandedLokasiIds().includes(lokasiId)) {
      setExpandedLokasiIds(expandedLokasiIds().filter(id => id !== lokasiId));
    } else {
      setExpandedLokasiIds([...expandedLokasiIds(), lokasiId]);
    }
  }

  // Column definitions untuk ruas kontrak table
  const ruasColumnDefs: ColDef[] = [
    { field: 'noRuas', headerName: 'No Ruas', width: 90, filter: true },
    { field: 'namaRuas', headerName: 'Nama Ruas', flex: 1, minWidth: 200, filter: true },
    { field: 'panjangKM', headerName: 'Panjang (KM)', width: 110 },
    { field: 'volumeMeter', headerName: 'Volume (M)', width: 110 },
    { 
      field: 'progressGalian', 
      headerName: 'Progress Galian', 
      width: 150,
      cellRenderer: (params: any) => {
        const progress = params.value || 0;
        const el = document.createElement('div');
        el.className = 'flex items-center gap-2 w-full px-2';
        el.innerHTML = `
          <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div class="bg-green-500 h-2 rounded-full" style="width: ${progress}%"></div>
          </div>
          <span class="text-xs font-semibold text-gray-700 whitespace-nowrap">${progress}%</span>
        `;
        return el;
      }
    },
    { 
      field: 'progressHDPE', 
      headerName: 'Progress HDPE', 
      width: 150,
      cellRenderer: (params: any) => {
        const progress = params.value || 0;
        const el = document.createElement('div');
        el.className = 'flex items-center gap-2 w-full px-2';
        el.innerHTML = `
          <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div class="bg-blue-500 h-2 rounded-full" style="width: ${progress}%"></div>
          </div>
          <span class="text-xs font-semibold text-gray-700 whitespace-nowrap">${progress}%</span>
        `;
        return el;
      }
    },
    { 
      field: 'nilaiDRM', 
      headerName: 'Nilai DRM', 
      width: 130,
      valueFormatter: (params: any) => `Rp ${params.value?.toLocaleString() || 0}`
    },
    { 
      field: 'nilaiRekon', 
      headerName: 'Nilai Rekon', 
      width: 130,
      valueFormatter: (params: any) => `Rp ${params.value?.toLocaleString() || 0}`
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 120,
      pinned: 'right',
      filter: false,
      sortable: false,
      editable: false,
      cellRenderer: (params: any) => {
        const el = document.createElement('div');
        el.style.cssText = 'display: flex; justify-content: center; align-items: center; gap: 4px; height: 100%; padding: 0 4px;';
        
        const isExpanded = expandedRuasIds().includes(params.data.id);
        
        // View Button
        const viewBtn = document.createElement('button');
        viewBtn.type = 'button';
        viewBtn.style.cssText = `
          padding: 4px 12px;
          background: ${isExpanded 
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'};
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: ${isExpanded 
            ? '0 2px 4px rgba(239, 68, 68, 0.3)' 
            : '0 2px 4px rgba(59, 130, 246, 0.3)'};
          white-space: nowrap;
          pointer-events: auto;
        `;
        viewBtn.textContent = isExpanded ? '− Hide Detail' : 'View Detail';
        
        viewBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const currentExpanded = expandedRuasIds();
          if (currentExpanded.includes(params.data.id)) {
            setExpandedRuasIds(currentExpanded.filter(id => id !== params.data.id));
          } else {
            setExpandedRuasIds([...currentExpanded, params.data.id]);
          }
          params.api.refreshCells({ force: true });
        });
        
        el.appendChild(viewBtn);
        return el;
      }
    }
  ];

  // Milestone data sample - expanded based on PDF
  const [milestoneData, setMilestoneData] = createSignal<MilestoneData[]>([
    { id: 1, no: 1, milestone: 'Approval Kontrak', level: 'High', activity: 'Contract Signing', remark: 'OK', eventPoint: '2024-01-15' },
    { id: 2, no: 2, milestone: 'Mobilisasi', level: 'High', activity: 'Site Mobilization', remark: 'OK', eventPoint: '2024-02-01' },
    { id: 3, no: 3, milestone: 'Survey & Design', level: 'Medium', activity: 'Site Survey', remark: 'OK', eventPoint: '2024-02-15' },
    { id: 4, no: 4, milestone: 'Perizinan', level: 'High', activity: 'Permit Processing', remark: 'On Progress', eventPoint: '2024-03-01' },
    { id: 5, no: 5, milestone: 'Pengadaan Material', level: 'Medium', activity: 'Material Procurement', remark: 'OK', eventPoint: '2024-03-15' },
    { id: 6, no: 6, milestone: 'Civil Work', level: 'High', activity: 'Construction', remark: 'On Progress', eventPoint: '2024-04-01' },
    { id: 7, no: 7, milestone: 'Cable Installation', level: 'High', activity: 'Cable Laying', remark: 'On Progress', eventPoint: '2024-05-01' },
    { id: 8, no: 8, milestone: 'Splicing & Termination', level: 'Medium', activity: 'Joint Work', remark: 'Pending', eventPoint: '2024-06-01' },
    { id: 9, no: 9, milestone: 'Testing & Commissioning', level: 'High', activity: 'System Testing', remark: 'Pending', eventPoint: '2024-07-01' },
    { id: 10, no: 10, milestone: 'Handover', level: 'High', activity: 'Project Handover', remark: 'Pending', eventPoint: '2024-08-01' },
    { id: 11, no: 11, milestone: 'As Built Drawing', level: 'Medium', activity: 'Documentation', remark: 'Pending', eventPoint: '2024-08-15' },
    { id: 12, no: 12, milestone: 'BAP 100%', level: 'High', activity: 'Final Acceptance', remark: 'Pending', eventPoint: '2024-09-01' }
  ]);

  // BoQ data with state
  const [boqData, setBoqData] = createSignal<BoQItem[]>([
    {
      id: 1,
      no: 1,
      description: 'Galian Tanah Manual',
      unit: 'M3',
      quantity: 150.5,
      unitPrice: 85000,
      totalPrice: 12792500,
      category: 'Pekerjaan Tanah',
      notes: 'Termasuk pembersihan lahan'
    },
    {
      id: 2,
      no: 2,
      description: 'Pemasangan Kabel FO',
      unit: 'Km',
      quantity: 2.5,
      unitPrice: 15000000,
      totalPrice: 37500000,
      category: 'Pekerjaan Kabel',
      notes: 'Kabel fiber optic 48 core'
    },
    {
      id: 3,
      no: 3,
      description: 'Pemasangan HDPE Pipe',
      unit: 'M',
      quantity: 2500,
      unitPrice: 45000,
      totalPrice: 112500000,
      category: 'Pekerjaan Pipa',
      notes: 'HDPE diameter 50mm'
    },
    {
      id: 4,
      no: 4,
      description: 'Handhole Beton',
      unit: 'Unit',
      quantity: 25,
      unitPrice: 1500000,
      totalPrice: 37500000,
      category: 'Pekerjaan Sipil',
      notes: 'Ukuran 60x60x80 cm'
    },
    {
      id: 5,
      no: 5,
      description: 'Jointing & Terminasi',
      unit: 'Titik',
      quantity: 12,
      unitPrice: 2500000,
      totalPrice: 30000000,
      category: 'Pekerjaan Kabel',
      notes: 'Termasuk testing'
    },
    {
      id: 6,
      no: 6,
      description: 'Pengaspalan',
      unit: 'M2',
      quantity: 120,
      unitPrice: 350000,
      totalPrice: 42000000,
      category: 'Pekerjaan Finishing',
      notes: 'Hotmix tebal 5cm'
    },
    {
      id: 7,
      no: 7,
      description: 'Manhole',
      unit: 'Unit',
      quantity: 8,
      unitPrice: 3500000,
      totalPrice: 28000000,
      category: 'Pekerjaan Sipil',
      notes: 'Ukuran 120x120x150 cm'
    },
    {
      id: 8,
      no: 8,
      description: 'Boring Horizontal',
      unit: 'M',
      quantity: 80,
      unitPrice: 450000,
      totalPrice: 36000000,
      category: 'Pekerjaan Tanah',
      notes: 'Untuk crossing jalan'
    },
    {
      id: 9,
      no: 9,
      description: 'ODP (Optical Distribution Point)',
      unit: 'Unit',
      quantity: 15,
      unitPrice: 2800000,
      totalPrice: 42000000,
      category: 'Pekerjaan Perangkat',
      notes: 'Kapasitas 16 core'
    },
    {
      id: 10,
      no: 10,
      description: 'Testing & Commissioning',
      unit: 'LS',
      quantity: 1,
      unitPrice: 25000000,
      totalPrice: 25000000,
      category: 'Pekerjaan Testing',
      notes: 'OTDR dan power meter'
    },
  ]);

  // CRUD Functions for Milestone
  const handleSaveMilestone = (data: Partial<MilestoneData>) => {
    if (editingMilestone()) {
      // Edit existing
      setMilestoneData(milestoneData().map(item => 
        item.id === editingMilestone()!.id ? { ...item, ...data } : item
      ));
    } else {
      // Add new
      const newId = Math.max(...milestoneData().map(m => m.id), 0) + 1;
      const newNo = Math.max(...milestoneData().map(m => m.no), 0) + 1;
      setMilestoneData([...milestoneData(), { id: newId, no: newNo, ...data } as MilestoneData]);
    }
    setEditingMilestone(null);
  };

  const handleDeleteMilestone = (id: number) => {
    const milestone = milestoneData().find(m => m.id === id);
    if (milestone) {
      setDeleteConfig({
        type: 'milestone',
        id: id,
        name: milestone.milestone
      });
      setShowDeleteConfirm(true);
    }
  };

  const handleEditMilestone = (milestone: MilestoneData) => {
    setEditingMilestone(milestone);
    setShowMilestoneModal(true);
  };

  // CRUD Functions for BoQ
  const handleSaveBoQ = (data: Partial<BoQItem>) => {
    if (editingBoQ()) {
      // Edit existing
      setBoqData(boqData().map(item => 
        item.id === editingBoQ()!.id ? { ...item, ...data } : item
      ));
    } else {
      // Add new
      const newId = Math.max(...boqData().map(b => b.id || 0), 0) + 1;
      const newNo = Math.max(...boqData().map(b => b.no || 0), 0) + 1;
      setBoqData([...boqData(), { id: newId, no: newNo, ...data } as BoQItem]);
    }
    setEditingBoQ(null);
  };

  const handleDeleteBoQ = (id: number) => {
    const boq = boqData().find(b => b.id === id);
    if (boq) {
      setDeleteConfig({
        type: 'boq',
        id: id,
        name: boq.description || 'Unnamed Item'
      });
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    const config = deleteConfig();
    if (config) {
      if (config.type === 'milestone') {
        setMilestoneData(milestoneData().filter(item => item.id !== config.id));
      } else if (config.type === 'boq') {
        setBoqData(boqData().filter(item => item.id !== config.id));
      } else if (config.type === 'area') {
        // Delete Area from paketAreas
        setPaketAreas(areas => areas.filter(area => area.id !== config.id));
      } else if (config.type === 'lokasi') {
        // Delete Lokasi from Area
        setPaketAreas(areas => 
          areas.map(area => ({
            ...area,
            lokasis: area.lokasis?.filter(lokasi => lokasi.id !== config.id) || []
          }))
        );
      } else if (config.type === 'ruas') {
        // Delete Ruas from Lokasi
        setPaketAreas(areas =>
          areas.map(area => ({
            ...area,
            lokasis: area.lokasis?.map(lokasi => ({
              ...lokasi,
              ruasKontraks: lokasi.ruasKontraks?.filter(ruas => ruas.id !== config.id) || []
            })) || []
          }))
        );
      }
    }
    setShowDeleteConfirm(false);
    setDeleteConfig(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteConfig(null);
  };

  const handleEditBoQ = (boq: BoQItem) => {
    setEditingBoQ(boq);
    setShowBoQModal(true);
  };

  // CRUD Functions for Paket Area (Unified)
  const handleSavePaketArea = (data: {
    areaId: string;
    namaArea: string;
    lokasis: any[];
  }) => {
    if (editingPaketArea()) {
      // Edit existing area
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
              noRuas: ruas.noRuas,
              namaRuas: ruas.namaRuas,
              panjangKM: ruas.panjangKM,
              volumeMeter: ruas.volumeMeter,
              progressGalian: ruas.progressGalian,
              progressHDPE: ruas.progressHDPE,
              nilaiDRM: ruas.nilaiDRM,
              nilaiRekon: ruas.nilaiRekon,
              boqCustomers: ruas.boqCustomers || [],
              boqIndikatifs: ruas.boqIndikatifs || []
            }))
          }))
        }
      );
    } else {
      // Add new area
      const newArea = {
        id: `area-${Date.now()}`,
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
            noRuas: ruas.noRuas,
            namaRuas: ruas.namaRuas,
            panjangKM: ruas.panjangKM,
            volumeMeter: ruas.volumeMeter,
            progressGalian: ruas.progressGalian,
            progressHDPE: ruas.progressHDPE,
            nilaiDRM: ruas.nilaiDRM,
            nilaiRekon: ruas.nilaiRekon,
            boqCustomers: [],
            boqIndikatifs: []
          }))
        }))
      };
      setPaketAreas(paketAreas.length, newArea);
    }
    setEditingPaketArea(null);
    setShowUnifiedModal(false);
  };

  // Milestone data sample - expanded based on PDF

  // Column definitions untuk milestone table
  const milestoneColumnDefs: ColDef[] = [
    { field: 'no', headerName: 'No', width: 70, pinned: 'left' },
    { field: 'milestone', headerName: 'Milestone', width: 200, filter: true, floatingFilter: true },
    { 
      field: 'level', 
      headerName: 'Level', 
      width: 110,
      filter: true,
      cellRenderer: (params: any) => {
        const level = params.value;
        const el = document.createElement('span');
        el.className = `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
          level === 'High' 
            ? 'bg-red-100 text-red-800' 
            : level === 'Medium'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        }`;
        el.textContent = level;
        return el;
      }
    },
    { field: 'activity', headerName: 'Activity', flex: 1, minWidth: 180, filter: true, floatingFilter: true },
    { 
      field: 'remark', 
      headerName: 'Remark', 
      width: 130,
      filter: true,
      cellRenderer: (params: any) => {
        const remark = params.value;
        const el = document.createElement('span');
        const colors = {
          'OK': 'bg-green-100 text-green-800',
          'On Progress': 'bg-blue-100 text-blue-800',
          'Pending': 'bg-gray-100 text-gray-800',
          'Delay': 'bg-orange-100 text-orange-800'
        };
        el.className = `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colors[remark as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`;
        el.textContent = remark;
        return el;
      }
    },
    { field: 'eventPoint', headerName: 'Event Point', width: 130, filter: true },
    {
      field: 'action',
      headerName: 'Action',
      width: 150,
      pinned: 'right',
      filter: false,
      sortable: false,
      editable: false,
      cellRenderer: (params: any) => {
        const el = document.createElement('div');
        el.className = 'flex items-center justify-center gap-2 h-full';
        
        // Edit Button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.title = 'Edit';
        editBtn.className = 'px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-medium transition-colors';
        editBtn.onclick = () => handleEditMilestone(params.data);
        
        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.title = 'Delete';
        deleteBtn.className = 'px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors';
        deleteBtn.onclick = () => handleDeleteMilestone(params.data.id);
        
        el.appendChild(editBtn);
        el.appendChild(deleteBtn);
        return el;
      }
    }
  ];

  // BoQ Column Definitions
  const boqColumnDefs: ColDef[] = [
    { 
      field: 'no', 
      headerName: 'No', 
      width: 70, 
      pinned: 'left',
      filter: 'agNumberColumnFilter'
    },
    { 
      field: 'description', 
      headerName: 'Description', 
      width: 300,
      filter: 'agTextColumnFilter'
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 180,
      filter: 'agTextColumnFilter'
    },
    { 
      field: 'unit', 
      headerName: 'Unit', 
      width: 100,
      filter: 'agTextColumnFilter'
    },
    { 
      field: 'quantity', 
      headerName: 'Quantity', 
      width: 120,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params: any) => params.value?.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    { 
      field: 'unitPrice', 
      headerName: 'Unit Price (Rp)', 
      width: 150,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params: any) => 'Rp ' + params.value?.toLocaleString('id-ID')
    },
    { 
      field: 'totalPrice', 
      headerName: 'Total Price (Rp)', 
      width: 180,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params: any) => 'Rp ' + params.value?.toLocaleString('id-ID'),
      cellStyle: { fontWeight: 'bold', color: '#2563eb' }
    },
    { 
      field: 'notes', 
      headerName: 'Notes', 
      width: 250,
      filter: 'agTextColumnFilter'
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 150,
      pinned: 'right',
      filter: false,
      sortable: false,
      editable: false,
      cellRenderer: (params: any) => {
        const el = document.createElement('div');
        el.className = 'flex items-center justify-center gap-2 h-full';
        
        // Edit Button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.title = 'Edit';
        editBtn.className = 'px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-medium transition-colors';
        editBtn.onclick = () => handleEditBoQ(params.data);
        
        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.title = 'Delete';
        deleteBtn.className = 'px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors';
        deleteBtn.onclick = () => handleDeleteBoQ(params.data.id);
        
        el.appendChild(editBtn);
        el.appendChild(deleteBtn);
        return el;
      }
    }
  ];

  const boqSummary = () => {
    const data = boqData();
    return {
      totalItems: data.length,
      totalCost: data.reduce((sum, item) => sum + item.totalPrice, 0),
      materialCost: data.filter(item => 
        item.category?.includes('Kabel') || item.category?.includes('Perangkat') || item.category?.includes('Pipa')
      ).reduce((sum, item) => sum + item.totalPrice, 0),
      laborCost: data.filter(item => 
        item.category?.includes('Tanah') || item.category?.includes('Sipil') || item.category?.includes('Testing')
      ).reduce((sum, item) => sum + item.totalPrice, 0),
    };
  };

  return (
    <div class="bg-white h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div class="flex items-start justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 flex-shrink-0">
        <div>
          <h4 class="text-xl font-bold text-gray-800">Detail Kontrak: {props.project.namaKontrak}</h4>
          <p class="text-sm text-gray-600 mt-1">
            <span class="font-medium">No Kontrak:</span> {props.project.noKontrak} • 
            <span class="font-medium ml-2">TREG:</span> {props.project.treg} • 
            <span class="font-medium ml-2">Area:</span> {props.project.area}
          </p>
        </div>
        <button 
          class="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg transition-colors shadow-sm border border-gray-200 font-medium"
          onClick={props.onClose}
        >
          Close
        </button>
      </div>

      {/* Tabs */}
      <div class="px-6 pt-3 flex-shrink-0">
        <div class="flex gap-2 border-b border-gray-200">
          <button 
            class={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
              activeTab() === 'detail' 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`} 
            onClick={() => setActiveTab('detail')}
          >
            📋 Detail Kontrak
          </button>
          <button 
            class={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
              activeTab() === 'milestone' 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`} 
            onClick={() => setActiveTab('milestone')}
          >
            🎯 Milestone
          </button>
          <button 
            class={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
              activeTab() === 'boq' 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`} 
            onClick={() => setActiveTab('boq')}
          >
            💰 Bill of Quantities
          </button>
        </div>
      </div>

      {/* Content */}
      <div class="flex-1 overflow-auto px-6 py-4">
        <Show when={activeTab() === 'detail'}>
          <div>
            <div class="grid grid-cols-3 gap-3 mb-4">
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                <div class="text-xs text-blue-600 font-semibold mb-1">Nama Kontrak</div>
                <div class="text-xs font-bold text-gray-800">{props.project.namaKontrak}</div>
              </div>
              <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
                <div class="text-xs text-purple-600 font-semibold mb-1">Program</div>
                <div class="text-xs font-bold text-gray-800">{props.project.program}</div>
              </div>
              <div class="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                <div class="text-xs text-green-600 font-semibold mb-1">Plan RFS</div>
                <div class="text-xs font-bold text-gray-800">{props.project.planRFS}</div>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-3">
                <h5 class="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Paket Area
                </h5>
                <button
                  onClick={() => {
                    setEditingPaketArea(null);
                    setShowUnifiedModal(true);
                  }}
                  class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors shadow-sm flex items-center gap-1"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Area
                </button>
              </div>
              <div class="space-y-3">
                <For each={paketAreas}>
                  {(pa) => (
                    <div class="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                      {/* Area Header */}
                      <div 
                        class="p-3 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 border-blue-500"
                        onClick={() => toggleArea(pa.id)}
                      >
                        <div class="flex items-start justify-between gap-3">
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                              <span class="text-sm font-bold text-blue-700">{pa.namaArea}</span>
                              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                                Area ID: {pa.areaId}
                              </span>
                              <span class="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                {pa.lokasis?.length || 0} Lokasi
                              </span>
                            </div>
                          </div>
                          <div class="flex items-center gap-2">
                            <button 
                              class="flex-shrink-0 px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPaketArea(pa);
                                setShowUnifiedModal(true);
                              }}
                              title="Edit Area"
                            >
                              Edit
                            </button>
                            <button 
                              class="flex-shrink-0 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfig({
                                  type: 'area',
                                  id: pa.id,
                                  name: pa.namaArea
                                });
                                setShowDeleteConfirm(true);
                              }}
                              title="Delete Area"
                            >
                              Delete
                            </button>
                            <button 
                              class="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleArea(pa.id);
                              }}
                            >
                              <span class="text-gray-600 font-bold text-sm">
                                {expandedAreaIds().includes(pa.id) ? '−' : '+'}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Lokasi List */}
                      <Show when={expandedAreaIds().includes(pa.id)}>
                        <div class="border-t border-gray-200 bg-gray-50 p-3">
                          <div class="space-y-2">
                            <For each={pa.lokasis || []}>
                              {(lokasi) => (
                                <div class="bg-white border border-gray-200 rounded-md overflow-hidden">
                                  <div 
                                    class="p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => toggleLokasi(lokasi.id)}
                                  >
                                    <div class="flex items-center justify-between gap-2">
                                      <div class="flex-1">
                                        <div class="flex items-center gap-2 mb-1">
                                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-500 text-white">
                                            {lokasi.kode}
                                          </span>
                                          <span class="text-xs font-bold text-gray-900">{lokasi.siteName}</span>
                                        </div>
                                        <div class="text-xs text-gray-600 flex items-center gap-3">
                                          <span>Mitra: <span class="font-semibold text-gray-900">{lokasi.mitra}</span></span>
                                          <span class="text-gray-400">•</span>
                                          <span>Witel: <span class="font-semibold text-gray-900">{lokasi.witel}</span></span>
                                          <Show when={lokasi.ruasKontraks && lokasi.ruasKontraks.length > 0}>
                                            <span class="text-gray-400">•</span>
                                            <span>Ruas: <span class="font-semibold text-gray-900">{lokasi.ruasKontraks.length}</span></span>
                                          </Show>
                                        </div>
                                      </div>
                                      <div class="flex items-center gap-2">
                                        <button 
                                          class="flex-shrink-0 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteConfig({
                                              type: 'lokasi',
                                              id: lokasi.id,
                                              name: lokasi.siteName
                                            });
                                            setShowDeleteConfirm(true);
                                          }}
                                          title="Delete Lokasi"
                                        >
                                          Delete
                                        </button>
                                        <button 
                                          class="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleLokasi(lokasi.id);
                                          }}
                                        >
                                          <span class="text-gray-600 text-xs font-bold">
                                            {expandedLokasiIds().includes(lokasi.id) ? '▼' : '▶'}
                                          </span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Ruas Kontrak Details */}
                                  <Show when={expandedLokasiIds().includes(lokasi.id) && lokasi.ruasKontraks && lokasi.ruasKontraks.length > 0}>
                                    <div class="border-t border-gray-200 bg-gray-50 p-3">
                                      <div class="flex items-center justify-between mb-3">
                                        <div class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                          <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                          </svg>
                                          Tabel Ruas Kontrak
                                          <span class="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                                            {lokasi.ruasKontraks.length} Ruas
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <div class="ag-theme-alpine" style="width: 100%;">
                                        <AgGridSolid
                                          columnDefs={ruasColumnDefs}
                                          rowData={lokasi.ruasKontraks}
                                          defaultColDef={{
                                            sortable: true,
                                            resizable: true,
                                          }}
                                          domLayout="autoHeight"
                                        />
                                      </div>

                                      {/* Show BOQ Tree when ruas is expanded */}
                                      <For each={lokasi.ruasKontraks}>
                                        {(ruas) => (
                                          <Show when={expandedRuasIds().includes(ruas.id)}>
                                            <div class="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                                              <div class="mb-2 pb-2 border-b border-gray-200">
                                                <div class="flex items-center gap-2">
                                                  <span class="inline-flex items-center px-2 py-1 rounded text-sm font-semibold bg-orange-600 text-white">
                                                    {ruas.noRuas}
                                                  </span>
                                                  <span class="text-sm font-bold text-gray-900">{ruas.namaRuas}</span>
                                                </div>
                                              </div>
                                              <BOQTree 
                                                boqCustomers={ruas.boqCustomers || []} 
                                                boqIndikatifs={ruas.boqIndikatifs || []} 
                                              />
                                            </div>
                                          </Show>
                                        )}
                                      </For>
                                    </div>
                                  </Show>
                                </div>
                              )}
                            </For>
                          </div>
                        </div>
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </Show>

        <Show when={activeTab() === 'milestone'}>
          <div>
            {/* Create Button */}
            <div class="mb-4 flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-800">Milestone Management</h3>
              <button
                onClick={() => {
                  setEditingMilestone(null);
                  setShowMilestoneModal(true);
                }}
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                Add New Milestone
              </button>
            </div>

            {/* Milestone Grid */}
            <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div class="ag-theme-alpine h-[500px] w-full">
                <AgGridSolid
                  columnDefs={milestoneColumnDefs}
                  rowData={milestoneData()}
                  defaultColDef={{
                    sortable: true,
                    resizable: true,
                  }}
                  pagination={true}
                  paginationPageSize={20}
                  paginationPageSizeSelector={[10, 20, 50]}
                  rowHeight={48}
                  headerHeight={56}
                />
              </div>
            </div>
          </div>
        </Show>

        <Show when={activeTab() === 'boq'}>
          <div>
            {/* Create Button */}
            <div class="mb-4 flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-800">Bill of Quantities Management</h3>
              <button
                onClick={() => {
                  setEditingBoQ(null);
                  setShowBoQModal(true);
                }}
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                Add New BoQ Item
              </button>
            </div>

            {/* Summary Cards */}
            <div class="grid grid-cols-4 gap-4 mb-4">
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div class="text-xs text-blue-600 font-semibold mb-1">Total Items</div>
                <div class="text-2xl font-bold text-gray-800">{boqSummary().totalItems}</div>
              </div>
              <div class="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div class="text-xs text-green-600 font-semibold mb-1">Total Cost</div>
                <div class="text-lg font-bold text-gray-800">
                  Rp {boqSummary().totalCost.toLocaleString('id-ID')}
                </div>
              </div>
              <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div class="text-xs text-purple-600 font-semibold mb-1">Material Cost</div>
                <div class="text-lg font-bold text-gray-800">
                  Rp {boqSummary().materialCost.toLocaleString('id-ID')}
                </div>
              </div>
              <div class="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                <div class="text-xs text-orange-600 font-semibold mb-1">Labor Cost</div>
                <div class="text-lg font-bold text-gray-800">
                  Rp {boqSummary().laborCost.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* BoQ Grid */}
            <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div class="ag-theme-alpine h-[500px] w-full">
                <AgGridSolid
                  columnDefs={boqColumnDefs}
                  rowData={boqData()}
                  defaultColDef={{
                    sortable: true,
                    resizable: true,
                  }}
                  pagination={true}
                  paginationPageSize={20}
                  paginationPageSizeSelector={[10, 20, 50]}
                  rowHeight={48}
                  headerHeight={56}
                />
              </div>
            </div>
          </div>
        </Show>
      </div>

      {/* Modals */}
      <MilestoneFormModal
        isOpen={showMilestoneModal()}
        onClose={() => {
          setShowMilestoneModal(false);
          setEditingMilestone(null);
        }}
        onSave={handleSaveMilestone}
        editData={editingMilestone()}
        nextNo={Math.max(...milestoneData().map(m => m.no), 0) + 1}
      />

      <BoQFormModal
        isOpen={showBoQModal()}
        onClose={() => {
          setShowBoQModal(false);
          setEditingBoQ(null);
        }}
        onSave={handleSaveBoQ}
        editData={editingBoQ()}
        nextNo={Math.max(...boqData().map(b => b.no || 0), 0) + 1}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm()}
        title={
          deleteConfig()?.type === 'milestone' ? '⚠️ Hapus Milestone?' :
          deleteConfig()?.type === 'boq' ? '⚠️ Hapus Item BoQ?' :
          deleteConfig()?.type === 'area' ? '⚠️ Hapus Area?' :
          deleteConfig()?.type === 'lokasi' ? '⚠️ Hapus Lokasi?' :
          '⚠️ Hapus Ruas Kontrak?'
        }
        message={
          deleteConfig()?.type === 'milestone' 
            ? 'Apakah Anda yakin ingin menghapus milestone ini? Data yang sudah dihapus tidak dapat dikembalikan.'
            : deleteConfig()?.type === 'boq'
            ? 'Apakah Anda yakin ingin menghapus item BoQ ini? Data yang sudah dihapus tidak dapat dikembalikan.'
            : deleteConfig()?.type === 'area'
            ? 'Apakah Anda yakin ingin menghapus area ini? Semua lokasi dan ruas kontrak di dalamnya juga akan dihapus.'
            : deleteConfig()?.type === 'lokasi'
            ? 'Apakah Anda yakin ingin menghapus lokasi ini? Semua ruas kontrak di dalamnya juga akan dihapus.'
            : 'Apakah Anda yakin ingin menghapus ruas kontrak ini? Data yang sudah dihapus tidak dapat dikembalikan.'
        }
        itemName={deleteConfig()?.name || ''}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Paket Area Unified Modal */}
      <PaketAreaUnifiedModal
        show={showUnifiedModal()}
        onClose={() => {
          setShowUnifiedModal(false);
          setEditingPaketArea(null);
        }}
        onSave={handleSavePaketArea}
        editingData={editingPaketArea()}
      />
    </div>
  );
}
