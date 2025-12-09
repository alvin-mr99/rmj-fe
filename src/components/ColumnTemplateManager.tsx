import { createSignal, For, Show, createEffect } from 'solid-js';
import type { ColumnState, GridApi } from 'ag-grid-community';

// Types
interface ColumnTemplate {
    id: string;
    name: string;
    description: string;
    visibleColumns: string[]; // field names yang visible
    columnState: ColumnState[]; // untuk save width, order, pinned, sort
    createdAt: Date;
    createdBy: string;
    isPublic: boolean;
}

interface ColumnInfo {
    field: string;
    headerName: string;
    isLocked: boolean; // kolom yang tidak bisa dihide (seperti checkbox, action)
}

interface ColumnTemplateManagerProps {
    gridApi: GridApi | null;
    userEmail?: string;
    onClose: () => void;
    tableType?: string; // Optional for backward compatibility
    tableLabel?: string; // Optional for backward compatibility
}


export function ColumnTemplateManager(props: ColumnTemplateManagerProps) {
    // State untuk available columns dari grid
    const [availableColumns, setAvailableColumns] = createSignal<ColumnInfo[]>([]);

    // State untuk selected columns (yang akan ditampilkan)
    const [selectedColumns, setSelectedColumns] = createSignal<string[]>([]);

    // State untuk saved templates
    const [savedTemplates, setSavedTemplates] = createSignal<ColumnTemplate[]>([]);

    // State untuk expanded template detail
    const [expandedTemplate, setExpandedTemplate] = createSignal<string | null>(null);

    // State untuk form create template
    const [showCreateForm, setShowCreateForm] = createSignal(false);
    const [templateName, setTemplateName] = createSignal('');
    const [templateDescription, setTemplateDescription] = createSignal('');
    const [isPublicTemplate, setIsPublicTemplate] = createSignal(false);

    // Initialize: Get columns from AG Grid
    const initializeColumns = () => {
        if (!props.gridApi) return;

        const allColumns = props.gridApi.getColumns();
        if (!allColumns) return;

        const columns: ColumnInfo[] = allColumns.map(col => {
            const colDef = col.getColDef();
            return {
                field: colDef.field || col.getColId(),
                headerName: colDef.headerName || colDef.field || col.getColId(),
                isLocked: colDef.pinned === 'left' || colDef.pinned === 'right' ||
                    colDef.checkboxSelection === true ||
                    colDef.field === 'action'
            };
        });

        setAvailableColumns(columns);

        // Set initial selected columns (currently visible)
        const visibleColumns = columns
            .filter(col => {
                const column = props.gridApi!.getColumn(col.field);
                return column ? column.isVisible() : true;
            })
            .map(col => col.field);
        setSelectedColumns(visibleColumns);

        // Load saved templates from localStorage
        loadTemplates();
    };

    // Load templates from localStorage
    const loadTemplates = () => {
        try {
            const storageKey = props.tableType ? `rmj_column_templates_${props.tableType}` : 'rmj_column_templates';
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const templates = JSON.parse(stored) as ColumnTemplate[];
                setSavedTemplates(templates);
            }
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    };

    // Save templates to localStorage
    const saveTemplatesToStorage = (templates: ColumnTemplate[]) => {
        try {
            const storageKey = props.tableType ? `rmj_column_templates_${props.tableType}` : 'rmj_column_templates';
            localStorage.setItem(storageKey, JSON.stringify(templates));
        } catch (error) {
            console.error('Error saving templates:', error);
        }
    };

    // Toggle column selection
    const toggleColumn = (field: string) => {
        setSelectedColumns(prev => {
            if (prev.includes(field)) {
                return prev.filter(f => f !== field);
            } else {
                return [...prev, field];
            }
        });
    };

    // Select all columns
    const selectAll = () => {
        const allFields = availableColumns().map(col => col.field);
        setSelectedColumns(allFields);
    };

    // Deselect all (except locked)
    const deselectAll = () => {
        const lockedFields = availableColumns()
            .filter(col => col.isLocked)
            .map(col => col.field);
        setSelectedColumns(lockedFields);
    };

    // Apply current selection to grid (without saving as template)
    const applyToGrid = () => {
        if (!props.gridApi) return;

        const selected = selectedColumns();

        // Hide/show columns based on selection
        availableColumns().forEach(col => {
            const column = props.gridApi!.getColumn(col.field);
            if (column) {
                const shouldShow = selected.includes(col.field);
                props.gridApi!.setColumnsVisible([col.field], shouldShow);
            }
        });

        alert('Column visibility applied successfully!');
    };

    // Save current selection as a new template
    const saveAsTemplate = () => {
        if (!props.gridApi) return;

        const name = templateName().trim();
        if (!name) {
            alert('Please enter a template name');
            return;
        }

        // Get current column state (includes width, sort, pinned, etc)
        const columnState = props.gridApi.getColumnState();

        const newTemplate: ColumnTemplate = {
            id: `template_${Date.now()}`,
            name: name,
            description: templateDescription().trim(),
            visibleColumns: selectedColumns(),
            columnState: columnState,
            createdAt: new Date(),
            createdBy: props.userEmail || 'Unknown User',
            isPublic: isPublicTemplate()
        };

        const updated = [...savedTemplates(), newTemplate];
        setSavedTemplates(updated);
        saveTemplatesToStorage(updated);

        // Reset form
        setTemplateName('');
        setTemplateDescription('');
        setIsPublicTemplate(false);
        setShowCreateForm(false);

        alert(`Template "${name}" saved successfully!`);
    };

    // Apply saved template to grid
    const applyTemplate = (template: ColumnTemplate) => {
        if (!props.gridApi) return;

        // Apply column state (width, sort, pinned, visibility)
        props.gridApi.applyColumnState({
            state: template.columnState,
            applyOrder: true
        });

        // Update local selected columns
        setSelectedColumns(template.visibleColumns);

        alert(`Template "${template.name}" applied successfully!`);
    };

    // Delete template
    const deleteTemplate = (templateId: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;

        const updated = savedTemplates().filter(t => t.id !== templateId);
        setSavedTemplates(updated);
        saveTemplatesToStorage(updated);
    };

    // Initialize on mount and when gridApi changes
    createEffect(() => {
        if (props.gridApi) {
            initializeColumns();
        }
    });

    return (
        <div class="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div class="bg-white border-b border-gray-200 px-6 py-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-xl font-semibold text-gray-800">Column Settings{props.tableLabel ? ` - ${props.tableLabel}` : ''}</h2>
                        <p class="text-sm text-gray-600 mt-1">
                            Manage visible columns and save custom templates
                        </p>
                    </div>
                    <button
                        onClick={props.onClose}
                        class="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div class="flex-1 overflow-y-auto p-6">
                <div class="max-w-5xl mx-auto space-y-6">

                    {/* Column Selection Section */}
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div class="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3">
                            <h3 class="text-base font-semibold text-gray-800">Select Columns to Display</h3>
                            <p class="text-xs text-gray-600 mt-1">
                                Choose which columns you want to see in the grid
                            </p>
                        </div>

                        <div class="p-5">
                            {/* Action Buttons */}
                            <div class="flex gap-2 mb-4">
                                <button
                                    onClick={selectAll}
                                    class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Select All
                                </button>
                                <button
                                    onClick={deselectAll}
                                    class="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 transition-colors"
                                >
                                    Unselect All
                                </button>
                                <button
                                    onClick={applyToGrid}
                                    class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors ml-auto"
                                >
                                    Apply to Grid
                                </button>
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    Save as Template
                                </button>
                            </div>

                            {/* Column List */}
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <For each={availableColumns()}>
                                    {(column) => (
                                        <label
                                            class={`flex items-center gap-2 p-3 rounded-md border transition-all cursor-pointer
                        ${selectedColumns().includes(column.field)
                                                    ? 'bg-blue-50 border-blue-300'
                                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                                }
                        ${column.isLocked ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedColumns().includes(column.field)}
                                                disabled={column.isLocked}
                                                onChange={() => !column.isLocked && toggleColumn(column.field)}
                                                class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <div class="flex-1 min-w-0">
                                                <div class="text-sm font-medium text-gray-900 truncate">
                                                    {column.headerName}
                                                </div>
                                                <Show when={column.isLocked}>
                                                    <div class="text-xs text-gray-500">🔒 Locked</div>
                                                </Show>
                                            </div>
                                        </label>
                                    )}
                                </For>
                            </div>

                            {/* Summary */}
                            <div class="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                                <div class="text-sm text-gray-700">
                                    <span class="font-semibold">{selectedColumns().length}</span> of{' '}
                                    <span class="font-semibold">{availableColumns().length}</span> columns selected
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Create Template Form */}
                    <Show when={showCreateForm()}>
                        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div class="border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-3">
                                <h3 class="text-base font-semibold text-gray-800">Create New Template</h3>
                            </div>

                            <div class="p-5 space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Template Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={templateName()}
                                        onInput={(e) => setTemplateName(e.currentTarget.value)}
                                        placeholder="e.g., My Custom View"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={templateDescription()}
                                        onInput={(e) => setTemplateDescription(e.currentTarget.value)}
                                        placeholder="Describe this template..."
                                        rows="3"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div class="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isPublic"
                                        checked={isPublicTemplate()}
                                        onChange={(e) => setIsPublicTemplate(e.currentTarget.checked)}
                                        class="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <label for="isPublic" class="text-sm text-gray-700">
                                        Make this template public (visible to all users)
                                    </label>
                                </div>

                                <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                                    <div class="flex gap-2">
                                        <svg class="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                                        </svg>
                                        <p class="text-xs text-blue-700">
                                            The current visible columns in the grid will be saved to this template.
                                        </p>
                                    </div>
                                </div>

                                <div class="flex gap-2 pt-2">
                                    <button
                                        onClick={saveAsTemplate}
                                        class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                                    >
                                        Save Template
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            setTemplateName('');
                                            setTemplateDescription('');
                                            setIsPublicTemplate(false);
                                        }}
                                        class="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Show>

                    {/* Saved Templates Section */}
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div class="border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-3">
                            <h3 class="text-base font-semibold text-gray-800">Saved Templates</h3>
                            <p class="text-xs text-gray-600 mt-1">
                                {savedTemplates().length} template{savedTemplates().length !== 1 ? 's' : ''} available
                            </p>
                        </div>

                        <div class="p-5">
                            <Show
                                when={savedTemplates().length > 0}
                                fallback={
                                    <div class="text-center py-8 text-gray-500">
                                        <svg class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p class="text-sm">No templates saved yet</p>
                                        <p class="text-xs mt-1">Create your first template to get started</p>
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
                                                            <h4 class="text-sm font-semibold text-gray-900 truncate">
                                                                {template.name}
                                                            </h4>
                                                            <Show when={template.isPublic}>
                                                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                                    Public
                                                                </span>
                                                            </Show>
                                                        </div>
                                                        <div class="flex items-center gap-3 mt-1 text-xs text-gray-600">
                                                            <span>📊 {template.visibleColumns.length} columns</span>
                                                            <span>👤 {template.createdBy}</span>
                                                            <span>📅 {new Date(template.createdAt).toLocaleDateString()}</span>
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
                                                            onClick={() => setExpandedTemplate(
                                                                expandedTemplate() === template.id ? null : template.id
                                                            )}
                                                            class="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300 transition-colors"
                                                        >
                                                            {expandedTemplate() === template.id ? 'Hide' : 'View'}
                                                        </button>
                                                        <button
                                                            onClick={() => deleteTemplate(template.id)}
                                                            class="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200 transition-colors"
                                                        >
                                                            Delete
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
                                                                        const colInfo = availableColumns().find(c => c.field === colField);
                                                                        return (
                                                                            <span class="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                                                                                {colInfo?.headerName || colField}
                                                                            </span>
                                                                        );
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
            </div>
        </div>
    );
}