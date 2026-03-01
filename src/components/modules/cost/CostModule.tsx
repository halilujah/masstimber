import { useCallback } from 'react'
import { useGeometryStore } from '@/stores/geometryStore'
import { useConnectionStore } from '@/stores/connectionStore'
import { useCostStore } from '@/stores/costStore'
import { useProjectStore } from '@/stores/projectStore'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { totalWallVolume, computeFootprintArea } from '@/engine/geometry/building-model'
import { calculateCosts } from '@/engine/cost/cost-calculator'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

const COLORS = ['#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#10b981', '#6366f1', '#ec4899']

export default function CostModule() {
  const walls = useGeometryStore(s => s.walls)
  const stories = useGeometryStore(s => s.stories)
  const connections = useConnectionStore(s => s.summary)
  const { parameters, setParameters, breakdown, setBreakdown } = useCostStore()
  const uiMode = useProjectStore(s => s.uiMode)

  const runCostCalc = useCallback(() => {
    const cltVolume = totalWallVolume(walls) // simplified
    const gfa = computeFootprintArea(walls, 0) * stories.length
    const result = calculateCosts({
      params: parameters,
      cltVolumeM3: cltVolume,
      cltAreaM2: gfa,
      glulamVolumeM3: cltVolume * 0.15,
      glulamLengthM: gfa * 0.3,
      connections,
      grossFloorAreaM2: gfa,
    })
    setBreakdown(result)
  }, [walls, stories, connections, parameters, setBreakdown])

  const pieData = breakdown?.lineItems.filter(i => i.subtotal > 0).map(i => ({ name: i.category, value: Math.round(i.subtotal) })) ?? []

  return (
    <div className="flex-1 p-6 overflow-auto bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Cost Engine</h2>
          <button onClick={runCostCalc} style={{ paddingLeft: 16, paddingRight: 16, height: 32, borderRadius: 4 }} className="text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50" disabled={walls.length === 0}>
            Calculate Costs
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Parameters */}
          {uiMode === 'engineer' && (
            <Card className="lg:col-span-1">
              <h3 className="font-semibold text-slate-800 mb-4">Cost Parameters</h3>
              <div className="space-y-3">
                <Input label="CLT Cost" type="number" value={parameters.cltCostPerM3} onChange={e => setParameters({ cltCostPerM3: parseFloat(e.target.value) || 0 })} suffix="€/m3" />
                <Input label="Glulam Cost" type="number" value={parameters.glulamCostPerM3} onChange={e => setParameters({ glulamCostPerM3: parseFloat(e.target.value) || 0 })} suffix="€/m3" />
                <Input label="Waste Factor" type="number" value={((parameters.wasteFactor - 1) * 100).toFixed(0)} onChange={e => setParameters({ wasteFactor: 1 + (parseFloat(e.target.value) || 0) / 100 })} suffix="%" />
                <Input label="Installation Factor" type="number" value={((parameters.installationFactor - 1) * 100).toFixed(0)} onChange={e => setParameters({ installationFactor: 1 + (parseFloat(e.target.value) || 0) / 100 })} suffix="%" />
                <Input label="Transport" type="number" value={parameters.transportCostPerM3} onChange={e => setParameters({ transportCostPerM3: parseFloat(e.target.value) || 0 })} suffix="€/m3" />
              </div>
            </Card>
          )}

          {/* Results */}
          <div className={uiMode === 'engineer' ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {breakdown ? (
              <div className="space-y-6">
                {/* Key figures */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="text-center">
                    <p className="text-sm text-slate-500">Total Cost</p>
                    <p className="text-3xl font-bold text-slate-800">€{breakdown.totalStructuralCost.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
                  </Card>
                  <Card className="text-center">
                    <p className="text-sm text-slate-500">Cost per m2</p>
                    <p className="text-3xl font-bold text-green-600">€{breakdown.costPerM2.toFixed(0)}</p>
                  </Card>
                  <Card className="text-center">
                    <p className="text-sm text-slate-500">Cost per m3</p>
                    <p className="text-3xl font-bold text-blue-600">€{breakdown.costPerM3.toFixed(0)}</p>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <h4 className="font-medium text-slate-700 mb-4">Cost Distribution</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                          {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => `€${Number(v).toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                  <Card>
                    <h4 className="font-medium text-slate-700 mb-4">Cost Breakdown</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={pieData} layout="vertical">
                        <XAxis type="number" tickFormatter={v => `€${v.toLocaleString()}`} />
                        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v) => `€${Number(v).toLocaleString()}`} />
                        <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                {/* Line items table */}
                <Card padding={false}>
                  <div className="p-6 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800">Detailed Breakdown</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Category</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Description</th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Quantity</th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Unit Cost</th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {breakdown.lineItems.map((item, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="px-6 py-3 font-medium text-slate-700">{item.category}</td>
                          <td className="px-6 py-3 text-slate-500">{item.description}</td>
                          <td className="px-6 py-3 text-right">{item.quantity.toFixed(2)} {item.unit}</td>
                          <td className="px-6 py-3 text-right">€{item.unitCost.toFixed(2)}</td>
                          <td className="px-6 py-3 text-right font-medium">€{item.subtotal.toFixed(0)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-semibold">
                        <td colSpan={4} className="px-6 py-3 text-right">Total</td>
                        <td className="px-6 py-3 text-right">€{breakdown.totalStructuralCost.toFixed(0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </Card>
              </div>
            ) : (
              <Card>
                <div className="text-center py-12 text-slate-400">
                  {walls.length === 0 ? 'Draw walls in Geometry module first' : 'Click "Calculate Costs" to generate breakdown'}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
