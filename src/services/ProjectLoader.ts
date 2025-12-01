/**
 * ProjectLoader Service
 * Loads and manages unified project data (KML + BOQ)
 */

import type { ProjectData, CableFeatureCollection } from '../types';
import { convertKmlToGeoJson } from './EnhancedKmlConverter';
import { BoQConverter } from './BoQConverter';

/**
 * Load default projects from actual KML and BOQ files in src/data/
 */
export async function loadDefaultProjects(): Promise<ProjectData[]> {
  const projectConfigs = [
    {
      projectName: 'RMJ-Monas',
      projectCode: 'RMJ-Monas-001',
      kmlPath: '/src/data/KML/kml-monas-dki.kml',
      boqPath: '/src/data/BoQ-testing.xlsx'
    }
  ];
  
  const projects: ProjectData[] = [];
  
  for (const config of projectConfigs) {
    try {
      // Load KML file
      const kmlResponse = await fetch(config.kmlPath);
      if (!kmlResponse.ok) {
        console.warn(`Failed to load KML: ${config.kmlPath}`);
        continue;
      }
      
      const kmlText = await kmlResponse.text();
      const kmlData = convertKmlToGeoJson(kmlText);
      
      if (!kmlData || kmlData.features.length === 0) {
        console.warn(`KML file has no features: ${config.kmlPath}`);
        continue;
      }
      
      // Load BOQ file
      let boqData = null;
      try {
        const boqResponse = await fetch(config.boqPath);
        if (boqResponse.ok) {
          const boqBlob = await boqResponse.blob();
          const boqFile = new File([boqBlob], config.boqPath.split('/').pop() || 'boq.xlsx');
          boqData = await BoQConverter.convertExcelToBoQ(boqFile);
        }
      } catch (boqError) {
        console.warn(`Failed to load BOQ: ${config.boqPath}`, boqError);
      }
      
      // Create project
      const now = new Date().toISOString();
      const project: ProjectData = {
        id: `proj-${config.projectCode}-${Date.now()}`,
        projectName: config.projectName,
        projectCode: config.projectCode,
        kml: {
          fileName: config.kmlPath.split('/').pop() || 'unknown.kml',
          fileSize: new Blob([kmlText]).size,
          data: kmlData
        },
        boq: boqData ? {
          fileName: config.boqPath.split('/').pop() || 'unknown.xlsx',
          fileSize: 0, // Will be set when we have actual file
          data: boqData
        } : null,
        metadata: {
          createdDate: now,
          lastModified: now,
          description: `Project ${config.projectName}`,
          status: 'planning'
        },
        statistics: calculateProjectStatistics(kmlData),
        uploadDate: now
      };
      
      projects.push(project);
      console.log(`✓ Loaded project: ${config.projectName}`);
      
    } catch (error) {
      console.error(`Error loading project ${config.projectName}:`, error);
    }
  }
  
  return projects;
}

/**
 * Calculate statistics from KML data
 */
export function calculateProjectStatistics(data: CableFeatureCollection) {
  let totalPoints = 0;
  let totalLines = 0;
  let totalPolygons = 0;
  let totalDistance = 0;
  
  data.features.forEach(feature => {
    const geomType = feature.geometry.type;
    
    if (geomType === 'Point') {
      totalPoints++;
    } else if (geomType === 'LineString') {
      totalLines++;
      // Calculate distance for LineString
      if ('totalDistance' in feature.properties && feature.properties.totalDistance) {
        totalDistance += feature.properties.totalDistance;
      }
    } else if (geomType === 'Polygon') {
      totalPolygons++;
    }
  });
  
  return {
    totalPoints,
    totalLines,
    totalPolygons,
    totalDistance: Math.round(totalDistance),
    totalFeatures: data.features.length
  };
}

/**
 * Save projects to localStorage
 */
export function saveProjectsToStorage(projects: ProjectData[]): void {
  try {
    localStorage.setItem('projects', JSON.stringify(projects));
    console.log('✓ Projects saved to localStorage:', projects.length);
  } catch (error) {
    console.error('Failed to save projects to localStorage:', error);
  }
}

/**
 * Load projects from localStorage
 */
export function loadProjectsFromStorage(): ProjectData[] {
  try {
    const stored = localStorage.getItem('projects');
    if (stored) {
      const projects: ProjectData[] = JSON.parse(stored);
      console.log('✓ Loaded projects from localStorage:', projects.length);
      return projects;
    }
  } catch (error) {
    console.error('Failed to load projects from localStorage:', error);
  }
  return [];
}

/**
 * Create a new project from uploaded files
 */
export function createProjectFromUpload(
  projectName: string,
  projectCode: string,
  kmlFile: File,
  kmlData: CableFeatureCollection,
  boqFile?: File,
  boqData?: any
): ProjectData {
  const now = new Date().toISOString();
  
  return {
    id: `proj-${Date.now()}`,
    projectName,
    projectCode,
    kml: {
      fileName: kmlFile.name,
      fileSize: kmlFile.size,
      data: kmlData
    },
    boq: boqFile && boqData ? {
      fileName: boqFile.name,
      fileSize: boqFile.size,
      data: boqData
    } : null,
    metadata: {
      createdDate: now,
      lastModified: now,
      description: `Project ${projectName}`,
      status: 'planning'
    },
    statistics: calculateProjectStatistics(kmlData),
    uploadDate: now
  };
}
