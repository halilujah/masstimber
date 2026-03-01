import type { CLTPanel, GlulamSection } from './materials';

export type RankingCriteria = 'min-thickness' | 'min-cost' | 'min-weight';

export interface CLTOptimizationResult {
  panelId: string;
  panel: CLTPanel;
  bendingUtil: number;
  deflectionUtil: number;
  governingUtil: number;
  passes: boolean;
  rank: Record<RankingCriteria, number>;
}

export interface GlulamOptimizationResult {
  sectionId: string;
  section: GlulamSection;
  bendingUtil: number;
  shearUtil: number;
  deflectionUtil: number;
  governingUtil: number;
  passes: boolean;
  rank: Record<RankingCriteria, number>;
}

export interface OptimizationOutput {
  clt: {
    allResults: CLTOptimizationResult[];
    recommended: Record<RankingCriteria, CLTOptimizationResult | null>;
  };
  glulam: {
    allResults: GlulamOptimizationResult[];
    recommended: Record<RankingCriteria, GlulamOptimizationResult | null>;
  };
}
