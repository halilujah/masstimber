import { create } from 'zustand'
import type { ConnectionSummary } from '@/types/connections'

interface ConnectionState {
  summary: ConnectionSummary | null
  isCalculating: boolean

  setSummary: (summary: ConnectionSummary) => void
  setCalculating: (v: boolean) => void
  clearSummary: () => void
}

export const useConnectionStore = create<ConnectionState>()((set) => ({
  summary: null,
  isCalculating: false,

  setSummary: (summary) => set({ summary, isCalculating: false }),
  setCalculating: (isCalculating) => set({ isCalculating }),
  clearSummary: () => set({ summary: null }),
}))
