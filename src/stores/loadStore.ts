import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoadDefinition, LoadCombination } from '@/types/loads'

interface LoadState {
  loads: LoadDefinition
  combinations: LoadCombination[]

  setDeadLoad: (additionalPermanent: number) => void
  setLiveLoad: (category: LoadDefinition['live']['category'], customValue?: number) => void
  setWindLoad: (updates: Partial<LoadDefinition['wind']>) => void
  setSeismicLoad: (updates: Partial<LoadDefinition['seismic']>) => void
  setCombinations: (combos: LoadCombination[]) => void
}

export const useLoadStore = create<LoadState>()(
  persist(
    (set) => ({
      loads: {
        dead: { additionalPermanent: 1.5 },
        live: { category: 'A' },
        wind: { basicWindSpeed: 25, terrainCategory: 'II', orography: 1.0 },
        seismic: { enabled: false, agR: 0.1, soilType: 'B', importanceClass: 2, qFactor: 2.0 },
      },
      combinations: [],

      setDeadLoad: (additionalPermanent) =>
        set((s) => ({ loads: { ...s.loads, dead: { additionalPermanent } } })),
      setLiveLoad: (category, customValue) =>
        set((s) => ({ loads: { ...s.loads, live: { category, customValue } } })),
      setWindLoad: (updates) =>
        set((s) => ({ loads: { ...s.loads, wind: { ...s.loads.wind, ...updates } } })),
      setSeismicLoad: (updates) =>
        set((s) => ({ loads: { ...s.loads, seismic: { ...s.loads.seismic, ...updates } } })),
      setCombinations: (combinations) => set({ combinations }),
    }),
    { name: 'mt-loads' }
  )
)
