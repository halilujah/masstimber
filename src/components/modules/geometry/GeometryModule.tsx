import { useState } from 'react'
import { useGeometryStore } from '@/stores/geometryStore'
import { PlanCanvas } from '@/components/editor2d/PlanCanvas'
import { BuildingScene } from '@/components/viewer3d/BuildingScene'
import { MousePointer, Pen, Square, Trash2, Copy } from 'lucide-react'

export default function GeometryModule() {
  const {
    stories, walls, roof, activeStoryIndex, drawingMode, selectedWallId,
    setStoryCount, setStoryHeight, setActiveStory, setRoof, setDrawingMode, resetGeometry, copyWallsFromBelow, updateWall
  } = useGeometryStore()

  const selectedWall = selectedWallId ? walls.find(w => w.id === selectedWallId) : null
  const [viewMode, setViewMode] = useState<'split' | '2d' | '3d'>('split')

  const currentStoryWalls = walls.filter(w => w.storyIndex === activeStoryIndex)
  const belowStoryWalls = activeStoryIndex > 0 ? walls.filter(w => w.storyIndex === activeStoryIndex - 1) : []
  const showCopyHint = activeStoryIndex > 0 && currentStoryWalls.length === 0 && belowStoryWalls.length > 0

  const tools = [
    { mode: 'select' as const, icon: MousePointer, label: 'Select', shortcut: 'S' },
    { mode: 'wall' as const, icon: Pen, label: 'Wall', shortcut: 'W' },
    { mode: 'opening' as const, icon: Square, label: 'Opening', shortcut: '' },
    { mode: 'delete' as const, icon: Trash2, label: 'Delete', shortcut: 'D' },
  ]

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Row 1: Drawing tools + stories + view mode */}
      <div className="flex items-center justify-between px-5 h-10 bg-slate-50 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-1.5">
          {/* Drawing tools */}
          {tools.map(({ mode, icon: Icon, label, shortcut }) => (
            <button
              key={mode}
              onClick={() => setDrawingMode(mode)}
              style={{ paddingLeft: 14, paddingRight: 14, height: 28, borderRadius: 4 }}
              className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                drawingMode === mode
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
              title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}

          <div className="w-px h-4 bg-slate-300 mx-3" />

          {/* Story tabs */}
          <div className="flex items-center gap-1.5">
            {stories.map(story => (
              <button
                key={story.index}
                onClick={() => setActiveStory(story.index)}
                style={{ paddingLeft: 14, paddingRight: 14, height: 28, borderRadius: 4 }}
                className={`text-[11px] font-medium transition-colors ${
                  activeStoryIndex === story.index
                    ? 'bg-white text-slate-800 border border-slate-300 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                }`}
              >
                {story.label}
              </button>
            ))}
          </div>

          {/* Copy from below */}
          {showCopyHint && (
            <>
              <div className="w-px h-4 bg-slate-300 mx-3" />
              <button
                onClick={copyWallsFromBelow}
                className="flex items-center gap-1.5 px-3 h-6 text-[11px] font-medium text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Copy size={11} />
                Copy from below
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 mr-1">
          <span className="text-[10px] text-slate-400 font-mono">
            {walls.length} walls &middot; {currentStoryWalls.length} on story
          </span>

          <div className="w-px h-4 bg-slate-300" />

          {/* View mode */}
          <div className="flex gap-1.5">
            {(['split', '2d', '3d'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{ paddingLeft: 12, paddingRight: 12, height: 28, borderRadius: 4 }}
                className={`text-[10px] font-semibold transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-slate-800 border border-slate-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Building params */}
      <div className="flex items-center gap-4 px-4 h-10 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Stories</span>
            <input
              type="number"
              min={1}
              max={4}
              value={stories.length}
              onChange={e => setStoryCount(parseInt(e.target.value) || 1)}
              className="w-10 h-6 text-center text-xs border border-slate-200 rounded bg-slate-50 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div className="w-px h-5 bg-slate-200" />

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Height</span>
            <input
              type="number"
              min={2400}
              max={5000}
              step={100}
              value={stories[activeStoryIndex]?.height ?? 3000}
              onChange={e => setStoryHeight(activeStoryIndex, parseInt(e.target.value) || 3000)}
              className="w-16 h-6 text-center text-xs border border-slate-200 rounded bg-slate-50 focus:outline-none focus:border-slate-400"
            />
            <span className="text-[10px] text-slate-400">mm</span>
          </div>

          <div className="w-px h-5 bg-slate-200" />

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Roof</span>
            <select
              value={roof.type}
              onChange={e => setRoof({ type: e.target.value as 'flat' | 'mono-pitch' | 'gable' })}
              className="h-6 text-xs border border-slate-200 rounded bg-slate-50 px-1.5 focus:outline-none focus:border-slate-400"
            >
              <option value="flat">Flat</option>
              <option value="mono-pitch">Mono-pitch</option>
              <option value="gable">Gable</option>
            </select>
          </div>

          {roof.type !== 'flat' && (
            <>
              <div className="w-px h-5 bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Pitch</span>
                <input
                  type="number"
                  min={5}
                  max={45}
                  step={5}
                  value={roof.pitch}
                  onChange={e => setRoof({ pitch: parseInt(e.target.value) || 15 })}
                  className="w-12 h-6 text-center text-xs border border-slate-200 rounded bg-slate-50 focus:outline-none focus:border-slate-400"
                />
                <span className="text-[10px] text-slate-400">deg</span>
              </div>
            </>
          )}

          {/* Selected wall properties */}
          {selectedWall && (
            <>
              <div className="w-px h-5 bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-blue-500 uppercase tracking-wide font-semibold">Wall</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Thickness</span>
                <input
                  type="number"
                  min={60}
                  max={300}
                  step={10}
                  value={selectedWall.thickness}
                  onChange={e => updateWall(selectedWall.id, { thickness: parseInt(e.target.value) || 120 })}
                  className="w-14 h-6 text-center text-xs border border-slate-200 rounded bg-slate-50 focus:outline-none focus:border-slate-400"
                />
                <span className="text-[10px] text-slate-400">mm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Material</span>
                <select
                  value={selectedWall.materialType}
                  onChange={e => updateWall(selectedWall.id, { materialType: e.target.value as 'clt' | 'timber-frame' })}
                  className="h-6 text-xs border border-slate-200 rounded bg-slate-50 px-1.5 focus:outline-none focus:border-slate-400"
                >
                  <option value="clt">CLT</option>
                  <option value="timber-frame">Timber Frame</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="ml-auto">
          <button
            onClick={resetGeometry}
            className="px-2 h-6 text-[11px] text-red-500 hover:bg-red-50 transition-colors"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* 2D Editor */}
        {(viewMode === 'split' || viewMode === '2d') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} border-r border-slate-200 bg-white relative`}>
            <PlanCanvas />
          </div>
        )}

        {/* 3D Viewer */}
        {(viewMode === 'split' || viewMode === '3d') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} bg-slate-50`}>
            <BuildingScene />
          </div>
        )}
      </div>
    </div>
  )
}
