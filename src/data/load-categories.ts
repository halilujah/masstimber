import type { LiveLoadCategory } from '@/types/loads';

export interface LoadCategoryInfo {
  category: LiveLoadCategory;
  description: string;
  qk: number;
  Qk: number;
}

export const LIVE_LOAD_CATEGORIES: LoadCategoryInfo[] = [
  { category: 'A', description: 'Residential areas', qk: 2.0, Qk: 2.0 },
  { category: 'B', description: 'Office areas', qk: 3.0, Qk: 2.5 },
  { category: 'C1', description: 'Assembly - tables', qk: 3.0, Qk: 4.0 },
  { category: 'C2', description: 'Assembly - fixed seats', qk: 4.0, Qk: 4.0 },
  { category: 'C3', description: 'Assembly - no obstacles', qk: 5.0, Qk: 4.0 },
  { category: 'D', description: 'Shopping areas', qk: 5.0, Qk: 4.0 },
  { category: 'E', description: 'Storage areas', qk: 7.5, Qk: 7.0 },
];

export const PSI_FACTORS: Record<LiveLoadCategory, { psi_0: number; psi_1: number; psi_2: number }> = {
  A: { psi_0: 0.7, psi_1: 0.5, psi_2: 0.3 },
  B: { psi_0: 0.7, psi_1: 0.5, psi_2: 0.3 },
  C1: { psi_0: 0.7, psi_1: 0.7, psi_2: 0.6 },
  C2: { psi_0: 0.7, psi_1: 0.7, psi_2: 0.6 },
  C3: { psi_0: 0.7, psi_1: 0.7, psi_2: 0.6 },
  D: { psi_0: 0.7, psi_1: 0.7, psi_2: 0.6 },
  E: { psi_0: 1.0, psi_1: 0.9, psi_2: 0.8 },
};
