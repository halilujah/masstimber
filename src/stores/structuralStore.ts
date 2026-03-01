import { create } from 'zustand'
import type { StructuralResults } from '@/types/structural'

interface StructuralState {
  results: StructuralResults | null
  isCalculating: boolean

  setResults: (results: StructuralResults) => void
  setCalculating: (v: boolean) => void
  clearResults: () => void
}

export const useStructuralStore = create<StructuralState>()((set) => ({
  results: null,
  isCalculating: false,

  setResults: (results) => set({ results, isCalculating: false }),
  setCalculating: (isCalculating) => set({ isCalculating }),
  clearResults: () => set({ results: null }),
}))
