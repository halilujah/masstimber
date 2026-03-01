import type { Manufacturer } from '@/types/materials';
import { GLULAM_GRADES } from '../material-properties';

export const BINDERHOLZ: Manufacturer = {
  id: 'binderholz',
  name: 'Binderholz',
  country: 'Austria',
  cltPanels: [
    {
      id: 'bh-clt-60-c3s', name: 'BBS 60 C3s', manufacturer: 'binderholz',
      layup: { layers: 3, thicknesses: [20, 20, 20], totalThickness: 60, longitudinalLayers: 2 },
      widthMax: 3000, lengthMax: 16000, timberGrade: 'C24',
      EI_eff: 1.05e11, moment_capacity: 7.8, weight: 28.8, costPerM2: 40, costPerM3: 667,
    },
    {
      id: 'bh-clt-90-c3s', name: 'BBS 90 C3s', manufacturer: 'binderholz',
      layup: { layers: 3, thicknesses: [30, 30, 30], totalThickness: 90, longitudinalLayers: 2 },
      widthMax: 3000, lengthMax: 16000, timberGrade: 'C24',
      EI_eff: 3.65e11, moment_capacity: 18.5, weight: 43.2, costPerM2: 60, costPerM3: 667,
    },
    {
      id: 'bh-clt-100-c5s', name: 'BBS 100 C5s', manufacturer: 'binderholz',
      layup: { layers: 5, thicknesses: [20, 20, 20, 20, 20], totalThickness: 100, longitudinalLayers: 3 },
      widthMax: 3000, lengthMax: 16000, timberGrade: 'C24',
      EI_eff: 4.8e11, moment_capacity: 20.5, weight: 48.0, costPerM2: 67, costPerM3: 670,
    },
    {
      id: 'bh-clt-120-c5s', name: 'BBS 120 C5s', manufacturer: 'binderholz',
      layup: { layers: 5, thicknesses: [30, 20, 20, 20, 30], totalThickness: 120, longitudinalLayers: 3 },
      widthMax: 3000, lengthMax: 16000, timberGrade: 'C24',
      EI_eff: 7.68e11, moment_capacity: 30.1, weight: 57.6, costPerM2: 80, costPerM3: 667,
    },
    {
      id: 'bh-clt-140-c5s', name: 'BBS 140 C5s', manufacturer: 'binderholz',
      layup: { layers: 5, thicknesses: [40, 20, 20, 20, 40], totalThickness: 140, longitudinalLayers: 3 },
      widthMax: 3000, lengthMax: 16000, timberGrade: 'C24',
      EI_eff: 1.25e12, moment_capacity: 42.8, weight: 67.2, costPerM2: 94, costPerM3: 671,
    },
    {
      id: 'bh-clt-160-c5s', name: 'BBS 160 C5s', manufacturer: 'binderholz',
      layup: { layers: 5, thicknesses: [40, 30, 20, 30, 40], totalThickness: 160, longitudinalLayers: 3 },
      widthMax: 3000, lengthMax: 16000, timberGrade: 'C24',
      EI_eff: 1.82e12, moment_capacity: 55.6, weight: 76.8, costPerM2: 107, costPerM3: 669,
    },
    {
      id: 'bh-clt-200-c7s', name: 'BBS 200 C7s', manufacturer: 'binderholz',
      layup: { layers: 7, thicknesses: [30, 30, 20, 40, 20, 30, 30], totalThickness: 200, longitudinalLayers: 4 },
      widthMax: 3000, lengthMax: 16000, timberGrade: 'C24',
      EI_eff: 3.55e12, moment_capacity: 88.0, weight: 96.0, costPerM2: 134, costPerM3: 670,
    },
  ],
  glulamSections: [
    { id: 'bh-gl24h-120x200', name: 'GL24h 120x200', manufacturer: 'binderholz', grade: 'GL24h', width: 120, depth: 200, properties: GLULAM_GRADES.GL24h, momentCapacity: 19.2, shearCapacity: 34.6, weight: 10.1, costPerM: 17.0 },
    { id: 'bh-gl24h-120x280', name: 'GL24h 120x280', manufacturer: 'binderholz', grade: 'GL24h', width: 120, depth: 280, properties: GLULAM_GRADES.GL24h, momentCapacity: 37.6, shearCapacity: 48.4, weight: 14.1, costPerM: 23.8 },
    { id: 'bh-gl24h-140x320', name: 'GL24h 140x320', manufacturer: 'binderholz', grade: 'GL24h', width: 140, depth: 320, properties: GLULAM_GRADES.GL24h, momentCapacity: 57.3, shearCapacity: 64.5, weight: 18.8, costPerM: 31.8 },
    { id: 'bh-gl24h-160x400', name: 'GL24h 160x400', manufacturer: 'binderholz', grade: 'GL24h', width: 160, depth: 400, properties: GLULAM_GRADES.GL24h, momentCapacity: 102.4, shearCapacity: 92.2, weight: 26.9, costPerM: 45.4 },
    { id: 'bh-gl28h-140x320', name: 'GL28h 140x320', manufacturer: 'binderholz', grade: 'GL28h', width: 140, depth: 320, properties: GLULAM_GRADES.GL28h, momentCapacity: 66.9, shearCapacity: 64.5, weight: 20.6, costPerM: 36.0 },
    { id: 'bh-gl28h-160x400', name: 'GL28h 160x400', manufacturer: 'binderholz', grade: 'GL28h', width: 160, depth: 400, properties: GLULAM_GRADES.GL28h, momentCapacity: 119.5, shearCapacity: 92.2, weight: 29.4, costPerM: 51.5 },
    { id: 'bh-gl28h-180x480', name: 'GL28h 180x480', manufacturer: 'binderholz', grade: 'GL28h', width: 180, depth: 480, properties: GLULAM_GRADES.GL28h, momentCapacity: 193.8, shearCapacity: 124.4, weight: 39.7, costPerM: 69.5 },
    { id: 'bh-gl28h-200x560', name: 'GL28h 200x560', manufacturer: 'binderholz', grade: 'GL28h', width: 200, depth: 560, properties: GLULAM_GRADES.GL28h, momentCapacity: 292.7, shearCapacity: 161.3, weight: 51.5, costPerM: 90.0 },
  ],
};
