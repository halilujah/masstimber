import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UIMode, ModuleId } from '@/types/project'

interface ProjectState {
  name: string
  description: string
  location: string
  uiMode: UIMode
  activeModule: ModuleId
  selectedManufacturer: string

  setName: (name: string) => void
  setDescription: (desc: string) => void
  setLocation: (loc: string) => void
  setUIMode: (mode: UIMode) => void
  toggleUIMode: () => void
  setActiveModule: (id: ModuleId) => void
  setSelectedManufacturer: (id: string) => void
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      name: 'New Timber Project',
      description: '',
      location: 'Europe',
      uiMode: 'feasibility',
      activeModule: 'dashboard',
      selectedManufacturer: 'stora-enso',

      setName: (name) => set({ name }),
      setDescription: (description) => set({ description }),
      setLocation: (location) => set({ location }),
      setUIMode: (uiMode) => set({ uiMode }),
      toggleUIMode: () => set((s) => ({ uiMode: s.uiMode === 'feasibility' ? 'engineer' : 'feasibility' })),
      setActiveModule: (activeModule) => set({ activeModule }),
      setSelectedManufacturer: (selectedManufacturer) => set({ selectedManufacturer }),
    }),
    { name: 'mt-project' }
  )
)
