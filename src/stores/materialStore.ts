import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Manufacturer, CLTPanel, GlulamSection } from '@/types/materials'
import { STORA_ENSO } from '@/data/manufacturers/stora-enso'
import { BINDERHOLZ } from '@/data/manufacturers/binderholz'

interface MaterialState {
  manufacturers: Manufacturer[]
  activeManufacturerId: string

  getActiveManufacturer: () => Manufacturer
  getCLTPanels: () => CLTPanel[]
  getGlulamSections: () => GlulamSection[]
  selectManufacturer: (id: string) => void
  addCLTPanel: (panel: CLTPanel) => void
  updateCLTPanel: (id: string, updates: Partial<CLTPanel>) => void
  removeCLTPanel: (id: string) => void
  addGlulamSection: (section: GlulamSection) => void
  updateGlulamSection: (id: string, updates: Partial<GlulamSection>) => void
  removeGlulamSection: (id: string) => void
}

export const useMaterialStore = create<MaterialState>()(
  persist(
    (set, get) => ({
      manufacturers: [STORA_ENSO, BINDERHOLZ],
      activeManufacturerId: 'stora-enso',

      getActiveManufacturer: () => {
        const state = get()
        return state.manufacturers.find((m) => m.id === state.activeManufacturerId) ?? state.manufacturers[0]
      },
      getCLTPanels: () => get().getActiveManufacturer().cltPanels,
      getGlulamSections: () => get().getActiveManufacturer().glulamSections,

      selectManufacturer: (id) => set({ activeManufacturerId: id }),

      addCLTPanel: (panel) =>
        set((s) => ({
          manufacturers: s.manufacturers.map((m) =>
            m.id === s.activeManufacturerId
              ? { ...m, cltPanels: [...m.cltPanels, panel] }
              : m
          ),
        })),
      updateCLTPanel: (id, updates) =>
        set((s) => ({
          manufacturers: s.manufacturers.map((m) =>
            m.id === s.activeManufacturerId
              ? { ...m, cltPanels: m.cltPanels.map((p) => (p.id === id ? { ...p, ...updates } : p)) }
              : m
          ),
        })),
      removeCLTPanel: (id) =>
        set((s) => ({
          manufacturers: s.manufacturers.map((m) =>
            m.id === s.activeManufacturerId
              ? { ...m, cltPanels: m.cltPanels.filter((p) => p.id !== id) }
              : m
          ),
        })),
      addGlulamSection: (section) =>
        set((s) => ({
          manufacturers: s.manufacturers.map((m) =>
            m.id === s.activeManufacturerId
              ? { ...m, glulamSections: [...m.glulamSections, section] }
              : m
          ),
        })),
      updateGlulamSection: (id, updates) =>
        set((s) => ({
          manufacturers: s.manufacturers.map((m) =>
            m.id === s.activeManufacturerId
              ? { ...m, glulamSections: m.glulamSections.map((sec) => (sec.id === id ? { ...sec, ...updates } : sec)) }
              : m
          ),
        })),
      removeGlulamSection: (id) =>
        set((s) => ({
          manufacturers: s.manufacturers.map((m) =>
            m.id === s.activeManufacturerId
              ? { ...m, glulamSections: m.glulamSections.filter((sec) => sec.id !== id) }
              : m
          ),
        })),
    }),
    { name: 'mt-materials' }
  )
)
