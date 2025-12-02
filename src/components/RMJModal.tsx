import { createSignal, Show, onMount, For, createEffect } from 'solid-js';
import AgGridSolid from 'ag-grid-solid';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { LicenseManager } from 'ag-grid-enterprise';
import type { ColDef, GridOptions, GridApi } from 'ag-grid-community';
import type { RMJSitelistRow, RMJUser, RMJViewTemplate, UserRole, AccessLevel } from '../types';
import * as XLSX from 'xlsx';

// Add custom styles for AG Grid
const customGridStyles = `
  .ag-theme-alpine .ag-header {
    background: linear-gradient(135deg, #2b7fff 0%, #2b7fff 100%);
    color: white;
    font-weight: 600;
  }
  
  .ag-theme-alpine .ag-header-cell-label {
    color: white;
    font-size: 13px;
  }
  
  .ag-theme-alpine .ag-icon {
    color: white;
  }
  
  .ag-theme-alpine .ag-row {
    font-size: 13px;
  }
  
  .ag-theme-alpine .ag-cell {
    display: flex;
    align-items: center;
    line-height: 20px;
    padding-top: 8px;
    padding-bottom: 8px;
  }
  
  .ag-theme-alpine .ag-row-odd {
    background-color: #f8fafc;
  }
  
  .ag-theme-alpine .ag-row-hover {
    background-color: #e0e7ff !important;
  }
  
  .ag-theme-alpine .ag-row-selected {
    background-color: #dbeafe !important;
  }
  
  .ag-theme-alpine .ag-cell-focus {
    border: 2px solid #264aeaff !important;
  }
  
  .ag-theme-alpine .ag-ltr .ag-cell {
    border-right: 1px solid #e5e7eb;
  }
  
  .ag-menu .red-item {
    color: #ef4444;
  }
  
  .ag-menu .red-item:hover {
    background-color: #fee2e2;
  }
  
  .action-btn-edit {
    padding: 6px 14px;
    background: linear-gradient(135deg, #814f00ff 0%, #b87311ff 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
  }
  
  .action-btn-edit:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = customGridStyles;
  document.head.appendChild(styleElement);
}

// Set AG Grid Enterprise License (Trial)
LicenseManager.setLicenseKey('[TRIAL]_this_{AG_Charts_and_AG_Grid}_Enterprise_key_{AG-113850}_is_granted_for_evaluation_only___Use_in_production_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_purchasing_a_production_key_please_contact_info@ag-grid.com___You_are_granted_a_{Single_Application}_Developer_License_for_one_application_only___All_Front-End_JavaScript_developers_working_on_the_application_would_need_to_be_licensed___This_key_will_deactivate_on_{1 January 2026}____[v3]_[0102]_MTc2NzIyNTYwMDAwMA==77931508b786a1519feb9ddef5f01e67');

interface RMJModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: UserRole;
  userEmail?: string;
}

// Project data type
interface Project {
  id: string;
  name: string;
  year: string;
  program: string;
  description: string;
}

export function RMJModal(props: RMJModalProps) {
  console.log('RMJModal rendered, isOpen:', props.isOpen);
  
  const [activeTab, setActiveTab] = createSignal<'sitelist' | 'settings' | 'users'>('sitelist');
  const [searchQuery, setSearchQuery] = createSignal('');
  const [gridApi, setGridApi] = createSignal<GridApi | null>(null);
  const [isGridReady, setIsGridReady] = createSignal(false);
  
  // Project Selection State
  const [selectedProject, setSelectedProject] = createSignal<string>('project1');
  
  // User Management State
  const [showUserForm, setShowUserForm] = createSignal(false);
  const [editingUser, setEditingUser] = createSignal<RMJUser | null>(null);
  const [userGridApi, setUserGridApi] = createSignal<GridApi | null>(null);
  const [userDataTab, setUserDataTab] = createSignal<'all' | 'selected'>('all');
  const [selectedUsers, setSelectedUsers] = createSignal<RMJUser[]>([]);
  
  // User filter state
  const [userNameFilter, setUserNameFilter] = createSignal('');
  const [userRoleFilter, setUserRoleFilter] = createSignal('');
  const [userUnitFilter, setUserUnitFilter] = createSignal('');
  
  // Template Settings State
  const [showTemplateForm, setShowTemplateForm] = createSignal(false);
  const [templateName, setTemplateName] = createSignal('');
  const [templateDescription, setTemplateDescription] = createSignal('');
  const [expandedTemplate, setExpandedTemplate] = createSignal<string | null>(null);
  
  // Projects data
  const projects: Project[] = [
    {
      id: 'project1',
      name: 'PROJECT_SITELIST / UNIXID',
      year: '2023',
      program: 'Ant_leveling',
      description: 'COAD12-Ant_leveling-2023',
    },
    {
      id: 'project2',
      name: 'New_Combat',
      year: '2024',
      program: 'CD036',
      description: 'New_Combat-CD036-2024',
    },
    {
      id: 'project3',
      name: 'Infrastructure_Upgrade',
      year: '2024',
      program: 'INF_UPG',
      description: 'Infrastructure-Upgrade-2024',
    },
  ];

  // Sample data for Project 1
  const sampleDataProject1: RMJSitelistRow[] = [
    {
      unixId: 'U-01BKDI-148',
      customerId: 'Akad Mitra',
      siteId: 'DBBKDI148_M',
      siteName: 'DBBKDI148_M',
      deliveryRegion: 'West Java',
      areaName: 'Area B',
      installation: 'PT. ADIWARNA TELECOM',
      wiDnUgas: '199C-01-01B',
      subcontractor: 'PT. ADIWARNA TELECOM',
      siteOwner: 'M. Ilham S',
      installationPd: '2023-10-31',
      wiWeeklyPlan: 'Done',
      mosCnInstallationCompleted: 'Done',
      planEndDate: '2024-02-16',
      actualEndDate: '2024-02-16',
      owner: 'PT. ABC',
      action: '',
      milestone1: 'Done',
      milestone2: 'In Progress',
      milestone3: 'Pending',
    },
    {
      unixId: 'U-01BKDI-149',
      customerId: 'Akad Mitra',
      siteId: 'DBBKDI149_M',
      siteName: 'DBBKDI149_M',
      deliveryRegion: 'West Java',
      areaName: 'Area B',
      installation: 'PT. ADIWARNA TELECOM',
      wiDnUgas: '199C-01-02B',
      subcontractor: 'PT. ADIWARNA TELECOM',
      siteOwner: 'Fery Hardiansyah',
      installationPd: '2023-11-28',
      wiWeeklyPlan: 'Done',
      mosCnInstallationCompleted: 'Done',
      planEndDate: '2024-02-16',
      actualEndDate: '2024-02-16',
      owner: 'PT. XYZ',
      action: '',
      milestone1: 'Done',
      milestone2: 'Done',
      milestone3: 'In Progress',
    },
    {
      unixId: 'U-01BKDI-150',
      customerId: 'Akad Mitra',
      siteId: 'DBBKDI150_M',
      siteName: 'DBBKDI150_M',
      deliveryRegion: 'Central Java',
      areaName: 'Area C',
      installation: 'PT. BUANA NETWORK',
      wiDnUgas: '199C-01-03C',
      subcontractor: 'PT. BUANA NETWORK',
      siteOwner: 'Ahmad Rizki',
      installationPd: '2023-12-15',
      wiWeeklyPlan: 'In Progress',
      mosCnInstallationCompleted: 'Pending',
      planEndDate: '2024-03-20',
      actualEndDate: '',
      owner: 'PT. DEF',
      action: '',
      milestone1: 'Done',
      milestone2: 'In Progress',
      milestone3: 'Pending',
    },
    {
      unixId: 'U-01BKDI-151',
      customerId: 'Akad Mitra',
      siteId: 'DBBKDI151_M',
      siteName: 'DBBKDI151_M',
      deliveryRegion: 'East Java',
      areaName: 'Area D',
      installation: 'PT. CIPTA TEKNOLOGI',
      wiDnUgas: '199C-01-04D',
      subcontractor: 'PT. CIPTA TEKNOLOGI',
      siteOwner: 'Budi Santoso',
      installationPd: '2024-01-10',
      wiWeeklyPlan: 'Pending',
      mosCnInstallationCompleted: 'Pending',
      planEndDate: '2024-04-15',
      actualEndDate: '',
      owner: 'PT. GHI',
      action: '',
      milestone1: 'In Progress',
      milestone2: 'Pending',
      milestone3: 'Pending',
    },
    {
      unixId: 'U-01BKDI-152',
      customerId: 'Akad Mitra',
      siteId: 'DBBKDI152_M',
      siteName: 'DBBKDI152_M',
      deliveryRegion: 'West Java',
      areaName: 'Area A',
      installation: 'PT. DIGITAL SOLUTION',
      wiDnUgas: '199C-01-05A',
      subcontractor: 'PT. DIGITAL SOLUTION',
      siteOwner: 'Siti Nurhaliza',
      installationPd: '2024-02-01',
      wiWeeklyPlan: 'Done',
      mosCnInstallationCompleted: 'Done',
      planEndDate: '2024-05-10',
      actualEndDate: '2024-05-08',
      owner: 'PT. JKL',
      action: '',
      milestone1: 'Done',
      milestone2: 'Done',
      milestone3: 'In Progress',
    },
    {
      unixId: 'U-01BKDI-153',
      customerId: 'Akad Mitra',
      siteId: 'DBBKDI153_M',
      siteName: 'DBBKDI153_M',
      deliveryRegion: 'Central Java',
      areaName: 'Area B',
      installation: 'PT. ENERKOM INDONESIA',
      wiDnUgas: '199C-01-06B',
      subcontractor: 'PT. ENERKOM INDONESIA',
      siteOwner: 'Dedi Kurniawan',
      installationPd: '2024-03-05',
      wiWeeklyPlan: 'In Progress',
      mosCnInstallationCompleted: 'In Progress',
      planEndDate: '2024-06-20',
      actualEndDate: '',
      owner: 'PT. MNO',
      action: '',
      milestone1: 'Done',
      milestone2: 'In Progress',
      milestone3: 'Pending',
    },
  ];

  // Sample data for Project 2
  const sampleDataProject2: RMJSitelistRow[] = [
    {
      unixId: 'U-02JKTA-201',
      customerId: 'Telkom Indonesia',
      siteId: 'JKTCB201_T',
      siteName: 'JKTCB201_T',
      deliveryRegion: 'Jakarta',
      areaName: 'Area A',
      installation: 'PT. TELKOM AKSES',
      wiDnUgas: '200D-02-01A',
      subcontractor: 'PT. TELKOM AKSES',
      siteOwner: 'Andi Wijaya',
      installationPd: '2024-01-15',
      wiWeeklyPlan: 'Done',
      mosCnInstallationCompleted: 'Done',
      planEndDate: '2024-03-30',
      actualEndDate: '2024-03-28',
      owner: 'PT. Telkom',
      action: '',
      milestone1: 'Done',
      milestone2: 'Done',
      milestone3: 'Done',
    },
    {
      unixId: 'U-02JKTA-202',
      customerId: 'Telkom Indonesia',
      siteId: 'JKTCB202_T',
      siteName: 'JKTCB202_T',
      deliveryRegion: 'Jakarta',
      areaName: 'Area B',
      installation: 'PT. TELKOM AKSES',
      wiDnUgas: '200D-02-02B',
      subcontractor: 'PT. TELKOM AKSES',
      siteOwner: 'Budi Hartono',
      installationPd: '2024-02-01',
      wiWeeklyPlan: 'In Progress',
      mosCnInstallationCompleted: 'In Progress',
      planEndDate: '2024-04-15',
      actualEndDate: '',
      owner: 'PT. Telkom',
      action: '',
      milestone1: 'Done',
      milestone2: 'In Progress',
      milestone3: 'Pending',
    },
  ];

  // Sample data for Project 3
  const sampleDataProject3: RMJSitelistRow[] = [
    {
      unixId: 'U-03BDNG-301',
      customerId: 'Enterprise Client',
      siteId: 'BDGUPG301_E',
      siteName: 'BDGUPG301_E',
      deliveryRegion: 'West Java',
      areaName: 'Area C',
      installation: 'PT. INFRASTRUKTUR DIGITAL',
      wiDnUgas: '201E-03-01C',
      subcontractor: 'PT. INFRASTRUKTUR DIGITAL',
      siteOwner: 'Citra Dewi',
      installationPd: '2024-03-01',
      wiWeeklyPlan: 'Pending',
      mosCnInstallationCompleted: 'Pending',
      planEndDate: '2024-06-30',
      actualEndDate: '',
      owner: 'PT. Enterprise',
      action: '',
      milestone1: 'In Progress',
      milestone2: 'Pending',
      milestone3: 'Pending',
    },
    {
      unixId: 'U-03BDNG-302',
      customerId: 'Enterprise Client',
      siteId: 'BDGUPG302_E',
      siteName: 'BDGUPG302_E',
      deliveryRegion: 'West Java',
      areaName: 'Area D',
      installation: 'PT. INFRASTRUKTUR DIGITAL',
      wiDnUgas: '201E-03-02D',
      subcontractor: 'PT. INFRASTRUKTUR DIGITAL',
      siteOwner: 'Doni Prasetyo',
      installationPd: '2024-03-15',
      wiWeeklyPlan: 'Done',
      mosCnInstallationCompleted: 'In Progress',
      planEndDate: '2024-07-15',
      actualEndDate: '',
      owner: 'PT. Enterprise',
      action: '',
      milestone1: 'Done',
      milestone2: 'In Progress',
      milestone3: 'Pending',
    },
  ];

  // Get data based on selected project
  const getProjectData = () => {
    switch (selectedProject()) {
      case 'project1':
        return sampleDataProject1;
      case 'project2':
        return sampleDataProject2;
      case 'project3':
        return sampleDataProject3;
      default:
        return sampleDataProject1;
    }
  };

  // Column definitions
  const [columnDefs] = createSignal<ColDef[]>([
    { 
      field: 'unixId', 
      headerName: 'Unix ID', 
      pinned: 'left',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 150,
      filter: 'agTextColumnFilter',
    },
    { field: 'customerId', headerName: 'Customer ID', width: 130 },
    { field: 'siteId', headerName: 'Site ID', width: 150 },
    { field: 'siteName', headerName: 'Site Name', width: 150 },
    { field: 'deliveryRegion', headerName: 'Delivery Region', width: 150 },
    { field: 'areaName', headerName: 'Area Name', width: 120 },
    { field: 'installation', headerName: 'Installation', width: 200 },
    { field: 'wiDnUgas', headerName: 'WI DN Ugas', width: 130 },
    { field: 'subcontractor', headerName: 'Subcontractor', width: 200 },
    { field: 'siteOwner', headerName: 'Site Owner', width: 150 },
    { field: 'installationPd', headerName: 'Installation PD', width: 130 },
    { field: 'wiWeeklyPlan', headerName: 'WI Weekly Plan', width: 130 },
    { field: 'mosCnInstallationCompleted', headerName: 'MOS CN Installation', width: 180 },
    { field: 'planEndDate', headerName: 'Plan End Date', width: 130 },
    { field: 'actualEndDate', headerName: 'Actual End Date', width: 130 },
    { field: 'owner', headerName: 'Owner', width: 120 },
    { field: 'milestone1', headerName: 'Milestone 1', width: 120 },
    { field: 'milestone2', headerName: 'Milestone 2', width: 120 },
    { field: 'milestone3', headerName: 'Milestone 3', width: 120 },
    { 
      field: 'action', 
      headerName: 'Action', 
      pinned: 'right',
      width: 120,
      sortable: false,
      filter: false,
      editable: false,
      cellRenderer: (params: any) => {
        const container = document.createElement('div');
        container.style.cssText = 'display: flex; gap: 4px; align-items: center; height: 100%; justify-content: center;';
        
        const button = document.createElement('button');
        button.className = 'action-btn-edit';
        button.innerHTML = '✏️ Edit';
        button.onclick = () => {
          console.log('Edit clicked for:', params.data);
          alert(`Editing row: ${params.data.unixId}\nSite: ${params.data.siteName}`);
        };
        
        container.appendChild(button);
        return container;
      }
    },
  ]);

  const gridOptions: GridOptions = {
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      editable: true,
      floatingFilter: true,
      enableRowGroup: true,
      enablePivot: true,
      enableValue: true,
      minWidth: 100,
    },
    rowSelection: 'multiple',
    pagination: true,
    paginationPageSize: 15,
    paginationPageSizeSelector: [15, 50, 100, 500],
    enableCellTextSelection: true,
    suppressRowClickSelection: true,
    enableRangeSelection: true,
    enableCharts: true,
    enableAdvancedFilter: true,
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
    animateRows: true,
    enableFillHandle: true,
    undoRedoCellEditing: true,
    undoRedoCellEditingLimit: 20,
    rowHeight: 50,
    headerHeight: 56,
  };

  // Enhanced context menu configuration
  const getContextMenuItems = (params: any) => {
    const result = [
      {
        name: 'Edit Row',
        icon: '<span class="ag-icon ag-icon-edit"></span>',
        action: () => {
          console.log('Edit row:', params.node.data);
          alert(`Editing row: ${params.node.data.unixId}`);
        },
      },
      'separator',
      'copy',
      'copyWithHeaders',
      'copyWithGroupHeaders',
      'paste',
      'separator',
      {
        name: 'Export',
        icon: '<span class="ag-icon ag-icon-save"></span>',
        subMenu: [
          'csvExport',
          'excelExport',
        ],
      },
      'separator',
      {
        name: 'Chart',
        icon: '<span class="ag-icon ag-icon-chart"></span>',
        subMenu: [
          'chartRange',
        ],
      },
      'separator',
      {
        name: 'Delete Row',
        icon: '<span class="ag-icon ag-icon-cross"></span>',
        cssClasses: ['red-item'],
        action: () => {
          if (confirm('Delete this row?')) {
            const api = gridApi();
            if (api) {
              api.applyTransaction({ remove: [params.node.data] });
              setRowData(rowData().filter(row => row.unixId !== params.node.data.unixId));
            }
          }
        },
      },
    ];
    return result;
  };

  // Sample users data - expanded for better demo
  const sampleUsers: RMJUser[] = [
    {
      id: '1',
      username: 'A Gita Purnasari',
      email: 'gita.purnasari@telkom.co.id',
      role: 'Admin',
      accessLevel: 'full',
      unit: 'PT. NEXWAVE',
      division: 'Technology',
      regional: 'Jakarta',
      createdDate: '2024-01-01',
      lastLogin: '2024-12-02',
    },
    {
      id: '2',
      username: 'A Ismail Syahrana',
      email: 'ismail.syahrana@telkom.co.id',
      role: 'Internal TI',
      accessLevel: 'modify',
      unit: 'PT. NEXWAVE',
      division: 'Technology',
      regional: 'Jakarta',
      createdDate: '2024-01-15',
      lastLogin: '2024-12-01',
    },
    {
      id: '3',
      username: 'A Rofik',
      email: 'rofik@partner.com',
      role: 'Mitra',
      accessLevel: 'view',
      unit: 'PT. INTSEL PRODIAKTIKOM',
      division: 'Installation',
      regional: 'West Java',
      createdDate: '2024-02-01',
      lastLogin: '2024-11-30',
    },
    {
      id: '4',
      username: 'A. Dinal Mubaroq',
      email: 'dinal.mubaroq@partner.com',
      role: 'Mitra',
      accessLevel: 'view',
      unit: 'PT. Digital Solusindo Raya',
      division: 'Installation',
      regional: 'Central Java',
      createdDate: '2024-02-10',
      lastLogin: '2024-11-28',
    },
    {
      id: '5',
      username: 'A. Priyawan Listanto',
      email: 'priyawan.listanto@partner.com',
      role: 'Mitra',
      accessLevel: 'view',
      unit: 'PT. GRAHA SEJAHTERA INF',
      division: 'Installation',
      regional: 'East Java',
      createdDate: '2024-02-15',
      lastLogin: '2024-11-27',
    },
    {
      id: '6',
      username: 'A. Ridwan',
      email: 'ridwan@partner.com',
      role: 'Mitra',
      accessLevel: 'view',
      unit: 'PT. SWATAMA MEGANTARA',
      division: 'Installation',
      regional: 'West Java',
      createdDate: '2024-02-20',
      lastLogin: '2024-11-26',
    },
    {
      id: '7',
      username: 'Fery Hardianto',
      email: 'fery.hardianto@telkom.co.id',
      role: 'Internal TI',
      accessLevel: 'modify',
      unit: 'PT. ADIWARNA TELECOM',
      division: 'Technology',
      regional: 'Jakarta',
      createdDate: '2024-03-01',
      lastLogin: '2024-12-01',
    },
    {
      id: '8',
      username: 'Jajat D Purnomo',
      email: 'jajat.purnomo@partner.com',
      role: 'Mitra',
      accessLevel: 'view',
      unit: 'PT. ADIWARNA TELECOM',
      division: 'Installation',
      regional: 'West Java',
      createdDate: '2024-03-05',
      lastLogin: '2024-11-25',
    },
    {
      id: '9',
      username: 'M. Ilham S',
      email: 'm.ilham@partner.com',
      role: 'Mitra',
      accessLevel: 'view',
      unit: 'PT. ADIWARNA TELECOM',
      division: 'Installation',
      regional: 'West Java',
      createdDate: '2024-03-10',
      lastLogin: '2024-11-24',
    },
  ];

  // Sample templates
  const sampleTemplates: RMJViewTemplate[] = [
    {
      id: '1',
      name: 'Admin Full View',
      description: 'Complete view with all columns for administrators',
      lockedColumns: ['unixId', 'siteId', 'siteName'],
      visibleColumns: ['unixId', 'customerId', 'siteId', 'siteName', 'deliveryRegion', 'areaName', 'installation', 'wiDnUgas', 'subcontractor', 'siteOwner', 'installationPd', 'wiWeeklyPlan', 'mosCnInstallationCompleted', 'planEndDate', 'actualEndDate', 'owner', 'milestone1', 'milestone2', 'milestone3', 'action'],
      createdBy: 'admin@telkom.co.id',
      createdDate: '2024-01-01',
      isPublic: true,
      userRole: 'Admin',
    },
    {
      id: '2',
      name: 'Mitra Basic View',
      description: 'Limited view for partner users',
      lockedColumns: ['unixId', 'siteId'],
      visibleColumns: ['unixId', 'siteId', 'siteName', 'deliveryRegion', 'areaName', 'subcontractor', 'siteOwner', 'installationPd', 'milestone1', 'milestone2', 'milestone3'],
      createdBy: 'admin@telkom.co.id',
      createdDate: '2024-01-01',
      isPublic: true,
      userRole: 'Mitra',
    },
  ];

  // Initialize data immediately when component is created
  const [users, setUsers] = createSignal<RMJUser[]>(sampleUsers);
  const [templates, setTemplates] = createSignal<RMJViewTemplate[]>(sampleTemplates);
  const [rowData, setRowData] = createSignal<RMJSitelistRow[]>(getProjectData());

  onMount(() => {
    console.log('RMJModal mounted');
    console.log('Initial row data:', rowData().length, 'rows');
  });

  // Watch for isOpen changes
  createEffect(() => {
    if (props.isOpen) {
      console.log('Modal opened, grid ready:', isGridReady());
      
      // Force grid refresh when modal opens and grid is ready
      if (isGridReady()) {
        setTimeout(() => {
          const api = gridApi();
          if (api) {
            console.log('Refreshing grid with', rowData().length, 'rows');
            api.setGridOption('rowData', rowData());
            api.refreshCells();
          }
        }, 100);
      }
    }
  });

  // Watch for tab changes and refresh grid
  createEffect(() => {
    const tab = activeTab();
    console.log('Active tab changed to:', tab);
    
    if (tab === 'sitelist' && isGridReady()) {
      // Refresh grid when switching back to sitelist tab
      setTimeout(() => {
        const api = gridApi();
        if (api) {
          console.log('Refreshing grid after tab change...');
          api.setGridOption('rowData', rowData());
          api.refreshCells();
        }
      }, 50);
    }
  });

  // Watch for project changes and update grid data
  createEffect(() => {
    const project = selectedProject();
    console.log('Selected project changed to:', project);
    
    const newData = getProjectData();
    setRowData(newData);
    
    if (isGridReady()) {
      setTimeout(() => {
        const api = gridApi();
        if (api) {
          console.log('Updating grid with new project data...');
          api.setGridOption('rowData', newData);
          api.refreshCells();
        }
      }, 50);
    }
  });

  // Grid event handlers
  const onGridReady = (params: any) => {
    console.log('=== Grid Ready Event ===');
    console.log('Row data count:', rowData().length);
    console.log('Sample data:', rowData());
    
    setGridApi(params.api);
    setIsGridReady(true);
    
    // Set data immediately
    params.api.setGridOption('rowData', rowData());
    
    console.log('Grid initialized successfully');
  };

  // Export to Excel
  const handleExport = () => {
    const api = gridApi();
    if (!api) return;

    const allData = rowData();
    const ws = XLSX.utils.json_to_sheet(allData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sitelist');
    XLSX.writeFile(wb, `RMJ_Sitelist_${new Date().toISOString().split('T')[0]}.xlsx`);
    console.log('Data exported to Excel');
  };

  // Import from Excel
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event: any) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet) as RMJSitelistRow[];
        
        setRowData([...rowData(), ...jsonData]);
        console.log('Imported', jsonData.length, 'rows');
        alert(`Successfully imported ${jsonData.length} rows`);
      };
      reader.readAsArrayBuffer(file);
    };
    input.click();
  };

  // Batch update selected rows
  const handleBatchUpdate = () => {
    const api = gridApi();
    if (!api) return;

    const selectedRows = api.getSelectedRows();
    if (selectedRows.length === 0) {
      alert('Please select rows to update');
      return;
    }

    const field = prompt('Enter field name to update (e.g., milestone1):');
    if (!field) return;

    const value = prompt(`Enter new value for ${field}:`);
    if (value === null) return;

    selectedRows.forEach((row: RMJSitelistRow) => {
      row[field] = value;
    });

    api.applyTransaction({ update: selectedRows });
    console.log('Batch updated', selectedRows.length, 'rows');
    alert(`Updated ${selectedRows.length} rows`);
  };

  // Generate import template
  const handleGenerateTemplate = () => {
    const templateData = [{
      unixId: 'U-01XXXXX-XXX',
      customerId: 'Customer Name',
      siteId: 'SITE_ID',
      siteName: 'Site Name',
      deliveryRegion: 'Region',
      areaName: 'Area',
      installation: 'Installation Company',
      wiDnUgas: 'WI Number',
      subcontractor: 'Subcontractor Name',
      siteOwner: 'Owner Name',
      installationPd: '2024-01-01',
      wiWeeklyPlan: 'Done/Pending',
      mosCnInstallationCompleted: 'Done/Pending',
      planEndDate: '2024-12-31',
      actualEndDate: '2024-12-31',
      owner: 'Owner',
      milestone1: 'Done/In Progress/Pending',
      milestone2: 'Done/In Progress/Pending',
      milestone3: 'Done/In Progress/Pending',
    }];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'RMJ_Import_Template.xlsx');
    console.log('Template generated');
  };

  // Search functionality
  const handleSearch = () => {
    const api = gridApi();
    if (!api) return;
    api.setGridOption('quickFilterText', searchQuery());
  };

  // Save current view as template
  const handleSaveTemplate = () => {
    const api = gridApi();
    if (!api) return;

    const name = templateName();
    if (!name) {
      alert('Please enter template name');
      return;
    }

    const allColumns = api.getColumns();
    const visibleColumns = allColumns?.filter((col: any) => col.isVisible()).map((col: any) => col.getColId()) || [];
    
    const newTemplate: RMJViewTemplate = {
      id: Date.now().toString(),
      name,
      description: templateDescription(),
      lockedColumns: ['unixId'],
      visibleColumns,
      createdBy: props.userEmail || 'unknown',
      createdDate: new Date().toISOString(),
      isPublic: false,
      userRole: props.userRole,
    };

    setTemplates([...templates(), newTemplate]);
    setShowTemplateForm(false);
    setTemplateName('');
    setTemplateDescription('');
    alert('Template saved successfully!');
  };

  // Apply template
  const handleApplyTemplate = (templateId: string) => {
    const template = templates().find(t => t.id === templateId);
    const api = gridApi();
    if (!template || !api) return;

    const allColumns = api.getColumns();
    
    // Hide all columns first, then show only the ones in template
    const columnsToHide = allColumns?.filter((col: any) => !template.visibleColumns.includes(col.getColId())).map((col: any) => col.getColId()) || [];
    const columnsToShow = allColumns?.filter((col: any) => template.visibleColumns.includes(col.getColId())).map((col: any) => col.getColId()) || [];
    
    api.setColumnsVisible(columnsToHide, false);
    api.setColumnsVisible(columnsToShow, true);

    alert(`Template "${template.name}" applied successfully!`);
  };

  // User column definitions for All Data table
  const [userColumnDefs] = createSignal<ColDef[]>([
    { 
      field: 'username', 
      headerName: 'Name',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 200,
      filter: 'agTextColumnFilter',
      pinned: 'left',
    },
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80,
      filter: 'agTextColumnFilter',
    },
    { 
      field: 'unit', 
      headerName: 'Subcontractor', 
      width: 220,
      filter: 'agTextColumnFilter',
    },
    { 
      field: 'email', 
      headerName: 'Subcontractor Name', 
      width: 240,
      filter: 'agTextColumnFilter',
    },
    { 
      field: 'action', 
      headerName: 'Action', 
      width: 100,
      pinned: 'right',
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const button = document.createElement('button');
        button.className = 'add-to-select-btn';
        button.setAttribute('data-user-id', params.data.id);
        button.innerHTML = `
          <svg style="width: 12px; height: 12px;" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          <span>Add</span>
        `;
        button.style.cssText = `
          padding: 4px 12px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
          display: flex;
          align-items: center;
          gap: 4px;
        `;
        
        button.addEventListener('mouseenter', () => {
          button.style.transform = 'translateY(-1px)';
          button.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)';
        });
        
        button.addEventListener('mouseleave', () => {
          button.style.transform = 'translateY(0)';
          button.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)';
        });
        
        button.addEventListener('click', () => {
          const userId = params.data.id;
          const user = users().find(u => u.id === userId);
          if (user && !selectedUsers().find(u => u.id === userId)) {
            setSelectedUsers([...selectedUsers(), user]);
          }
        });
        
        return button;
      }
    },
  ]);

  // User column definitions for Selected Data table
  const [selectedUserColumnDefs] = createSignal<ColDef[]>([
    { 
      field: 'username', 
      headerName: 'Name', 
      width: 200,
      filter: 'agTextColumnFilter',
      pinned: 'left',
    },
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80,
      filter: 'agTextColumnFilter',
    },
    { 
      field: 'unit', 
      headerName: 'Subcontractor', 
      width: 220,
      filter: 'agTextColumnFilter',
    },
    { 
      field: 'email', 
      headerName: 'Subcontractor Name', 
      width: 240,
      filter: 'agTextColumnFilter',
    },
    { 
      field: 'action', 
      headerName: 'Action', 
      width: 120,
      pinned: 'right',
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const button = document.createElement('button');
        button.className = 'remove-from-select-btn';
        button.setAttribute('data-user-id', params.data.id);
        button.innerHTML = `
          <svg style="width: 12px; height: 12px;" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
          <span>Remove</span>
        `;
        button.style.cssText = `
          padding: 4px 12px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
          display: flex;
          align-items: center;
          gap: 4px;
        `;
        
        button.addEventListener('mouseenter', () => {
          button.style.transform = 'translateY(-1px)';
          button.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.4)';
        });
        
        button.addEventListener('mouseleave', () => {
          button.style.transform = 'translateY(0)';
          button.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.3)';
        });
        
        button.addEventListener('click', () => {
          const userId = params.data.id;
          setSelectedUsers(selectedUsers().filter(u => u.id !== userId));
        });
        
        return button;
      }
    },
  ]);

  const userGridOptions: GridOptions = {
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: false,
    },
    rowSelection: 'multiple',
    pagination: true,
    paginationPageSize: 15,
    paginationPageSizeSelector: [15, 50, 100],
    enableCellTextSelection: true,
    suppressRowClickSelection: true,
  };

  // Separate grid APIs
  const [selectedUserGridApi, setSelectedUserGridApi] = createSignal<GridApi | null>(null);

  // User grid event handlers
  const onUserGridReady = (params: any) => {
    console.log('User Grid Ready');
    setUserGridApi(params.api);
    params.api.setGridOption('rowData', users());
  };

  const onSelectedUserGridReady = (params: any) => {
    console.log('Selected User Grid Ready');
    setSelectedUserGridApi(params.api);
    params.api.setGridOption('rowData', selectedUsers());
  };

  // Watch for selected users changes and update grid
  createEffect(() => {
    const selected = selectedUsers();
    const api = selectedUserGridApi();
    if (api) {
      api.setGridOption('rowData', selected);
    }
  });

  // Apply filters
  const applyUserFilters = () => {
    const api = userGridApi();
    if (!api) return;

    api.setFilterModel({
      username: userNameFilter() ? {
        filterType: 'text',
        type: 'contains',
        filter: userNameFilter()
      } : null,
      role: userRoleFilter() ? {
        filterType: 'set',
        values: [userRoleFilter()]
      } : null,
      unit: userUnitFilter() ? {
        filterType: 'text',
        type: 'contains',
        filter: userUnitFilter()
      } : null,
    });
  };

  // Reset filters
  const resetUserFilters = () => {
    setUserNameFilter('');
    setUserRoleFilter('');
    setUserUnitFilter('');
    const api = userGridApi();
    if (api) {
      api.setFilterModel(null);
    }
  };



  // User Management Functions
  const handleAddUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user: RMJUser) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users().filter(u => u.id !== userId));
      alert('User deleted successfully!');
    }
  };

  const handleSaveUser = (userData: Partial<RMJUser>) => {
    if (editingUser()) {
      // Update existing user
      setUsers(users().map(u => u.id === editingUser()!.id ? { ...u, ...userData } : u));
      alert('User updated successfully!');
    } else {
      // Add new user
      const newUser: RMJUser = {
        id: Date.now().toString(),
        username: userData.username || '',
        email: userData.email || '',
        role: userData.role || 'Mitra',
        accessLevel: userData.accessLevel || 'view',
        unit: userData.unit,
        division: userData.division,
        regional: userData.regional,
        createdDate: new Date().toISOString(),
      };
      setUsers([...users(), newUser]);
      alert('User created successfully!');
    }
    setShowUserForm(false);
    setEditingUser(null);
  };



  return (
    <Show when={props.isOpen}>
    <div 
      class="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4"
      onClick={props.onClose}
    >
      <div 
        class="bg-white rounded-2xl shadow-2xl w-[95vw] h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{"font-family": "'Poppins', sans-serif"}}
      >
        {/* Header */}
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 class="text-2xl font-bold text-gray-800 m-0">RMJ Tools - Project Delivery Management</h2>
            <p class="text-sm text-gray-500 m-0 mt-1">Integrated Work Management System</p>
          </div>
          <button
            class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            onClick={props.onClose}
          >
            <span class="text-xl text-gray-600">×</span>
          </button>
        </div>

        {/* Tabs */}
        <div class="flex gap-2 px-6 py-3 border-b border-gray-200 bg-gray-50">
          <button
            class={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab() === 'sitelist'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('sitelist')}
          >
            📊 Sitelist Project
          </button>
          <button
            class={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab() === 'settings'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Template Settings
          </button>
          <button
            class={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab() === 'users'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('users')}
          >
            👥 User Management
          </button>
        </div>

        {/* Content */}
        <div class="flex-1 overflow-hidden">
          <Show when={activeTab() === 'sitelist'}>
            <div class="h-full flex flex-col">
              {/* Project Selector */}
              <div class="px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div class="flex items-center gap-4">
                  <label class="text-sm font-semibold text-gray-700">Project:</label>
                  <select
                    value={selectedProject()}
                    onChange={(e) => setSelectedProject(e.currentTarget.value)}
                    class="flex-1 max-w-md px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white font-medium text-gray-800 shadow-sm hover:border-blue-400 transition-colors"
                  >
                    <For each={projects}>
                      {(project) => (
                        <option value={project.id}>
                          {project.year} - {project.program} - {project.description}
                        </option>
                      )}
                    </For>
                  </select>
                  <div class="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <span class="text-xs font-medium text-gray-500">Total Sites:</span>
                    <span class="text-sm font-bold text-blue-600">{rowData().length}</span>
                  </div>
                </div>
              </div>

              {/* Toolbar */}
              <div class="px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <div class="flex items-center gap-3 flex-wrap">
                  {/* Search */}
                  <div class="flex-1 min-w-[200px] relative">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search Unix ID, Site Name, Region..."
                      value={searchQuery()}
                      onInput={(e) => {
                        setSearchQuery(e.currentTarget.value);
                        handleSearch();
                      }}
                      class="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm shadow-sm hover:border-gray-400 transition-colors text-gray-900 placeholder-gray-400"
                      style="color: #111827;"
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div class="flex items-center gap-2">
                    <button
                      class="group relative p-2 rounded-lg bg-white border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm"
                      onClick={handleImport}
                      title="Import"
                    >
                      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span class="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        Import Excel/CSV
                      </span>
                    </button>

                    <button
                      class="group relative p-2 rounded-lg bg-white border-2 border-green-200 hover:bg-green-50 hover:border-green-400 transition-all shadow-sm"
                      onClick={handleExport}
                      title="Export"
                    >
                      <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      <span class="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        Export to Excel
                      </span>
                    </button>

                    <button
                      class="group relative p-2 rounded-lg bg-white border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-400 transition-all shadow-sm"
                      onClick={handleGenerateTemplate}
                      title="Template"
                    >
                      <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span class="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        Download Template
                      </span>
                    </button>

                    <button
                      class="group relative p-2 rounded-lg bg-white border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-400 transition-all shadow-sm"
                      onClick={handleBatchUpdate}
                      title="Batch Update"
                    >
                      <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span class="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        Batch Update
                      </span>
                    </button>

                    <div class="w-px h-6 bg-gray-300"></div>

                    <button
                      class="group relative p-2 rounded-lg bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                      onClick={() => {
                        const api = gridApi();
                        if (api) {
                          api.openToolPanel('filters');
                        }
                      }}
                      title="Filter"
                    >
                      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      <span class="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        Open Filters
                      </span>
                    </button>

                    <button
                      class="group relative p-2 rounded-lg bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                      onClick={() => {
                        const api = gridApi();
                        if (api) {
                          api.openToolPanel('columns');
                        }
                      }}
                      title="Columns"
                    >
                      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                      <span class="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        Manage Columns
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* AG Grid */}
              <div class="flex-1 px-6 py-4">
                <div class="ag-theme-alpine h-full w-full" style="--ag-header-background-color: linear-gradient(135deg, #667eea 0%, #764ba2 100%); --ag-header-foreground-color: white; --ag-odd-row-background-color: #f8fafc; --ag-row-hover-color: #e0e7ff;">
                  <AgGridSolid
                    columnDefs={columnDefs()}
                    rowData={rowData()}
                    defaultColDef={gridOptions.defaultColDef}
                    rowSelection={gridOptions.rowSelection}
                    pagination={gridOptions.pagination}
                    paginationPageSize={gridOptions.paginationPageSize}
                    paginationPageSizeSelector={gridOptions.paginationPageSizeSelector}
                    enableCellTextSelection={gridOptions.enableCellTextSelection}
                    suppressRowClickSelection={gridOptions.suppressRowClickSelection}
                    onGridReady={onGridReady}
                    enableRangeSelection={gridOptions.enableRangeSelection}
                    enableCharts={gridOptions.enableCharts}
                    enableAdvancedFilter={gridOptions.enableAdvancedFilter}
                    rowGroupPanelShow={gridOptions.rowGroupPanelShow}
                    pivotPanelShow={gridOptions.pivotPanelShow}
                    animateRows={gridOptions.animateRows}
                    enableFillHandle={gridOptions.enableFillHandle}
                    undoRedoCellEditing={gridOptions.undoRedoCellEditing}
                    undoRedoCellEditingLimit={gridOptions.undoRedoCellEditingLimit}
                    allowContextMenuWithControlKey={true}
                    getContextMenuItems={getContextMenuItems}
                    sideBar={{
                      toolPanels: [
                        {
                          id: 'columns',
                          labelDefault: 'Columns',
                          labelKey: 'columns',
                          iconKey: 'columns',
                          toolPanel: 'agColumnsToolPanel',
                          toolPanelParams: {
                            suppressRowGroups: false,
                            suppressValues: false,
                            suppressPivots: false,
                            suppressPivotMode: false,
                            suppressColumnFilter: false,
                            suppressColumnSelectAll: false,
                            suppressColumnExpandAll: false,
                          },
                        },
                        {
                          id: 'filters',
                          labelDefault: 'Filters',
                          labelKey: 'filters',
                          iconKey: 'filter',
                          toolPanel: 'agFiltersToolPanel',
                        },
                      ],
                      defaultToolPanel: '',
                      position: 'right',
                    }}
                    statusBar={{
                      statusPanels: [
                        { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
                        { statusPanel: 'agTotalRowCountComponent', align: 'center' },
                        { statusPanel: 'agFilteredRowCountComponent', align: 'center' },
                        { statusPanel: 'agSelectedRowCountComponent', align: 'center' },
                        { statusPanel: 'agAggregationComponent', align: 'right' },
                      ],
                    }}
                  />
                </div>
              </div>
            </div>
          </Show>

          <Show when={activeTab() === 'settings'}>
            <div class="h-full flex flex-col">
              {/* Header */}
              <div class="px-6 py-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-xl font-bold text-gray-800">View Template Settings</h3>
                    <p class="text-sm text-gray-600 mt-1">Save and manage custom column views for different use cases</p>
                  </div>
                  <button
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    onClick={() => setShowTemplateForm(true)}
                  >
                    + Create Template
                  </button>
                </div>
              </div>

              {/* Template List */}
              <div class="flex-1 overflow-auto p-6">
                <div class="space-y-4">
                  <For each={templates()}>
                    {(template) => (
                      <div class="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-all bg-white shadow-sm">
                        {/* Template Header */}
                        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                          <div class="flex items-start justify-between mb-3">
                            <div class="flex-1">
                              <div class="flex items-center gap-3">
                                <h4 class="text-lg font-bold text-gray-800">{template.name}</h4>
                                <Show when={template.isPublic}>
                                  <span class="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-semibold shadow-sm">
                                    🌐 Public
                                  </span>
                                </Show>
                              </div>
                              <p class="text-sm text-gray-600 mt-1">{template.description}</p>
                            </div>
                          </div>
                          
                          <div class="flex items-center gap-6 mb-3">
                            <div class="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm">
                              <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                              </svg>
                              <span class="text-xs font-semibold text-gray-700">{template.visibleColumns.length} Columns</span>
                            </div>
                            <div class="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm">
                              <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span class="text-xs font-semibold text-gray-700">{template.userRole || 'All Roles'}</span>
                            </div>
                            <div class="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm">
                              <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span class="text-xs font-semibold text-gray-700">{new Date(template.createdDate).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div class="flex gap-2">
                            <button
                              class="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                              onClick={() => handleApplyTemplate(template.id)}
                            >
                              ✓ Apply Template
                            </button>
                            <button
                              class="px-4 py-2 bg-white border-2 border-blue-300 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-all"
                              onClick={() => setExpandedTemplate(expandedTemplate() === template.id ? null : template.id)}
                            >
                              {expandedTemplate() === template.id ? '▲ Hide Columns' : '▼ View Columns'}
                            </button>
                            <button
                              class="px-4 py-2 bg-white border-2 border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-all"
                              onClick={() => {
                                if (confirm('Delete this template?')) {
                                  setTemplates(templates().filter(t => t.id !== template.id));
                                }
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>

                        {/* Expandable Column Table */}
                        <Show when={expandedTemplate() === template.id}>
                          <div class="p-4 bg-gray-50 border-t-2 border-gray-200">
                            <div class="mb-3 flex items-center justify-between">
                              <h5 class="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Column Configuration
                              </h5>
                              <div class="flex items-center gap-2">
                                <span class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                  {template.lockedColumns.length} Locked
                                </span>
                                <span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                  {template.visibleColumns.length} Visible
                                </span>
                              </div>
                            </div>
                            
                            <div class="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm">
                              <div class="overflow-x-auto max-h-96">
                                <table class="w-full">
                                  <thead class="bg-gradient-to-r from-gray-700 to-gray-800 text-white sticky top-0">
                                    <tr>
                                      <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                                        #
                                      </th>
                                      <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                                        Column Name
                                      </th>
                                      <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                                        Field ID
                                      </th>
                                      <th class="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">
                                        Status
                                      </th>
                                      <th class="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">
                                        Lock Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody class="divide-y divide-gray-200">
                                    <For each={template.visibleColumns}>
                                      {(colId, index) => {
                                        const colDef = columnDefs().find(c => c.field === colId);
                                        const isLocked = template.lockedColumns.includes(colId);
                                        return (
                                          <tr class="hover:bg-blue-50 transition-colors">
                                            <td class="px-4 py-3 text-sm font-bold text-gray-500">
                                              {index() + 1}
                                            </td>
                                            <td class="px-4 py-3 text-sm font-semibold text-gray-800">
                                              {colDef?.headerName || colId}
                                            </td>
                                            <td class="px-4 py-3 text-sm text-gray-600 font-mono bg-gray-50">
                                              {colId}
                                            </td>
                                            <td class="px-4 py-3 text-center">
                                              <span class="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                                </svg>
                                                Visible
                                              </span>
                                            </td>
                                            <td class="px-4 py-3 text-center">
                                              <Show when={isLocked} fallback={
                                                <span class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                                                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                                                  </svg>
                                                  Unlocked
                                                </span>
                                              }>
                                                <span class="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                                                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                                                  </svg>
                                                  Locked
                                                </span>
                                              </Show>
                                            </td>
                                          </tr>
                                        );
                                      }}
                                    </For>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Summary Stats */}
                            <div class="mt-4 grid grid-cols-3 gap-3">
                              <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white shadow-md">
                                <div class="text-xs font-semibold opacity-90">Total Columns</div>
                                <div class="text-2xl font-bold mt-1">{template.visibleColumns.length}</div>
                              </div>
                              <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white shadow-md">
                                <div class="text-xs font-semibold opacity-90">Locked Columns</div>
                                <div class="text-2xl font-bold mt-1">{template.lockedColumns.length}</div>
                              </div>
                              <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white shadow-md">
                                <div class="text-xs font-semibold opacity-90">Editable Columns</div>
                                <div class="text-2xl font-bold mt-1">{template.visibleColumns.length - template.lockedColumns.length}</div>
                              </div>
                            </div>
                          </div>
                        </Show>
                      </div>
                    )}
                  </For>
                </div>
              </div>

              {/* Create Template Form Modal */}
              <Show when={showTemplateForm()}>
                <div class="fixed inset-0 bg-black/50 z-[2100] flex items-center justify-center p-4">
                  <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Create New Template</h3>
                    
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                        <input
                          type="text"
                          value={templateName()}
                          onInput={(e) => setTemplateName(e.currentTarget.value)}
                          placeholder="e.g., My Custom View"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={templateDescription()}
                          onInput={(e) => setTemplateDescription(e.currentTarget.value)}
                          placeholder="Describe this template..."
                          rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p class="text-xs text-blue-800">
                          💡 The current visible columns in the grid will be saved to this template.
                        </p>
                      </div>
                    </div>

                    <div class="flex gap-3 mt-6">
                      <button
                        class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        onClick={handleSaveTemplate}
                      >
                        Save Template
                      </button>
                      <button
                        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          setShowTemplateForm(false);
                          setTemplateName('');
                          setTemplateDescription('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </Show>
            </div>
          </Show>

          <Show when={activeTab() === 'users'}>
            <div class="h-full flex flex-col bg-gray-50">
              {/* Header */}
              <div class="px-6 py-4 bg-white border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-xl font-bold text-gray-800">Personal and Group</h3>
                    <p class="text-sm text-gray-600 mt-1">Manage users, roles, and access levels</p>
                  </div>
                  <Show when={props.userRole === 'Admin'}>
                    <button
                      class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                      onClick={handleAddUser}
                    >
                      + Add User
                    </button>
                  </Show>
                </div>
              </div>

              {/* Tab Navigation */}
              <div class="px-6 py-3 bg-white border-b border-gray-200">
                <div class="flex items-center gap-1">
                  <button
                    class={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                      userDataTab() === 'all'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => setUserDataTab('all')}
                  >
                    Personal and Group
                  </button>
                </div>
              </div>

              {/* Filter Section */}
              <div class="px-6 py-4 bg-white border-b border-gray-200">
                <div class="flex items-center gap-3 flex-wrap">
                  <input
                    type="text"
                    placeholder="Name/Employee No."
                    value={userNameFilter()}
                    onInput={(e) => setUserNameFilter(e.currentTarget.value)}
                    class="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 w-48"
                  />
                  
                  <select
                    value={userRoleFilter()}
                    onChange={(e) => setUserRoleFilter(e.currentTarget.value)}
                    class="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 w-40"
                  >
                    <option value="">Resource Type</option>
                    <option value="Admin">Admin</option>
                    <option value="Internal TI">Internal TI</option>
                    <option value="Mitra">Mitra</option>
                  </select>

                  <select
                    class="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 w-40"
                  >
                    <option value="">Resource</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Subcontractor"
                    value={userUnitFilter()}
                    onInput={(e) => setUserUnitFilter(e.currentTarget.value)}
                    class="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 w-48"
                  />

                  <input
                    type="text"
                    placeholder="Subcontractor Name"
                    class="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 w-48"
                  />

                  <button
                    class="px-6 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors"
                    onClick={applyUserFilters}
                  >
                    Search
                  </button>

                  <button
                    class="px-6 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300 transition-colors"
                    onClick={resetUserFilters}
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Two Tables Side by Side */}
              <div class="flex-1 px-6 py-4 overflow-hidden">
                <div class="h-full flex gap-4">
                  {/* All Data Table */}
                  <div class="flex-1 flex flex-col">
                    <div class="mb-2 flex items-center justify-between">
                      <h4 class="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        All Data
                      </h4>
                      <span class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        Total: {users().length}
                      </span>
                    </div>
                    <div class="flex-1 ag-theme-alpine bg-white rounded-lg shadow-md border-2 border-gray-200">
                      <AgGridSolid
                        columnDefs={userColumnDefs()}
                        rowData={users()}
                        defaultColDef={userGridOptions.defaultColDef}
                        rowSelection={userGridOptions.rowSelection}
                        pagination={userGridOptions.pagination}
                        paginationPageSize={userGridOptions.paginationPageSize}
                        paginationPageSizeSelector={userGridOptions.paginationPageSizeSelector}
                        enableCellTextSelection={userGridOptions.enableCellTextSelection}
                        suppressRowClickSelection={userGridOptions.suppressRowClickSelection}
                        onGridReady={onUserGridReady}
                      />
                    </div>
                  </div>

                  {/* Select Data Table */}
                  <div class="flex-1 flex flex-col">
                    <div class="mb-2 flex items-center justify-between">
                      <h4 class="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Select Data
                      </h4>
                      <span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Selected: {selectedUsers().length}
                      </span>
                    </div>
                    <div class="flex-1 ag-theme-alpine bg-white rounded-lg shadow-md border-2 border-green-200">
                      <AgGridSolid
                        columnDefs={selectedUserColumnDefs()}
                        rowData={selectedUsers()}
                        defaultColDef={userGridOptions.defaultColDef}
                        pagination={userGridOptions.pagination}
                        paginationPageSize={userGridOptions.paginationPageSize}
                        paginationPageSizeSelector={userGridOptions.paginationPageSizeSelector}
                        enableCellTextSelection={userGridOptions.enableCellTextSelection}
                        suppressRowClickSelection={userGridOptions.suppressRowClickSelection}
                        onGridReady={onSelectedUserGridReady}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div class="px-6 py-4 bg-white border-t-2 border-gray-200">
                <div class="flex items-center justify-center gap-3">
                  <button
                    class="px-10 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    onClick={() => {
                      if (selectedUsers().length > 0) {
                        alert(`✓ Confirmed ${selectedUsers().length} selected users`);
                      } else {
                        alert('⚠️ Please select users first');
                      }
                    }}
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    OK
                  </button>
                  <button
                    class="px-10 py-2.5 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded-lg font-semibold hover:from-gray-400 hover:to-gray-500 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    onClick={() => {
                      setSelectedUsers([]);
                    }}
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                    Cancel
                  </button>
                </div>
              </div>

              {/* User Form Modal */}
              <Show when={showUserForm()}>
                <div class="fixed inset-0 bg-black/50 z-[2100] flex items-center justify-center p-4">
                  <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">
                      {editingUser() ? 'Edit User' : 'Add New User'}
                    </h3>
                    
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleSaveUser({
                        username: formData.get('username') as string,
                        email: formData.get('email') as string,
                        role: formData.get('role') as UserRole,
                        accessLevel: formData.get('accessLevel') as AccessLevel,
                        unit: formData.get('unit') as string,
                        division: formData.get('division') as string,
                        regional: formData.get('regional') as string,
                      });
                    }}>
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                          <input
                            type="text"
                            name="username"
                            value={editingUser()?.username || ''}
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={editingUser()?.email || ''}
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                          <select
                            name="role"
                            value={editingUser()?.role || 'Mitra'}
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Internal TI">Internal TI</option>
                            <option value="Mitra">Mitra</option>
                          </select>
                        </div>

                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
                          <select
                            name="accessLevel"
                            value={editingUser()?.accessLevel || 'view'}
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          >
                            <option value="view">View Only</option>
                            <option value="modify">Modify</option>
                            <option value="full">Full Access</option>
                          </select>
                        </div>

                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                          <input
                            type="text"
                            name="unit"
                            value={editingUser()?.unit || ''}
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Division</label>
                          <input
                            type="text"
                            name="division"
                            value={editingUser()?.division || ''}
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div class="col-span-2">
                          <label class="block text-sm font-medium text-gray-700 mb-1">Regional</label>
                          <input
                            type="text"
                            name="regional"
                            value={editingUser()?.regional || ''}
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div class="flex gap-3 mt-6">
                        <button
                          type="submit"
                          class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          {editingUser() ? 'Update User' : 'Create User'}
                        </button>
                        <button
                          type="button"
                          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          onClick={() => {
                            setShowUserForm(false);
                            setEditingUser(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </div>
    </div>
    </Show>
  );
}
