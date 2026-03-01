import { create } from 'zustand'
import type { OptimizationOutput, RankingCriteria } from '@/types/optimization'

interface OptimizationState {
  output: OptimizationOutput | null
  rankingCriteria: RankingCriteria
  isRunning: boolean

  setOutput: (output: OptimizationOutput) => void
  setRankingCriteria: (criteria: RankingCriteria) => void
  setRunning: (v: boolean) => void
  clearOutput: () => void
}

export const useOptimizationStore = create<OptimizationState>()((set) => ({
  output: null,
  rankingCriteria: 'min-cost',
  isRunning: false,

  setOutput: (output) => set({ output, isRunning: false }),
  setRankingCriteria: (rankingCriteria) => set({ rankingCriteria }),
  setRunning: (isRunning) => set({ isRunning }),
  clearOutput: () => set({ output: null }),
}))
