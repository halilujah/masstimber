import { useProjectStore } from '@/stores/projectStore'
import { useGeometryStore } from '@/stores/geometryStore'
import { useStructuralStore } from '@/stores/structuralStore'
import { useCostStore } from '@/stores/costStore'
import { Card } from '@/components/common/Card'
import { Building2, Layers, TrendingUp, DollarSign, AlertTriangle, CheckCircle, type LucideIcon } from 'lucide-react'
import { computeFootprintArea, computeTotalHeight, totalWallVolume } from '@/engine/geometry/building-model'

function MetricCard({ icon: Icon, label, value, unit, color }: { icon: LucideIcon; label: string; value: string; unit: string; color: string }) {
  return (
    <Card className="flex items-start gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value} <span className="text-sm font-normal text-slate-400">{unit}</span></p>
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const { name, uiMode } = useProjectStore()
  const { walls, stories } = useGeometryStore()
  const results = useStructuralStore(s => s.results)
  const breakdown = useCostStore(s => s.breakdown)

  const footprint = computeFootprintArea(walls, 0)
  const totalHeight = computeTotalHeight(stories) / 1000
  const volume = totalWallVolume(walls)
  const gfa = footprint * stories.length

  const hasGeometry = walls.length > 0
  const allPass = results?.slabs.every(s => s.bending.status !== 'fail') ?? false

  return (
    <div className="flex-1 p-6 overflow-auto bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{name}</h2>
            <p className="text-sm text-slate-500 mt-1">Project Dashboard</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
            {uiMode === 'engineer' ? 'Engineer Mode' : 'Feasibility Mode'}
          </span>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard icon={Building2} label="Gross Floor Area" value={gfa.toFixed(0)} unit="m2" color="bg-blue-500" />
          <MetricCard icon={Layers} label="Stories" value={String(stories.length)} unit={`(${totalHeight.toFixed(1)}m)`} color="bg-indigo-500" />
          <MetricCard icon={TrendingUp} label="Timber Volume" value={volume.toFixed(1)} unit="m3" color="bg-amber-500" />
          <MetricCard icon={DollarSign} label="Est. Cost/m2" value={breakdown ? `€${breakdown.costPerM2.toFixed(0)}` : '—'} unit={breakdown ? '/m2' : ''} color="bg-green-500" />
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card>
            <h3 className="font-semibold text-slate-800 mb-4">Building Status</h3>
            {hasGeometry ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Walls defined</span>
                  <span className="text-sm font-medium text-slate-800">{walls.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Footprint area</span>
                  <span className="text-sm font-medium text-slate-800">{footprint.toFixed(1)} m2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Building height</span>
                  <span className="text-sm font-medium text-slate-800">{totalHeight.toFixed(1)} m</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Building2 size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No geometry defined yet</p>
                <p className="text-xs mt-1">Go to Geometry module to start drawing walls</p>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-800 mb-4">Structural Status</h3>
            {results ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {allPass ? <CheckCircle size={16} className="text-green-500" /> : <AlertTriangle size={16} className="text-amber-500" />}
                  <span className="text-sm text-slate-600">{allPass ? 'All checks passing' : 'Some warnings detected'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Slab checks</span>
                  <span className="text-sm font-medium">{results.slabs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Wall checks</span>
                  <span className="text-sm font-medium">{results.walls.length}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <AlertTriangle size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No analysis run yet</p>
                <p className="text-xs mt-1">Define geometry and loads first</p>
              </div>
            )}
          </Card>
        </div>

        {/* Cost Summary (Feasibility mode emphasis) */}
        {uiMode === 'feasibility' && breakdown && (
          <Card>
            <div className="text-center py-6">
              <p className="text-sm text-slate-500 mb-2">Estimated Structural Cost</p>
              <p className="text-5xl font-bold text-green-600">€{breakdown.costPerM2.toFixed(0)}<span className="text-xl font-normal text-slate-400"> /m2</span></p>
              <p className="text-sm text-slate-400 mt-2">Total: €{breakdown.totalStructuralCost.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
