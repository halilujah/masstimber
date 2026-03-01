import { useCallback } from 'react'
import { useGeometryStore } from '@/stores/geometryStore'
import { useConnectionStore } from '@/stores/connectionStore'
import { Card } from '@/components/common/Card'
import { estimateWallConnections, summarizeConnections } from '@/engine/connections/connection-estimator'
import { wallLength } from '@/engine/geometry/building-model'

export default function ConnectionModule() {
  const walls = useGeometryStore(s => s.walls)
  const stories = useGeometryStore(s => s.stories)
  const { summary, setSummary } = useConnectionStore()

  const runEstimate = useCallback(() => {
    const estimates = walls.map(wall => {
      const storyWalls = walls.filter(w => w.storyIndex === wall.storyIndex)
      const totalLen = storyWalls.reduce((s, w) => s + wallLength(w), 0)
      return estimateWallConnections({
        wallId: wall.id,
        wallLength: wallLength(wall),
        storyShear: 20 * (stories.length - wall.storyIndex),
        storyHeight: wall.height,
        axialLoad: 30 * (stories.length - wall.storyIndex),
        totalShearWallLength: totalLen,
      })
    })
    setSummary(summarizeConnections(estimates))
  }, [walls, stories, setSummary])

  return (
    <div className="flex-1 p-6 overflow-auto bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Connection Estimation</h2>
          <button onClick={runEstimate} style={{ paddingLeft: 16, paddingRight: 16, height: 32, borderRadius: 4 }} className="text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50" disabled={walls.length === 0}>
            Estimate Connections
          </button>
        </div>

        {summary && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><p className="text-xs text-slate-500">Angle Brackets</p><p className="text-2xl font-bold text-slate-800">{summary.totalAngleBrackets}</p></Card>
              <Card><p className="text-xs text-slate-500">Hold-downs</p><p className="text-2xl font-bold text-slate-800">{summary.totalHoldDowns}</p></Card>
              <Card><p className="text-xs text-slate-500">Total Screws</p><p className="text-2xl font-bold text-slate-800">{summary.totalScrews.toLocaleString()}</p></Card>
              <Card><p className="text-xs text-slate-500">Est. Cost</p><p className="text-2xl font-bold text-green-600">€{summary.totalCost.toFixed(0)}</p></Card>
            </div>
            <Card padding={false}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Wall</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Shear</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Brackets</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Hold-downs</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Screws</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.details.map(d => (
                      <tr key={d.elementId} className="border-b border-slate-100">
                        <td className="px-6 py-3 font-mono text-xs">{d.elementId.slice(0, 8)}</td>
                        <td className="px-6 py-3 text-right">{d.shearDemand.toFixed(1)} kN</td>
                        <td className="px-6 py-3 text-right">{d.angleBrackets}</td>
                        <td className="px-6 py-3 text-right">{d.holdDowns}</td>
                        <td className="px-6 py-3 text-right">{d.screwCount}</td>
                        <td className="px-6 py-3 text-right">€{d.estimatedCost.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {!summary && (
          <Card>
            <div className="text-center py-12 text-slate-400">
              {walls.length === 0 ? 'Draw walls in Geometry module first' : 'Click "Estimate Connections" to calculate'}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
