/**
 * ProjectDetailPanel Component
 * Displays comprehensive project information including BOQ and KML statistics
 */

import { createSignal, Show, For } from 'solid-js';
import type { ProjectData } from '../types';

export interface ProjectDetailPanelProps {
  project: ProjectData;
  onClose: () => void;
}

export function ProjectDetailPanel(props: ProjectDetailPanelProps) {
  const [activeTab, setActiveTab] = createSignal<'overview' | 'boq' | 'kml'>('overview');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'planning':
        return 'Planning';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div class="fixed inset-0 z-[1003] flex items-center justify-center p-4 bg-black/50 animate-[fadeIn_0.2s_ease]">
      <div class="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div class="border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{props.project.projectName}</h2>
              <p class="text-sm text-gray-500 mt-1">{props.project.projectCode}</p>
            </div>
            <div class="flex items-center gap-3">
              <span class={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(props.project.metadata.status)}`}>
                {getStatusLabel(props.project.metadata.status)}
              </span>
              <button
                onClick={props.onClose}
                class="text-gray-400 hover:text-gray-600 transition-colors"
                title="Close"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div class="border-b border-gray-200 px-6">
          <nav class="flex gap-6">
            <button
              onClick={() => setActiveTab('overview')}
              class={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab() === 'overview'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('kml')}
              class={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab() === 'kml'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              KML Data
            </button>
            <button
              onClick={() => setActiveTab('boq')}
              class={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab() === 'boq'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              disabled={!props.project.boq}
            >
              BOQ {!props.project.boq && <span class="text-xs">(N/A)</span>}
            </button>
          </nav>
        </div>

        {/* Content */}
        <div class="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          <Show when={activeTab() === 'overview'}>
            <div class="space-y-6">
              {/* Project Information */}
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">Created Date</p>
                    <p class="text-sm font-medium text-gray-900">{formatDate(props.project.metadata.createdDate)}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Last Modified</p>
                    <p class="text-sm font-medium text-gray-900">{formatDate(props.project.metadata.lastModified)}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Location</p>
                    <p class="text-sm font-medium text-gray-900">{props.project.metadata.location || 'N/A'}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Status</p>
                    <p class="text-sm font-medium text-gray-900">{getStatusLabel(props.project.metadata.status)}</p>
                  </div>
                </div>
                <Show when={props.project.metadata.description}>
                  <div class="mt-4">
                    <p class="text-sm text-gray-500">Description</p>
                    <p class="text-sm text-gray-700 mt-1">{props.project.metadata.description}</p>
                  </div>
                </Show>
              </div>

              {/* Files Information */}
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Project Files</h3>
                <div class="space-y-3">
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center gap-3">
                      <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                      </svg>
                      <div>
                        <p class="text-sm font-medium text-gray-900">KML: {props.project.kml.fileName}</p>
                        <p class="text-xs text-gray-500">{(props.project.kml.fileSize / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  </div>
                  <Show when={props.project.boq}>
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div class="flex items-center gap-3">
                        <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                        </svg>
                        <div>
                          <p class="text-sm font-medium text-gray-900">BOQ: {props.project.boq!.fileName}</p>
                          <p class="text-xs text-gray-500">{(props.project.boq!.fileSize / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    </div>
                  </Show>
                </div>
              </div>

              {/* Quick Statistics */}
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Statistics</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="bg-blue-50 p-4 rounded-lg">
                    <p class="text-sm text-blue-600 font-medium">Total Features</p>
                    <p class="text-2xl font-bold text-blue-900">{formatNumber(props.project.statistics?.totalFeatures || 0)}</p>
                  </div>
                  <div class="bg-green-50 p-4 rounded-lg">
                    <p class="text-sm text-green-600 font-medium">Total Lines</p>
                    <p class="text-2xl font-bold text-green-900">{formatNumber(props.project.statistics?.totalLines || 0)}</p>
                  </div>
                  <div class="bg-purple-50 p-4 rounded-lg">
                    <p class="text-sm text-purple-600 font-medium">Total Points</p>
                    <p class="text-2xl font-bold text-purple-900">{formatNumber(props.project.statistics?.totalPoints || 0)}</p>
                  </div>
                  <div class="bg-orange-50 p-4 rounded-lg">
                    <p class="text-sm text-orange-600 font-medium">Total Distance</p>
                    <p class="text-2xl font-bold text-orange-900">{formatNumber(props.project.statistics?.totalDistance || 0)} m</p>
                  </div>
                </div>
              </div>

              {/* BOQ Summary */}
              <Show when={props.project.boq}>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">BOQ Summary</h3>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <p class="text-sm text-green-700 font-medium">Total Cost</p>
                      <p class="text-xl font-bold text-green-900">{formatCurrency(props.project.boq!.data.summary.totalCost)}</p>
                    </div>
                    <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <p class="text-sm text-blue-700 font-medium">Material Cost</p>
                      <p class="text-xl font-bold text-blue-900">{formatCurrency(props.project.boq!.data.summary.materialCost)}</p>
                    </div>
                    <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                      <p class="text-sm text-purple-700 font-medium">Labor Cost</p>
                      <p class="text-xl font-bold text-purple-900">{formatCurrency(props.project.boq!.data.summary.laborCost)}</p>
                    </div>
                  </div>
                </div>
              </Show>
            </div>
          </Show>

          {/* KML Tab */}
          <Show when={activeTab() === 'kml'}>
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">KML Statistics</h3>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div class="p-4 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-600">Total Features</p>
                    <p class="text-2xl font-bold text-gray-900">{formatNumber(props.project.statistics?.totalFeatures || 0)}</p>
                  </div>
                  <div class="p-4 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-600">Points</p>
                    <p class="text-2xl font-bold text-gray-900">{formatNumber(props.project.statistics?.totalPoints || 0)}</p>
                  </div>
                  <div class="p-4 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-600">Lines</p>
                    <p class="text-2xl font-bold text-gray-900">{formatNumber(props.project.statistics?.totalLines || 0)}</p>
                  </div>
                  <div class="p-4 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-600">Polygons</p>
                    <p class="text-2xl font-bold text-gray-900">{formatNumber(props.project.statistics?.totalPolygons || 0)}</p>
                  </div>
                  <div class="p-4 bg-gray-50 rounded-lg col-span-2">
                    <p class="text-sm text-gray-600">Total Distance</p>
                    <p class="text-2xl font-bold text-gray-900">{formatNumber(props.project.statistics?.totalDistance || 0)} meters</p>
                    <p class="text-sm text-gray-500 mt-1">≈ {((props.project.statistics?.totalDistance || 0) / 1000).toFixed(2)} km</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">File Information</h3>
                <div class="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">File Name:</span>
                    <span class="text-sm font-medium text-gray-900">{props.project.kml.fileName}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">File Size:</span>
                    <span class="text-sm font-medium text-gray-900">{(props.project.kml.fileSize / 1024).toFixed(2)} KB</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Upload Date:</span>
                    <span class="text-sm font-medium text-gray-900">{formatDate(props.project.uploadDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Show>

          {/* BOQ Tab */}
          <Show when={activeTab() === 'boq' && props.project.boq}>
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">BOQ Summary</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p class="text-sm text-green-700">Total Items</p>
                    <p class="text-2xl font-bold text-green-900">{props.project.boq!.data.summary.totalItems}</p>
                  </div>
                  <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p class="text-sm text-blue-700">Material Cost</p>
                    <p class="text-lg font-bold text-blue-900">{formatCurrency(props.project.boq!.data.summary.materialCost)}</p>
                  </div>
                  <div class="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p class="text-sm text-purple-700">Labor Cost</p>
                    <p class="text-lg font-bold text-purple-900">{formatCurrency(props.project.boq!.data.summary.laborCost)}</p>
                  </div>
                  <div class="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p class="text-sm text-orange-700">Equipment Cost</p>
                    <p class="text-lg font-bold text-orange-900">{formatCurrency(props.project.boq!.data.summary.equipmentCost || 0)}</p>
                  </div>
                </div>
                <div class="mt-4 p-4 bg-gradient-to-r from-green-100 to-green-50 rounded-lg border-2 border-green-300">
                  <p class="text-sm text-green-700 font-medium">Total Project Cost</p>
                  <p class="text-3xl font-bold text-green-900">{formatCurrency(props.project.boq!.data.summary.totalCost)}</p>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">BOQ Items</h3>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th class="px-4 py-3 text-left font-medium text-gray-700">No</th>
                        <th class="px-4 py-3 text-left font-medium text-gray-700">Description</th>
                        <th class="px-4 py-3 text-left font-medium text-gray-700">Category</th>
                        <th class="px-4 py-3 text-right font-medium text-gray-700">Quantity</th>
                        <th class="px-4 py-3 text-right font-medium text-gray-700">Unit Price</th>
                        <th class="px-4 py-3 text-right font-medium text-gray-700">Total Price</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                      <For each={props.project.boq!.data.items}>
                        {(item) => (
                          <tr class="hover:bg-gray-50">
                            <td class="px-4 py-3 text-gray-900">{item.no}</td>
                            <td class="px-4 py-3">
                              <div class="text-gray-900 font-medium">{item.description}</div>
                              <Show when={item.notes}>
                                <div class="text-xs text-gray-500 mt-1">{item.notes}</div>
                              </Show>
                            </td>
                            <td class="px-4 py-3">
                              <span class={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                item.category === 'Material' ? 'bg-blue-100 text-blue-800' :
                                item.category === 'Labor' ? 'bg-purple-100 text-purple-800' :
                                item.category === 'Equipment' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {item.category || 'N/A'}
                              </span>
                            </td>
                            <td class="px-4 py-3 text-right text-gray-900">{formatNumber(item.quantity)} {item.unit}</td>
                            <td class="px-4 py-3 text-right text-gray-900">{formatCurrency(item.unitPrice)}</td>
                            <td class="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Show>
        </div>

        {/* Footer */}
        <div class="border-t border-gray-200 px-6 py-4">
          <div class="flex justify-end">
            <button
              onClick={props.onClose}
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
