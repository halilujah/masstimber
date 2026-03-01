import { useEffect, useCallback } from 'react'
import { useGeometryStore } from '@/stores/geometryStore'
import { useLoadStore } from '@/stores/loadStore'
import { useMaterialStore } from '@/stores/materialStore'
import { useStructuralStore } from '@/stores/structuralStore'
import { useProjectStore } from '@/stores/projectStore'
import { Card } from '@/components/common/Card'
import { UtilizationBar } from '@/components/common/UtilizationBar'
import { StatusIndicator } from '@/components/common/StatusIndicator'
import { Badge } from '@/components/common/Badge'
import { checkCLTSlab } from '@/engine/structural/clt-slab-check'
import { checkWall } from '@/engine/structural/wall-check'
import { wallLength, getMaxSpan, computeFootprintArea } from '@/engine/geometry/building-model'
import { getLiveLoadValue } from '@/engine/loads/load-combinations'
import type { StructuralResults } from '@/types/structural'

export default function StructuralModule() {
  const walls = useGeometryStore(s => s.walls)
  const stories = useGeometryStore(s => s.stories)
  const loads = useLoadStore(s => s.loads)
  const manufacturer = useMaterialStore(s => s.getActiveManufacturer())
  const { results, setResults, isCalculating, setCalculating } = useStructuralStore()
  const uiMode = useProjectStore(s => s.uiMode)

  const runAnalysis = useCallback(() => {
    if (walls.length === 0) return
    setCalculating(true)

    const liveLoad = getLiveLoadValue(loads.live.category, loads.live.customValue)
    const deadLoad = loads.dead.additionalPermanent + 2.0 // ~2 kN/m2 self-weight
    const panels = manufacturer.cltPanels
    const midPanel = panels[Math.min(3, panels.length - 1)]

    // Slab checks per story
    const slabResults = stories.filter(s => s.index > 0).map(story => {
      const span = getMaxSpan(walls, 0)
      return checkCLTSlab({
        elementId: `slab-${story.index}`,
        storyIndex: story.index,
        span,
        panel: midPanel,
        deadLoadULS: deadLoad * 1.35,
        liveLoadULS: liveLoad * 1.5,
        deadLoadSLS: deadLoad,
        liveLoadSLS: liveLoad,
        serviceClass: 1,
      })
    })

    // Wall checks
    const wallResults = walls.map(wall => {
      const storyWalls = walls.filter(w => w.storyIndex === wall.storyIndex)
      const totalShearLen = storyWalls.reduce((s, w) => s + wallLength(w), 0)
      const storyShear = 20 * (stories.length - wall.storyIndex) // simplified kN
      const axialLoad = (deadLoad + liveLoad) * computeFootprintArea(walls, 0) / storyWalls.length * (stories.length - wall.storyIndex)

      return checkWall({
        wall,
        storyShear: storyShear * (wallLength(wall) / Math.max(totalShearLen, 1)),
        axialLoad,
        serviceClass: 1,
      })
    })

    const newResults: StructuralResults = {
      slabs: slabResults,
      beams: [],
      columns: [],
      walls: wallResults,
      lateral: null,
      timestamp: Date.now(),
    }

    setResults(newResults)
  }, [walls, stories, loads, manufacturer, setResults, setCalculating])

  useEffect(() => {
    if (walls.length > 0) {
      const t = setTimeout(runAnalysis, 300)
      return () => clearTimeout(t)
    }
  }, [walls, stories, loads, runAnalysis])

  return (
    <div className="flex-1 p-6 overflow-auto bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Structural Validation</h2>
          <button onClick={runAnalysis} style={{ paddingLeft: 16, paddingRight: 16, height: 32, borderRadius: 4 }} className="text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50" disabled={walls.length === 0}>
            {isCalculating ? 'Calculating...' : 'Run Analysis'}
          </button>
        </div>

        {!results && walls.length === 0 && (
          <Card>
            <div className="text-center py-12 text-slate-400">
              <p className="text-lg mb-2">No geometry defined</p>
              <p className="text-sm">Draw walls in the Geometry module first</p>
            </div>
          </Card>
        )}

        {results && (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <h3 className="font-semibold text-slate-800 mb-4">Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-800">{results.slabs.length}</p>
                  <p className="text-xs text-slate-500">Slab Checks</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-800">{results.walls.length}</p>
                  <p className="text-xs text-slate-500">Wall Checks</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-800">{results.beams.length}</p>
                  <p className="text-xs text-slate-500">Beam Checks</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-800">{results.columns.length}</p>
                  <p className="text-xs text-slate-500">Column Checks</p>
                </div>
              </div>
            </Card>

            {/* Slab Results */}
            {results.slabs.length > 0 && (
              <Card padding={false}>
                <div className="p-6 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-800">CLT Slab Checks</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Story</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Span</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Panel</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Bending</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Deflection</th>
                        {uiMode === 'engineer' && <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Vibration</th>}
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.slabs.map(slab => (
                        <tr key={slab.elementId} className="border-b border-slate-100">
                          <td className="px-6 py-3">Floor {slab.storyIndex}</td>
                          <td className="px-6 py-3">{(slab.span / 1000).toFixed(1)} m</td>
                          <td className="px-6 py-3"><Badge>{slab.selectedPanel}</Badge></td>
                          <td className="px-6 py-3 w-40"><UtilizationBar ratio={slab.bending.ratio} size="sm" /></td>
                          <td className="px-6 py-3 w-40"><UtilizationBar ratio={slab.deflection.ratio} size="sm" /></td>
                          {uiMode === 'engineer' && <td className="px-6 py-3 w-40"><UtilizationBar ratio={slab.vibration.ratio} size="sm" /></td>}
                          <td className="px-6 py-3"><StatusIndicator status={slab.bending.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Wall Results */}
            {results.walls.length > 0 && (
              <Card padding={false}>
                <div className="p-6 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-800">Wall Checks</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Wall</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Story</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Shear</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Compression</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.walls.map(w => (
                        <tr key={w.wallId} className="border-b border-slate-100">
                          <td className="px-6 py-3 font-mono text-xs">{w.wallId.slice(0, 8)}</td>
                          <td className="px-6 py-3">{w.storyIndex}</td>
                          <td className="px-6 py-3 w-40"><UtilizationBar ratio={w.inPlaneShear.ratio} size="sm" /></td>
                          <td className="px-6 py-3 w-40"><UtilizationBar ratio={w.compression.ratio} size="sm" /></td>
                          <td className="px-6 py-3"><StatusIndicator status={w.governing === 'shear' ? w.inPlaneShear.status : w.compression.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
