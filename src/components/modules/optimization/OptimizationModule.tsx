import { useState, useCallback } from 'react'
import { useGeometryStore } from '@/stores/geometryStore'
import { useLoadStore } from '@/stores/loadStore'
import { useMaterialStore } from '@/stores/materialStore'
import { useOptimizationStore } from '@/stores/optimizationStore'
import { Card } from '@/components/common/Card'
import { Tabs } from '@/components/common/Tabs'
import { UtilizationBar } from '@/components/common/UtilizationBar'
import { Badge } from '@/components/common/Badge'
import { optimizeCLT } from '@/engine/optimization/clt-optimizer'
import { optimizeGlulam } from '@/engine/optimization/glulam-optimizer'
import { getMaxSpan } from '@/engine/geometry/building-model'
import { getLiveLoadValue } from '@/engine/loads/load-combinations'
import type { RankingCriteria } from '@/types/optimization'

export default function OptimizationModule() {
  const [activeTab, setActiveTab] = useState('clt')
  const walls = useGeometryStore(s => s.walls)
  const loads = useLoadStore(s => s.loads)
  const manufacturer = useMaterialStore(s => s.getActiveManufacturer())
  const { output, setOutput, rankingCriteria, setRankingCriteria } = useOptimizationStore()

  const runOptimization = useCallback(() => {
    const span = getMaxSpan(walls, 0)
    const liveLoad = getLiveLoadValue(loads.live.category, loads.live.customValue)
    const deadLoad = loads.dead.additionalPermanent + 2.0

    const cltResults = optimizeCLT({
      span,
      deadLoadULS: deadLoad * 1.35,
      liveLoadULS: liveLoad * 1.5,
      deadLoadSLS: deadLoad,
      liveLoadSLS: liveLoad,
      availablePanels: manufacturer.cltPanels,
      serviceClass: 1,
    })

    const tributaryWidth = 3000 // 3m assumed
    const glulamResults = optimizeGlulam({
      span,
      totalLoadULS: (deadLoad * 1.35 + liveLoad * 1.5) * tributaryWidth / 1000,
      totalLoadSLS: (deadLoad + liveLoad) * tributaryWidth / 1000,
      availableSections: manufacturer.glulamSections,
      serviceClass: 1,
    })

    const cltPassing = cltResults.filter(r => r.passes)
    const glulamPassing = glulamResults.filter(r => r.passes)

    setOutput({
      clt: {
        allResults: cltResults,
        recommended: {
          'min-thickness': cltPassing.find(r => r.rank['min-thickness'] === 1) ?? null,
          'min-cost': cltPassing.find(r => r.rank['min-cost'] === 1) ?? null,
          'min-weight': cltPassing.find(r => r.rank['min-weight'] === 1) ?? null,
        },
      },
      glulam: {
        allResults: glulamResults,
        recommended: {
          'min-thickness': glulamPassing.find(r => r.rank['min-thickness'] === 1) ?? null,
          'min-cost': glulamPassing.find(r => r.rank['min-cost'] === 1) ?? null,
          'min-weight': glulamPassing.find(r => r.rank['min-weight'] === 1) ?? null,
        },
      },
    })
  }, [walls, loads, manufacturer, setOutput])

  return (
    <div className="flex-1 p-6 overflow-auto bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Optimization Engine</h2>
          <button onClick={runOptimization} style={{ paddingLeft: 16, paddingRight: 16, height: 32, borderRadius: 4 }} className="text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50" disabled={walls.length === 0}>
            Run Optimization
          </button>
        </div>

        {/* Ranking criteria */}
        <div className="flex gap-1.5 mb-4">
          {(['min-thickness', 'min-cost', 'min-weight'] as RankingCriteria[]).map(c => (
            <button
              key={c}
              onClick={() => setRankingCriteria(c)}
              style={{ paddingLeft: 14, paddingRight: 14, height: 28, borderRadius: 4 }}
              className={`text-[11px] font-medium transition-colors ${
                rankingCriteria === c ? 'bg-slate-700 text-white' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
            >
              {c === 'min-thickness' ? 'Min Thickness' : c === 'min-cost' ? 'Min Cost' : 'Min Weight'}
            </button>
          ))}
        </div>

        <Tabs tabs={[{ id: 'clt', label: 'CLT Panels' }, { id: 'glulam', label: 'Glulam Sections' }]} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

        {!output && (
          <Card>
            <div className="text-center py-12 text-slate-400">
              <p>Click "Run Optimization" to find optimal sections</p>
            </div>
          </Card>
        )}

        {output && activeTab === 'clt' && (
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Rank</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Panel</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Thickness</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Cost</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Weight</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Utilization</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {output.clt.allResults
                    .sort((a, b) => (a.rank[rankingCriteria] || 999) - (b.rank[rankingCriteria] || 999))
                    .map(r => (
                    <tr key={r.panelId} className={`border-b border-slate-100 ${!r.passes ? 'opacity-40' : ''}`}>
                      <td className="px-6 py-3">{r.passes ? (r.rank[rankingCriteria] || '—') : '—'}</td>
                      <td className="px-6 py-3 font-medium">{r.panel.name}</td>
                      <td className="px-6 py-3 text-right">{r.panel.layup.totalThickness} mm</td>
                      <td className="px-6 py-3 text-right">€{r.panel.costPerM2}/m2</td>
                      <td className="px-6 py-3 text-right">{r.panel.weight} kg/m2</td>
                      <td className="px-6 py-3 w-40"><UtilizationBar ratio={r.governingUtil} size="sm" /></td>
                      <td className="px-6 py-3"><Badge variant={r.passes ? 'success' : 'danger'}>{r.passes ? 'Pass' : 'Fail'}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {output && activeTab === 'glulam' && (
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Rank</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Section</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Size</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Cost</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Weight</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Utilization</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {output.glulam.allResults
                    .sort((a, b) => (a.rank[rankingCriteria] || 999) - (b.rank[rankingCriteria] || 999))
                    .map(r => (
                    <tr key={r.sectionId} className={`border-b border-slate-100 ${!r.passes ? 'opacity-40' : ''}`}>
                      <td className="px-6 py-3">{r.passes ? (r.rank[rankingCriteria] || '—') : '—'}</td>
                      <td className="px-6 py-3 font-medium">{r.section.name}</td>
                      <td className="px-6 py-3 text-right">{r.section.width}x{r.section.depth}</td>
                      <td className="px-6 py-3 text-right">€{r.section.costPerM.toFixed(1)}/m</td>
                      <td className="px-6 py-3 text-right">{r.section.weight.toFixed(1)} kg/m</td>
                      <td className="px-6 py-3 w-40"><UtilizationBar ratio={r.governingUtil} size="sm" /></td>
                      <td className="px-6 py-3"><Badge variant={r.passes ? 'success' : 'danger'}>{r.passes ? 'Pass' : 'Fail'}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
