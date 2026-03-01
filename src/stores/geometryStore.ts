import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type { WallSegment, Opening, Story, RoofConfig, Point2D } from '@/types/geometry'

interface GeometryState {
  walls: WallSegment[]
  stories: Story[]
  roof: RoofConfig
  activeStoryIndex: number
  selectedWallId: string | null
  drawingMode: 'select' | 'wall' | 'opening' | 'delete'

  addWall: (start: Point2D, end: Point2D) => void
  updateWall: (id: string, updates: Partial<WallSegment>) => void
  removeWall: (id: string) => void
  addOpening: (wallId: string, opening: Omit<Opening, 'id' | 'wallId'>) => void
  removeOpening: (wallId: string, openingId: string) => void
  copyWallsFromBelow: () => void
  setStoryCount: (count: number) => void
  setStoryHeight: (index: number, height: number) => void
  setRoof: (config: Partial<RoofConfig>) => void
  setActiveStory: (index: number) => void
  selectWall: (id: string | null) => void
  setDrawingMode: (mode: GeometryState['drawingMode']) => void
  resetGeometry: () => void
}

const DEFAULT_STORIES: Story[] = [
  { index: 0, height: 3000, label: 'Ground Floor', floorThickness: 0, walls: [] },
  { index: 1, height: 3000, label: '1st Floor', floorThickness: 140, walls: [] },
]

export const useGeometryStore = create<GeometryState>()(
  persist(
    (set, get) => ({
      walls: [],
      stories: DEFAULT_STORIES,
      roof: { type: 'flat', pitch: 0, overhang: 300 },
      activeStoryIndex: 0,
      selectedWallId: null,
      drawingMode: 'select',

      addWall: (start, end) => {
        const state = get()
        const wall: WallSegment = {
          id: uuid(),
          storyIndex: state.activeStoryIndex,
          start,
          end,
          thickness: 120,
          height: state.stories[state.activeStoryIndex].height,
          materialType: 'clt',
          openings: [],
        }
        set((s) => ({ walls: [...s.walls, wall] }))
      },

      updateWall: (id, updates) => {
        set((s) => ({
          walls: s.walls.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        }))
      },

      removeWall: (id) => {
        set((s) => ({
          walls: s.walls.filter((w) => w.id !== id),
          selectedWallId: s.selectedWallId === id ? null : s.selectedWallId,
        }))
      },

      addOpening: (wallId, opening) => {
        const newOpening: Opening = { ...opening, id: uuid(), wallId }
        set((s) => ({
          walls: s.walls.map((w) =>
            w.id === wallId ? { ...w, openings: [...w.openings, newOpening] } : w
          ),
        }))
      },

      removeOpening: (wallId, openingId) => {
        set((s) => ({
          walls: s.walls.map((w) =>
            w.id === wallId
              ? { ...w, openings: w.openings.filter((o) => o.id !== openingId) }
              : w
          ),
        }))
      },

      copyWallsFromBelow: () => {
        const state = get()
        const belowIndex = state.activeStoryIndex - 1
        if (belowIndex < 0) return
        const belowWalls = state.walls.filter(w => w.storyIndex === belowIndex)
        if (belowWalls.length === 0) return
        const newWalls = belowWalls.map(w => ({
          ...w,
          id: uuid(),
          storyIndex: state.activeStoryIndex,
          height: state.stories[state.activeStoryIndex].height,
          openings: [],
        }))
        set((s) => ({ walls: [...s.walls, ...newWalls] }))
      },

      setStoryCount: (count) => {
        const clamped = Math.max(1, Math.min(4, count))
        set((s) => {
          const stories = [...s.stories]
          while (stories.length < clamped) {
            const idx = stories.length
            stories.push({
              index: idx,
              height: 3000,
              label: idx === 0 ? 'Ground Floor' : `${idx}${idx === 1 ? 'st' : idx === 2 ? 'nd' : idx === 3 ? 'rd' : 'th'} Floor`,
              floorThickness: idx === 0 ? 0 : 140,
              walls: [],
            })
          }
          while (stories.length > clamped) {
            stories.pop()
            // Remove walls belonging to removed story
            return {
              stories: stories.map((s, i) => ({ ...s, index: i })),
              walls: s.walls.filter((w) => w.storyIndex < clamped),
              activeStoryIndex: Math.min(s.activeStoryIndex, clamped - 1),
            }
          }
          return { stories: stories.map((s, i) => ({ ...s, index: i })) }
        })
      },

      setStoryHeight: (index, height) => {
        set((s) => ({
          stories: s.stories.map((st) => (st.index === index ? { ...st, height } : st)),
          walls: s.walls.map((w) => (w.storyIndex === index ? { ...w, height } : w)),
        }))
      },

      setRoof: (config) => {
        set((s) => ({ roof: { ...s.roof, ...config } }))
      },

      setActiveStory: (activeStoryIndex) => set({ activeStoryIndex }),
      selectWall: (selectedWallId) => set({ selectedWallId }),
      setDrawingMode: (drawingMode) => set({ drawingMode }),

      resetGeometry: () =>
        set({
          walls: [],
          stories: DEFAULT_STORIES,
          roof: { type: 'flat', pitch: 0, overhang: 300 },
          activeStoryIndex: 0,
          selectedWallId: null,
        }),
    }),
    { name: 'mt-geometry' }
  )
)
