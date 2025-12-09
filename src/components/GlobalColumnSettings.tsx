"use client"

import { createSignal, createEffect, For, Show } from "solid-js"
import type { ColumnState, GridApi } from "ag-grid-community"

// Types
interface ColumnInfo {
    field: string
    headerName: string
    isLocked: boolean
}

interface ColumnTemplate {
    id: string
    name: string
    description: string
    visibleColumns: string[]
    columnState: ColumnState[]
    createdAt: Date
    createdBy: string
    isPublic: boolean
}

interface TableInfo {
    id: string
    name: string
    description: string
    category: string
    columnCount: number
    location: string
}

interface GlobalColumnSettingsProps {
    gridApi: GridApi | null
    userEmail?: string
    onClose: () => void
    tables?: TableInfo[]
    getColumnsForTable?: (tableId: string) => ColumnInfo[]
    getTemplatesForTable?: (tableId: string) => ColumnTemplate[]
    getGridApiForTable?: (tableId: string) => GridApi | null
    // New props for direct integration
    currentTableInfo?: TableInfo
    currentColumns?: ColumnInfo[]
}

// Mock data untuk demo
const MOCK_TABLES: TableInfo[] = [
    {
        id: "rmj_report",
        name: "RMJ Report",
        description: "Progress Revenue OSP DKI Telkominfra",
        category: "Reports",
        columnCount: 28,
        location: "Modal Report",
    },
    {
        id: "sales_data",
        name: "Sales Data",
        description: "Sales transaction records",
        category: "Sales",
        columnCount: 15,
        location: "Main Dashboard",
    },
    {
        id: "inventory",
        name: "Inventory",
        description: "Stock and warehouse management",
        category: "Operations",
        columnCount: 12,
        location: "Inventory Page",
    },
    {
        id: "customer_detail",
        name: "Customer Details",
        description: "Customer information and history",
        category: "CRM",
        columnCount: 20,
        location: "Customer Popup",
    },
    {
        id: "project_tracking",
        name: "Project Tracking",
        description: "Project timeline and milestones",
        category: "Projects",
        columnCount: 18,
        location: "Project Dashboard",
    },
]

const MOCK_COLUMNS: Record<string, ColumnInfo[]> = {
    rmj_report: [
        { field: "no", headerName: "NO", isLocked: true },
        { field: "area", headerName: "AREA", isLocked: true },
        { field: "ktrl", headerName: "KTRL", isLocked: false },
        { field: "mitraPelaksana", headerName: "MITRA PELAKSANA", isLocked: false },
        { field: "linkRuas", headerName: "LINK/RUAS", isLocked: false },
        { field: "volumePhm", headerName: "VOLUME (PHM)", isLocked: false },
        { field: "progresGalianPlan", headerName: "Galian - PLAN", isLocked: false },
        { field: "progresGalianActual", headerName: "Galian - ACTUAL", isLocked: false },
        { field: "penambahanHdpePlan", headerName: "HDPE - PLAN", isLocked: false },
        { field: "penambahanHdpeActual", headerName: "HDPE - ACTUAL", isLocked: false },
    ],
    sales_data: [
        { field: "id", headerName: "ID", isLocked: true },
        { field: "date", headerName: "Date", isLocked: false },
        { field: "customer", headerName: "Customer", isLocked: false },
        { field: "product", headerName: "Product", isLocked: false },
        { field: "amount", headerName: "Amount", isLocked: false },
    ],
    inventory: [
        { field: "id", headerName: "ID", isLocked: true },
        { field: "name", headerName: "Product Name", isLocked: false },
        { field: "stock", headerName: "Stock", isLocked: false },
        { field: "warehouse", headerName: "Warehouse", isLocked: false },
    ],
    customer_detail: [
        { field: "id", headerName: "ID", isLocked: true },
        { field: "name", headerName: "Customer Name", isLocked: false },
        { field: "email", headerName: "Email", isLocked: false },
        { field: "phone", headerName: "Phone", isLocked: false },
    ],
    project_tracking: [
        { field: "id", headerName: "ID", isLocked: true },
        { field: "project", headerName: "Project Name", isLocked: false },
        { field: "status", headerName: "Status", isLocked: false },
        { field: "deadline", headerName: "Deadline", isLocked: false },
    ],
}

