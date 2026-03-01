import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CostParameters, CostBreakdown } from '@/types/cost'
import { DEFAULT_COST_PARAMETERS } from '@/data/cost-defaults'

interface CostState {
  parameters: CostParameters
  breakdown: CostBreakdown | null
  isCalculating: boolean

  setParameters: (updates: Partial<CostParameters>) => void
  setBreakdown: (breakdown: CostBreakdown) => void
  setCalculating: (v: boolean) => void
  resetParameters: () => void
  clearBreakdown: () => void
}

export const useCostStore = create<CostState>()(
  persist(
    (set) => ({
      parameters: DEFAULT_COST_PARAMETERS,
      breakdown: null,
      isCalculating: false,

      setParameters: (updates) =>
        set((s) => ({ parameters: { ...s.parameters, ...updates } })),
      setBreakdown: (breakdown) => set({ breakdown, isCalculating: false }),
      setCalculating: (isCalculating) => set({ isCalculating }),
      resetParameters: () => set({ parameters: DEFAULT_COST_PARAMETERS }),
      clearBreakdown: () => set({ breakdown: null }),
    }),
    { name: 'mt-cost', partialize: (s) => ({ parameters: s.parameters }) }
  )
)
