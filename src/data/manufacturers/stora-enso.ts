import type { Manufacturer } from '@/types/materials';
import { GLULAM_GRADES } from '../material-properties';

export const STORA_ENSO: Manufacturer = {
  id: 'stora-enso',
  name: 'Stora Enso',
  country: 'Finland/Austria',
  cltPanels: [
    {
      id: 'se-clt-60-c3s', name: 'CLT 60 C3s', manufacturer: 'stora-enso',
      layup: { layers: 3, thicknesses: [20, 20, 20], totalThickness: 60, longitudinalLayers: 2 },
      widthMax: 2950, lengthMax: 16000, timberGrade: 'C24',
      EI_eff: 1.05e11, moment_capacity: 7.8, weight: 28.8, costPerM2: 42, costPerM3: 700,
    },
    {
      id: 'se-clt-80-c3s', name: 'CLT 80 C3s', manufacturer: 'stora-enso',
      layup: { layers: 3, thicknesses: [30, 20, 30], totalThickness: 80, longitudinalLayers: 2 },
      widthMax: 2950, lengthMax: 16000, timberGrade: 'C24',
      EI_eff: 2.56e11, moment_capacity: 14.2, weight: 38.4, costPerM2: 56, costPerM3: 700,
    },
    {
      id: 'se-clt-100-c3s', name: 'CLT 100 C3s', manufacturer: 'stora-enso',
      layup: { layers: 3, thicknesses: [40, 20, 40], totalThickness: 100, longitudinalLayers: 2 },
      widthMax: 2950, lengthMax: 16000, timberGrade: 'C24',
      EI_eff: 5.12e11, moment_capacity: 22.4, weight: 48.0, costPerM2: 70, costPerM3: 700,
    },
    {
      id: 'se-clt-120-c5s', name: 'CLT 120 C5s', manufacturer: 'stora-enso',
      layup: { layers: 5, thicknesses: [30, 20, 20, 20, 30], totalThickness: 120, longitudinalLayers: 3 },
      widthMax: 2950, lengthMax: 16000, timberGrade: 'C24',
      EI_eff: 7.68e11, moment_capacity: 30.1, weight: 57.6, costPerM2: 84, costPerM3: 700,
    },
    {
      id: 'se-clt-140-c5s', name: 'CLT 140 C5s', manufacturer: 'stora-enso',
      layup: { layers: 5, thicknesses: [40, 20, 20, 20, 40], totalThickness: 140, longitudinalLayers: 3 },
      widthMax: 2950, lengthMax: 16000, timberGrade: 'C24',
      EI_eff: 1.25e12, moment_capacity: 42.8, weight: 67.2, costPerM2: 98, costPerM3: 700,
    },
    {
      id: 'se-clt-160-c5s', name: 'CLT 160 C5s', manufacturer: 'stora-enso',
      layup: { layers: 5, thicknesses: [40, 30, 20, 30, 40], totalThickness: 160, longitudinalLayers: 3 },
      widthMax: 2950, lengthMax: 16000, timberGrade: 'C24',
      EI_eff: 1.82e12, moment_capacity: 55.6, weight: 76.8, costPerM2: 112, costPerM3: 700,
    },
    {
      id: 'se-clt-180-c5s', name: 'CLT 180 C5s', manufacturer: 'stora-enso',
      layup: { layers: 5, thicknesses: [40, 40, 20, 40, 40], totalThickness: 180, longitudinalLayers: 3 },
      widthMax: 2950, lengthMax: 16000, timberGrade: 'C24',
      EI_eff: 2.52e12, moment_capacity: 68.9, weight: 86.4, costPerM2: 126, costPerM3: 700,
    },
    {
      id: 'se-clt-200-c5s', name: 'CLT 200 C5s', manufacturer: 'stora-enso',
      layup: { layers: 5, thicknesses: [40, 40, 40, 40, 40], totalThickness: 200, longitudinalLayers: 3 },
      widthMax: 2950, lengthMax: 16000, timberGrade: 'C24',
      EI_eff: 3.33e12, moment_capacity: 83.2, weight: 96.0, costPerM2: 140, costPerM3: 700,
    },
  ],
  glulamSections: [
    { id: 'se-gl24h-120x200', name: 'GL24h 120x200', manufacturer: 'stora-enso', grade: 'GL24h', width: 120, depth: 200, properties: GLULAM_GRADES.GL24h, momentCapacity: 19.2, shearCapacity: 34.6, weight: 10.1, costPerM: 18.0 },
    { id: 'se-gl24h-120x240', name: 'GL24h 120x240', manufacturer: 'stora-enso', grade: 'GL24h', width: 120, depth: 240, properties: GLULAM_GRADES.GL24h, momentCapacity: 27.6, shearCapacity: 41.5, weight: 12.1, costPerM: 21.6 },
    { id: 'se-gl24h-120x280', name: 'GL24h 120x280', manufacturer: 'stora-enso', grade: 'GL24h', width: 120, depth: 280, properties: GLULAM_GRADES.GL24h, momentCapacity: 37.6, shearCapacity: 48.4, weight: 14.1, costPerM: 25.2 },
    { id: 'se-gl24h-140x320', name: 'GL24h 140x320', manufacturer: 'stora-enso', grade: 'GL24h', width: 140, depth: 320, properties: GLULAM_GRADES.GL24h, momentCapacity: 57.3, shearCapacity: 64.5, weight: 18.8, costPerM: 33.6 },
    { id: 'se-gl24h-140x360', name: 'GL24h 140x360', manufacturer: 'stora-enso', grade: 'GL24h', width: 140, depth: 360, properties: GLULAM_GRADES.GL24h, momentCapacity: 72.6, shearCapacity: 72.6, weight: 21.2, costPerM: 37.8 },
    { id: 'se-gl24h-160x400', name: 'GL24h 160x400', manufacturer: 'stora-enso', grade: 'GL24h', width: 160, depth: 400, properties: GLULAM_GRADES.GL24h, momentCapacity: 102.4, shearCapacity: 92.2, weight: 26.9, costPerM: 48.0 },
    { id: 'se-gl24h-160x440', name: 'GL24h 160x440', manufacturer: 'stora-enso', grade: 'GL24h', width: 160, depth: 440, properties: GLULAM_GRADES.GL24h, momentCapacity: 124.0, shearCapacity: 101.4, weight: 29.6, costPerM: 52.8 },
    { id: 'se-gl24h-180x480', name: 'GL24h 180x480', manufacturer: 'stora-enso', grade: 'GL24h', width: 180, depth: 480, properties: GLULAM_GRADES.GL24h, momentCapacity: 166.1, shearCapacity: 124.4, weight: 36.3, costPerM: 64.8 },
    { id: 'se-gl24h-200x520', name: 'GL24h 200x520', manufacturer: 'stora-enso', grade: 'GL24h', width: 200, depth: 520, properties: GLULAM_GRADES.GL24h, momentCapacity: 216.3, shearCapacity: 149.8, weight: 43.7, costPerM: 78.0 },
    { id: 'se-gl24h-200x560', name: 'GL24h 200x560', manufacturer: 'stora-enso', grade: 'GL24h', width: 200, depth: 560, properties: GLULAM_GRADES.GL24h, momentCapacity: 250.9, shearCapacity: 161.3, weight: 47.0, costPerM: 84.0 },
    { id: 'se-gl24h-200x600', name: 'GL24h 200x600', manufacturer: 'stora-enso', grade: 'GL24h', width: 200, depth: 600, properties: GLULAM_GRADES.GL24h, momentCapacity: 288.0, shearCapacity: 172.8, weight: 50.4, costPerM: 90.0 },
  ],
};
