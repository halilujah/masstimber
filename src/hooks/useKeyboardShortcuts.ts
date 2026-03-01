import { useEffect } from 'react'
import { useGeometryStore } from '@/stores/geometryStore'

export function useKeyboardShortcuts() {
  const { drawingMode, setDrawingMode, selectedWallId, removeWall, selectWall } = useGeometryStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      switch (e.key) {
        case 'Escape':
          setDrawingMode('select')
          selectWall(null)
          break
        case 'Delete':
        case 'Backspace':
          if (selectedWallId && drawingMode === 'select') {
            removeWall(selectedWallId)
          }
          break
        case 'w':
          if (!e.ctrlKey && !e.metaKey) setDrawingMode('wall')
          break
        case 's':
          if (!e.ctrlKey && !e.metaKey) setDrawingMode('select')
          break
        case 'd':
          if (!e.ctrlKey && !e.metaKey) setDrawingMode('delete')
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [drawingMode, selectedWallId, setDrawingMode, selectWall, removeWall])
}
