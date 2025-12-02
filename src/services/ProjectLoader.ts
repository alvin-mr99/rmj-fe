/**
 * ProjectLoader Service
 * Loads and manages unified project data (KML + BOQ)
 */

import type { ProjectData, CableFeatureCollection } from '../types';
import { convertKmlToGeoJson } from './EnhancedKmlConverter';
import { BoQConverter } from './BoQConverter';

// Import KML files directly from src/data/KML
import kmlBundaranHi from '../data/KML/kml-bundaran-hi.kml?raw';
import kmlMonasDki from '../data/KML/kml-monas-dki.kml?raw';
import kmlSenayan from '../data/KML/kml-senayan.kml?raw';
import kmlThamrin from '../data/KML/kml-thamrin.kml?raw';

// Import BOQ files directly from src/data/BoQ
import boqBundaranHiUrl from '../data/BoQ/boq-bundaran-hi.xlsx?url';
import boqMonasDkiUrl from '../data/BoQ/boq-monas-dki.xlsx?url';
import boqSenayanUrl from '../data/BoQ/boq-senayan.xlsx?url';
import boqThamrinUrl from '../data/BoQ/boq-thamrin.xlsx?url';

/**
 * Load default projects from actual KML and BOQ files in src/data/
 */
export async function loadDefaultProjects(): Promise<ProjectData[]> {
  const projectConfigs = [
    {
      projectName: 'Bundaran HI',
      projectCode: 'RMJ-BHI-001',
      kmlText: kmlBundaranHi,
      kmlFileName: 'kml-bundaran-hi.kml',
      boqUrl: boqBundaranHiUrl,
      boqFileName: 'boq-bundaran-hi.xlsx'
    },
    {
      projectName: 'Monas DKI',
      projectCode: 'RMJ-MONAS-002',
      kmlText: kmlMonasDki,
      kmlFileName: 'kml-monas-dki.kml',
      boqUrl: boqMonasDkiUrl,
      boqFileName: 'boq-monas-dki.xlsx'
    },
    {
      projectName: 'Senayan',
      projectCode: 'RMJ-SENAYAN-003',
      kmlText: kmlSenayan,
      kmlFileName: 'kml-senayan.kml',
      boqUrl: boqSenayanUrl,
      boqFileName: 'boq-senayan.xlsx'
    },
    {
      projectName: 'Thamrin',
      projectCode: 'RMJ-THAMRIN-004',
      kmlText: kmlThamrin,
      kmlFileName: 'kml-thamrin.kml',
      boqUrl: boqThamrinUrl,
      boqFileName: 'boq-thamrin.xlsx'
    }
  ];
  
  const projects: ProjectData[] = [];
  
  for (const config of projectConfigs) {
    try {
      // Convert KML text to GeoJSON
      const kmlData = convertKmlToGeoJson(config.kmlText);
      
      if (!kmlData || kmlData.features.length === 0) {
        console.warn(`KML file has no features: ${config.kmlFileName}`);
        continue;
      }
      
      // Load BOQ file
      let boqData = null;
      let boqFileSize = 0;
      try {
        const boqResponse = await fetch(config.boqUrl);
        if (boqResponse.ok) {
          const boqBlob = await boqResponse.blob();
          boqFileSize = boqBlob.size;
          const boqFile = new File([boqBlob], config.boqFileName);
          boqData = await BoQConverter.convertExcelToBoQ(boqFile);
        }
      } catch (boqError) {
        console.warn(`Failed to load BOQ: ${config.boqFileName}`, boqError);
      }
      
      // Create project
      const now = new Date().toISOString();
      const project: ProjectData = {
        id: `proj-${config.projectCode}-${Date.now()}`,
        projectName: config.projectName,
        projectCode: config.projectCode,
        kml: {
          fileName: config.kmlFileName,
          fileSize: new Blob([config.kmlText]).size,
          data: kmlData
        },
        boq: boqData ? {
          fileName: config.boqFileName,
          fileSize: boqFileSize,
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