export function GlobalColumnSettings(props: GlobalColumnSettingsProps) {
    // Table selection state
    const [selectedTable, setSelectedTable] = createSignal<TableInfo | null>(null)
    const [tableSearchQuery, setTableSearchQuery] = createSignal("")
    const [selectedCategory, setSelectedCategory] = createSignal("All")

    // Column state
    const [selectedColumns, setSelectedColumns] = createSignal<string[]>([])

    // Template state
    const [savedTemplates, setSavedTemplates] = createSignal<ColumnTemplate[]>([])
    const [expandedTemplate, setExpandedTemplate] = createSignal<string | null>(null)

    // Form state
    const [showCreateForm, setShowCreateForm] = createSignal(false)
    const [templateName, setTemplateName] = createSignal("")
    const [templateDescription, setTemplateDescription] = createSignal("")
    const [isPublicTemplate, setIsPublicTemplate] = createSignal(false)

    // Get available tables
    const tables = () => {
        // If currentTableInfo is provided, use it directly
        if (props.currentTableInfo) {
            return [props.currentTableInfo]
        }
        return props.tables || MOCK_TABLES
    }

    // Get categories
    const categories = () => {
        const cats = new Set(tables().map((t) => t.category))
        return ["All", ...Array.from(cats)]
    }

    // Filter tables
    const filteredTables = () => {
        const query = tableSearchQuery().toLowerCase()
        const category = selectedCategory()
        return tables().filter((table) => {
            const matchSearch = table.name.toLowerCase().includes(query) || table.description.toLowerCase().includes(query)
            const matchCategory = category === "All" || table.category === category
            return matchSearch && matchCategory
        })
    }

    // Get columns for selected table (enhanced with GridAPI detection)
    const currentColumns = () => {
        const table = selectedTable()
        if (!table) return []
        
        // Try to get columns from GridAPI first (like ColumnTemplateManager)
        const targetGridApi = props.getGridApiForTable 
            ? props.getGridApiForTable(table.id) 
            : props.gridApi;
        
        if (targetGridApi) {
            const allColumns = targetGridApi.getColumns();
            if (allColumns) {
                // Auto-detect columns from grid
                const columns: ColumnInfo[] = allColumns.map(col => {
                    const colDef = col.getColDef();
                    return {
                        field: colDef.field || col.getColId(),
                        headerName: colDef.headerName || colDef.field || col.getColId(),
                        isLocked: colDef.pinned === 'left' || 
                                 colDef.pinned === 'right' ||
                                 colDef.checkboxSelection === true ||
                                 colDef.field === 'action'
                    };
                });
                return columns;
            }
        }
        
        // Fallback to prop-provided columns
        if (props.currentColumns && props.currentTableInfo?.id === table.id) {
            return props.currentColumns
        }
        
        if (props.getColumnsForTable) return props.getColumnsForTable(table.id)
        return MOCK_COLUMNS[table.id] || []
    }

    // Auto-select table if currentTableInfo is provided
    createEffect(() => {
        if (props.currentTableInfo && !selectedTable()) {
            handleTableSelect(props.currentTableInfo)
        }
    })

    // Load templates from localStorage
    const loadTemplates = (tableId: string) => {
        try {
            const storageKey = `column_templates_${tableId}`
            const stored = localStorage.getItem(storageKey)
            if (stored) {
                const templates = JSON.parse(stored) as ColumnTemplate[]
                setSavedTemplates(templates)
            } else {
                setSavedTemplates([])
            }
        } catch (error) {
            console.error("Error loading templates:", error)
            setSavedTemplates([])
        }
    }

    // Save templates to localStorage
    const saveTemplatesToStorage = (templates: ColumnTemplate[], tableId: string) => {
        try {
            const storageKey = `column_templates_${tableId}`
            localStorage.setItem(storageKey, JSON.stringify(templates))
        } catch (error) {
            console.error("Error saving templates:", error)
        }
    }

    // Initialize columns from GridAPI (like ColumnTemplateManager)
    const initializeColumnsFromGrid = (tableId: string) => {
        // Get the appropriate gridApi for the table
        const targetGridApi = props.getGridApiForTable 
            ? props.getGridApiForTable(tableId) 
            : props.gridApi;
        
        if (!targetGridApi) {
            // Fallback to prop-provided columns if no gridApi
            const columns = props.getColumnsForTable 
                ? props.getColumnsForTable(tableId) 
                : MOCK_COLUMNS[tableId] || []
            setSelectedColumns(columns.map((c) => c.field))
            return
        }

        // Get currently visible columns from the grid
        const allColumns = targetGridApi.getColumns();
        if (!allColumns) {
            const columns = props.getColumnsForTable 
                ? props.getColumnsForTable(tableId) 
                : MOCK_COLUMNS[tableId] || []
            setSelectedColumns(columns.map((c) => c.field))
            return
        }

        // Set selected columns based on current visibility
        const visibleColumns = allColumns
            .filter(col => col.isVisible())
            .map(col => {
                const colDef = col.getColDef();
                return colDef.field || col.getColId();
            })
            .filter(field => field); // Remove empty fields
        
        setSelectedColumns(visibleColumns as string[])
    }

    // Handle table selection
    const handleTableSelect = (table: TableInfo) => {
        setSelectedTable(table)
        initializeColumnsFromGrid(table.id)
        loadTemplates(table.id)
        setShowCreateForm(false)
        setExpandedTemplate(null)
    }

    // Toggle column selection
    const toggleColumn = (field: string) => {
        setSelectedColumns((prev) => {
            if (prev.includes(field)) {
                return prev.filter((f) => f !== field)
            }
            return [...prev, field]
        })
    }

    // Select all columns
    const selectAll = () => {
        const allFields = currentColumns().map((col) => col.field)
        setSelectedColumns(allFields)
    }

    // Deselect all (except locked)
    const deselectAll = () => {
        const lockedFields = currentColumns()
            .filter((col) => col.isLocked)
            .map((col) => col.field)
        setSelectedColumns(lockedFields)
    }

    // Apply to grid (enhanced like ColumnTemplateManager)
    const applyToGrid = () => {
        const table = selectedTable()
        if (!table) {
            alert('⚠️ Please select a table first!');
            return;
        }

        console.log('=== GlobalColumnSettings: Apply to Grid ===');
        console.log('Table ID:', table.id);
        console.log('Table Name:', table.name);

        // Get the appropriate gridApi for the selected table
        const targetGridApi = props.getGridApiForTable 
            ? props.getGridApiForTable(table.id) 
            : props.gridApi;

        console.log('GridAPI Result:', targetGridApi ? 'AVAILABLE' : 'NULL');
        console.log('Selected columns count:', selectedColumns().length);
        console.log('Selected columns:', selectedColumns());

        if (!targetGridApi) {
            console.error('❌ GlobalColumnSettings: GridAPI is NULL for table:', table.id);
            
            // Additional debugging info
            if (props.getGridApiForTable) {
                console.log('Testing all table GridAPIs:');
                const allTables = props.tables || [];
                allTables.forEach(t => {
                    const api = props.getGridApiForTable!(t.id);
                    console.log(`  - ${t.id}: ${api ? 'AVAILABLE' : 'NULL'}`);
                });
            }
            
            alert(`❌ Grid API not available for ${table.name}!\n\nPossible reasons:\n1. Table has not been opened/rendered yet\n2. For BoQ Grid: Click "📋 BoQ" button first to render the grid\n3. For Lokasi Grid: Click "View Detail" then expand "Paket Area"\n\nPlease ensure the table is loaded and try again.`);
            return;
        }

        console.log('✅ GridAPI found, applying column visibility...');

        if (targetGridApi) {
            const selected = selectedColumns()
            
            // Get all columns from the grid
            const allGridColumns = targetGridApi.getColumns();
            console.log('All columns in grid:', allGridColumns?.map(c => c.getColId()));
            
            // Hide/show columns based on selection
            currentColumns().forEach((col) => {
                const column = targetGridApi.getColumn(col.field)
                if (column) {
                    const shouldShow = selected.includes(col.field)
                    console.log(`  Setting column "${col.field}" (${col.headerName}) visibility to:`, shouldShow);
                    targetGridApi.setColumnsVisible([col.field], shouldShow)
                } else {
                    console.warn(`  Column "${col.field}" not found in grid!`);
                }
            })
        }

        console.log('✅ Column settings applied successfully!');
        alert(`✅ Applied column settings to ${table.name}!\n\nSelected: ${selectedColumns().length} columns`)
    }

    // Save as template
    const saveAsTemplate = () => {
        const table = selectedTable()
        if (!table) return

        const name = templateName().trim()
        if (!name) {
            alert("Please enter a template name")
            return
        }

        const columnState = props.gridApi ? props.gridApi.getColumnState() : []

        const newTemplate: ColumnTemplate = {
            id: `template_${Date.now()}`,
            name: name,
            description: templateDescription().trim(),
            visibleColumns: selectedColumns(),
            columnState: columnState,
            createdAt: new Date(),
            createdBy: props.userEmail || "Unknown User",
            isPublic: isPublicTemplate(),
        }

        const updated = [...savedTemplates(), newTemplate]
        setSavedTemplates(updated)
        saveTemplatesToStorage(updated, table.id)

        setTemplateName("")
        setTemplateDescription("")
        setIsPublicTemplate(false)
        setShowCreateForm(false)

        alert(`Template "${name}" saved for ${table.name}!`)
    }

    // Apply template
    const applyTemplate = (template: ColumnTemplate) => {
        if (props.gridApi && template.columnState.length > 0) {
            props.gridApi.applyColumnState({
                state: template.columnState,
                applyOrder: true,
            })
        }
        setSelectedColumns(template.visibleColumns)
        alert(`Template "${template.name}" applied!`)
    }

    // Delete template
    const deleteTemplate = (templateId: string) => {
        const table = selectedTable()
        if (!table) return
        if (!confirm("Are you sure you want to delete this template?")) return

        const updated = savedTemplates().filter((t) => t.id !== templateId)
        setSavedTemplates(updated)
        saveTemplatesToStorage(updated, table.id)
    }

    // Cancel form
    const cancelForm = () => {
        setShowCreateForm(false)
        setTemplateName("")
        setTemplateDescription("")
        setIsPublicTemplate(false)
    }

    return (
        <div class="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-[95vw] h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                />
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                            <div>
                                <h2 class="text-2xl font-bold">Column Settings</h2>
                                <p class="text-indigo-100 text-sm mt-0.5">
                                    Manage column visibility and templates for all Users
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={props.onClose}
                            class="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div class="flex-1 flex overflow-hidden">
                    {/* Left Sidebar - Table List */}
                    <div class="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
                        {/* Search & Filter */}
                        <div class="p-4 border-b border-gray-200 bg-white">
                            <input
                                type="text"
                                placeholder="Search tables..."
                                value={tableSearchQuery()}
                                onInput={(e) => setTableSearchQuery(e.currentTarget.value)}
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                            <div class="flex gap-2 mt-3 flex-wrap">
                                <For each={categories()}>
                                    {(cat) => (
                                        <button
                                            onClick={() => setSelectedCategory(cat)}
                                            class={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedCategory() === cat
                                                    ? "bg-indigo-600 text-white"
                                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    )}
                                </For>
                            </div>
                        </div>

                        {/* Table List */}
                        <div class="flex-1 overflow-y-auto p-3 space-y-2">
                            <For each={filteredTables()}>
                                {(table) => (
                                    <button
                                        onClick={() => handleTableSelect(table)}
                                        class={`w-full text-left p-3 rounded-lg transition-all ${selectedTable()?.id === table.id
                                                ? "bg-indigo-600 text-white shadow-md"
                                                : "bg-white hover:bg-gray-100 border border-gray-200"
                                            }`}
                                    >
                                        <div class="flex items-start justify-between gap-2">
                                            <div class="flex-1 min-w-0">
                                                <div class="flex items-center gap-2">
                                                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                                        />
                                                    </svg>
                                                    <h3 class="font-semibold text-sm truncate">{table.name}</h3>
                                                </div>
                                                <p
                                                    class={`text-xs mt-1 truncate ${selectedTable()?.id === table.id ? "text-indigo-100" : "text-gray-600"}`}
                                                >
                                                    {table.description}
                                                </p>
                                                <div class="flex items-center gap-3 mt-2 text-xs">
                                                    <span
                                                        class={`flex items-center gap-1 ${selectedTable()?.id === table.id ? "text-indigo-100" : "text-gray-500"}`}
                                                    >
                                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                stroke-linecap="round"
                                                                stroke-linejoin="round"
                                                                stroke-width="2"
                                                                d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                            />
                                                        </svg>
                                                        {table.columnCount} cols
                                                    </span>
                                                    <span
                                                        class={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedTable()?.id === table.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                                                            }`}
                                                    >
                                                        {table.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <svg
                                                class={`w-5 h-5 flex-shrink-0 ${selectedTable()?.id === table.id ? "opacity-100" : "opacity-0"}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </button>
                                )}
                            </For>
                        </div>

                        {/* Footer Stats */}
                        <div class="p-4 border-t border-gray-200 bg-white">
                            <div class="text-center text-sm text-gray-600">
                                <span class="font-semibold text-gray-800">{filteredTables().length}</span> tables found
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Column Settings */}
                    <div class="flex-1 overflow-y-auto">
                        <Show
                            when={selectedTable()}
                            fallback={
                                <div class="h-full flex items-center justify-center text-gray-500">
                                    <div class="text-center">
                                        <svg
                                            class="w-16 h-16 mx-auto mb-4 text-gray-300"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                            />
                                        </svg>
                                        <p class="text-lg font-medium">Select a table to manage columns</p>
                                        <p class="text-sm mt-2">Choose from the list on the left</p>
                                    </div>
                                </div>
                            }
                        >
                            <div class="p-6 space-y-6">
                                {/* Selected Table Info */}
                                <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200">
                                    <div class="flex items-start justify-between">
                                        <div>
                                            <h3 class="text-xl font-bold text-gray-800">{selectedTable()!.name}</h3>
                                            <p class="text-sm text-gray-600 mt-1">{selectedTable()!.description}</p>
                                            <div class="flex items-center gap-4 mt-3 text-sm">
                                                <span class="text-gray-700">
                                                    <strong>Location:</strong> {selectedTable()!.location}
                                                </span>
                                                <span class="text-gray-700">
                                                    <strong>Columns:</strong> {selectedTable()!.columnCount}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Column Selection */}
                                <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                                    <div class="border-b border-gray-200 bg-gray-50 px-5 py-3">
                                        <h3 class="text-base font-semibold text-gray-800">Column Visibility</h3>
                                        <p class="text-xs text-gray-600 mt-1">Select columns to display in the grid</p>
                                    </div>

                                    <div class="p-5">
                                        {/* Action Buttons */}
                                        <div class="flex gap-2 mb-4 flex-wrap">
                                            <button
                                                onClick={selectAll}
                                                class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Select All
                                            </button>
                                            <button
                                                onClick={deselectAll}
                                                class="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
                                            >
                                                Clear Selection
                                            </button>
                                            <button
                                                onClick={applyToGrid}
                                                class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors ml-auto"
                                            >
                                                Apply to Grid
                                            </button>
                                            <button
                                                onClick={() => setShowCreateForm(!showCreateForm())}
                                                class="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                                            >
                                                <span class="inline-flex items-center gap-1">
                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Save Template
                                                </span>
                                            </button>
                                        </div>

                                        {/* Column List */}
                                        <div class="grid grid-cols-2 gap-3">
                                            <For each={currentColumns()}>
                                                {(column) => (
                                                    <label
                                                        class={`flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${selectedColumns().includes(column.field)
                                                                ? "bg-blue-50 border-blue-300"
                                                                : "bg-white border-gray-200 hover:border-gray-300"
                                                            } ${column.isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedColumns().includes(column.field)}
                                                            disabled={column.isLocked}
                                                            onChange={() => !column.isLocked && toggleColumn(column.field)}
                                                            class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <div class="flex-1 min-w-0">
                                                            <div class="text-sm font-medium text-gray-900 truncate">{column.headerName}</div>
                                                            <Show when={column.isLocked}>
                                                                <div class="text-xs text-gray-500">Locked</div>
                                                            </Show>
                                                        </div>
                                                        <Show
                                                            when={selectedColumns().includes(column.field)}
                                                            fallback={
                                                                <svg
                                                                    class="w-4 h-4 text-gray-400"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        stroke-linecap="round"
                                                                        stroke-linejoin="round"
                                                                        stroke-width="2"
                                                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                                                    />
                                                                </svg>
                                                            }
                                                        >
                                                            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path
                                                                    stroke-linecap="round"
                                                                    stroke-linejoin="round"
                                                                    stroke-width="2"
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    stroke-linecap="round"
                                                                    stroke-linejoin="round"
                                                                    stroke-width="2"
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </Show>
                                                    </label>
                                                )}
                                            </For>
                                        </div>

                                        {/* Summary */}
                                        <div class="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div class="text-sm text-gray-700">
                                                <span class="font-semibold">{selectedColumns().length}</span> of{" "}
                                                <span class="font-semibold">{currentColumns().length}</span> columns selected
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Template Form */}
                                <Show when={showCreateForm()}>
                                    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                                        <div class="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-3">
                                            <h3 class="text-base font-semibold text-gray-800">Create Template</h3>
                                        </div>
                                        <div class="p-5 space-y-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
                                                <input
                                                    type="text"
                                                    value={templateName()}
                                                    onInput={(e) => setTemplateName(e.currentTarget.value)}
                                                    placeholder="e.g., Monthly Report View"
                                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                <textarea
                                                    value={templateDescription()}
                                                    onInput={(e) => setTemplateDescription(e.currentTarget.value)}
                                                    placeholder="Describe this template..."
                                                    rows="3"
                                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="isPublic"
                                                    checked={isPublicTemplate()}
                                                    onChange={(e) => setIsPublicTemplate(e.currentTarget.checked)}
                                                    class="w-4 h-4 text-purple-600 rounded"
                                                />
                                                <label for="isPublic" class="text-sm text-gray-700">
                                                    Make public (visible to all users)
                                                </label>
                                            </div>
                                            <div class="flex gap-2 pt-2">
                                                <button
                                                    onClick={saveAsTemplate}
                                                    class="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
                                                >
                                                    <span class="inline-flex items-center gap-1">
                                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                stroke-linecap="round"
                                                                stroke-linejoin="round"
                                                                stroke-width="2"
                                                                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                                                            />
                                                        </svg>
                                                        Save Template
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={cancelForm}
                                                    class="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Show>

                                {/* Saved Templates */}
                                <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                                    <div class="border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-3">
                                        <h3 class="text-base font-semibold text-gray-800">Saved Templates</h3>
                                        <p class="text-xs text-gray-600 mt-1">{savedTemplates().length} template(s) for this table</p>
                                    </div>
                                    <div class="p-5">
                                        <Show
                                            when={savedTemplates().length > 0}
                                            fallback={
                                                <div class="text-center py-8 text-gray-500">
                                                    <svg
                                                        class="w-12 h-12 mx-auto mb-3 text-gray-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    <p class="text-sm">No templates saved yet</p>
                                                </div>
                                            }
                                        >
                                            <div class="space-y-3">
                                                <For each={savedTemplates()}>
                                                    {(template) => (
                                                        <div class="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
                                                            {/* Template Header */}
                                                            <div class="bg-gray-50 px-4 py-3 flex items-center justify-between">
                                                                <div class="flex-1 min-w-0">
                                                                    <div class="flex items-center gap-2">
                                                                        <h4 class="text-sm font-semibold text-gray-900 truncate">{template.name}</h4>
                                                                        <Show when={template.isPublic}>
                                                                            <span class="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                                                Public
                                                                            </span>
                                                                        </Show>
                                                                    </div>
                                                                    <div class="flex items-center gap-3 mt-1 text-xs text-gray-600">
                                                                        <span>{template.visibleColumns.length} columns</span>
                                                                        <span>{template.createdBy}</span>
                                                                        <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                </div>
                                                                <div class="flex gap-2 ml-4">
                                                                    <button
                                                                        onClick={() => applyTemplate(template)}
                                                                        class="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                                                                    >
                                                                        Apply
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            setExpandedTemplate(expandedTemplate() === template.id ? null : template.id)
                                                                        }
                                                                        class="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300 transition-colors"
                                                                    >
                                                                        {expandedTemplate() === template.id ? "Hide" : "View"}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deleteTemplate(template.id)}
                                                                        class="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200 transition-colors"
                                                                    >
                                                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path
                                                                                stroke-linecap="round"
                                                                                stroke-linejoin="round"
                                                                                stroke-width="2"
                                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                            />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Template Details (Expandable) */}
                                                            <Show when={expandedTemplate() === template.id}>
                                                                <div class="px-4 py-3 bg-white border-t border-gray-200">
                                                                    <Show when={template.description}>
                                                                        <div class="mb-3">
                                                                            <p class="text-xs font-medium text-gray-700 mb-1">Description:</p>
                                                                            <p class="text-sm text-gray-600">{template.description}</p>
                                                                        </div>
                                                                    </Show>
                                                                    <div>
                                                                        <p class="text-xs font-medium text-gray-700 mb-2">
                                                                            Visible Columns ({template.visibleColumns.length}):
                                                                        </p>
                                                                        <div class="flex flex-wrap gap-1.5">
                                                                            <For each={template.visibleColumns}>
                                                                                {(colField) => {
                                                                                    const colInfo = currentColumns().find((c) => c.field === colField)
                                                                                    return (
                                                                                        <span class="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                                                                                            {colInfo?.headerName || colField}
                                                                                        </span>
                                                                                    )
                                                                                }}
                                                                            </For>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Show>
                                                        </div>
                                                    )}
                                                </For>
                                            </div>
                                        </Show>
                                    </div>
                                </div>
                            </div>
                        </Show>
                    </div>
                </div>
            </div>
        </div>
    )
}
