import type { SoilType } from '@/types/loads';

export interface SeismicZoneOption {
  label: string;
  agR: number;
}

export const SEISMIC_ZONE_OPTIONS: SeismicZoneOption[] = [
  { label: 'Zone 0 (0.0g) - Very low', agR: 0.0 },
  { label: 'Zone 1 (0.04g) - Low', agR: 0.04 },
  { label: 'Zone 2 (0.10g) - Moderate', agR: 0.10 },
  { label: 'Zone 3 (0.15g) - Medium', agR: 0.15 },
  { label: 'Zone 4 (0.25g) - High', agR: 0.25 },
  { label: 'Zone 5 (0.35g) - Very high', agR: 0.35 },
];

export const SOIL_PARAMETERS: Record<SoilType, { S: number; TB: number; TC: number; TD: number; description: string }> = {
  A: { S: 1.0, TB: 0.15, TC: 0.4, TD: 2.0, description: 'Rock or rock-like' },
  B: { S: 1.2, TB: 0.15, TC: 0.5, TD: 2.0, description: 'Very dense sand/gravel, stiff clay' },
  C: { S: 1.15, TB: 0.20, TC: 0.6, TD: 2.0, description: 'Dense/medium-dense sand, stiff clay' },
  D: { S: 1.35, TB: 0.20, TC: 0.8, TD: 2.0, description: 'Loose-to-medium sand, soft clay' },
  E: { S: 1.40, TB: 0.15, TC: 0.5, TD: 2.0, description: 'Surface alluvium over stiff soil' },
};

export const IMPORTANCE_FACTORS: Record<number, { factor: number; description: string }> = {
  1: { factor: 0.8, description: 'Minor importance' },
  2: { factor: 1.0, description: 'Ordinary buildings' },
  3: { factor: 1.2, description: 'Important buildings' },
  4: { factor: 1.4, description: 'Essential facilities' },
};
