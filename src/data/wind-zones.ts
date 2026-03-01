import type { TerrainCategory } from '@/types/loads';

export interface WindZoneOption {
  label: string;
  vb0: number;
}

export const WIND_SPEED_OPTIONS: WindZoneOption[] = [
  { label: 'Zone 1 (22 m/s)', vb0: 22 },
  { label: 'Zone 2 (25 m/s)', vb0: 25 },
  { label: 'Zone 3 (27 m/s)', vb0: 27 },
  { label: 'Zone 4 (30 m/s)', vb0: 30 },
  { label: 'Zone 5 (33 m/s)', vb0: 33 },
];

export const TERRAIN_DESCRIPTIONS: Record<TerrainCategory, string> = {
  '0': 'Sea or coastal area',
  'I': 'Lakes or flat open country',
  'II': 'Low vegetation, isolated obstacles',
  'III': 'Regular vegetation or buildings',
  'IV': 'Urban areas (>15% built)',
};

export const EXPOSURE_FACTOR: Record<TerrainCategory, Record<string, number>> = {
  '0': { '5': 2.4, '10': 2.9, '15': 3.2, '20': 3.4 },
  'I': { '5': 2.1, '10': 2.6, '15': 2.9, '20': 3.1 },
  'II': { '5': 1.7, '10': 2.1, '15': 2.4, '20': 2.6 },
  'III': { '5': 1.2, '10': 1.6, '15': 1.9, '20': 2.1 },
  'IV': { '5': 0.8, '10': 1.1, '15': 1.4, '20': 1.7 },
};
