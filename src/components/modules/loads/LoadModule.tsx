import { useState } from 'react'
import { useLoadStore } from '@/stores/loadStore'
import { useGeometryStore } from '@/stores/geometryStore'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Tabs } from '@/components/common/Tabs'
import { Badge } from '@/components/common/Badge'
import { useProjectStore } from '@/stores/projectStore'
import { LIVE_LOAD_CATEGORIES } from '@/data/load-categories'
import { WIND_SPEED_OPTIONS, TERRAIN_DESCRIPTIONS } from '@/data/wind-zones'
import { SEISMIC_ZONE_OPTIONS, SOIL_PARAMETERS } from '@/data/seismic-zones'
import { generateCombinations } from '@/engine/loads/load-combinations'
import type { LiveLoadCategory, TerrainCategory, SoilType } from '@/types/loads'

const tabs = [
  { id: 'dead', label: 'Dead Load' },
  { id: 'live', label: 'Live Load' },
  { id: 'wind', label: 'Wind' },
  { id: 'seismic', label: 'Seismic' },
  { id: 'combinations', label: 'Combinations' },
]

export default function LoadModule() {
  const [activeTab, setActiveTab] = useState('dead')
  const { loads, setDeadLoad, setLiveLoad, setWindLoad, setSeismicLoad, setCombinations } = useLoadStore()
  const walls = useGeometryStore(s => s.walls)
  const uiMode = useProjectStore(s => s.uiMode)

  const handleGenerateCombinations = () => {
    const selfWeight = walls.length > 0 ? 2.5 : 2.0 // approximate kN/m2
    const combos = generateCombinations(loads, selfWeight)
    setCombinations(combos)
  }

  return (
    <div className="flex-1 p-6 overflow-auto bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Load Definition</h2>
          <button onClick={handleGenerateCombinations} style={{ paddingLeft: 16, paddingRight: 16, height: 32, borderRadius: 4 }} className="text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors">
            Generate Combinations
          </button>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

        {activeTab === 'dead' && (
          <Card>
            <h3 className="font-semibold text-slate-800 mb-4">Dead Load (Permanent)</h3>
            <p className="text-sm text-slate-500 mb-4">Self-weight is calculated automatically from element sizes. Specify additional permanent loads below.</p>
            <div className="max-w-xs">
              <Input
                label="Additional Permanent Load"
                type="number"
                value={loads.dead.additionalPermanent}
                onChange={e => setDeadLoad(parseFloat(e.target.value) || 0)}
                suffix="kN/m2"
                step="0.1"
              />
              <p className="text-xs text-slate-400 mt-2">Includes finishes, MEP, ceilings, etc.</p>
            </div>
          </Card>
        )}

        {activeTab === 'live' && (
          <Card>
            <h3 className="font-semibold text-slate-800 mb-4">Live Load (EN 1991-1-1)</h3>
            <div className="max-w-md space-y-4">
              <Select
                label="Load Category"
                value={loads.live.category}
                onChange={v => setLiveLoad(v as LiveLoadCategory)}
                options={LIVE_LOAD_CATEGORIES.map(c => ({
                  value: c.category,
                  label: `Cat. ${c.category} - ${c.description} (${c.qk} kN/m2)`,
                }))}
              />
              {uiMode === 'engineer' && (
                <Input
                  label="Custom Override Value"
                  type="number"
                  value={loads.live.customValue ?? ''}
                  onChange={e => setLiveLoad(loads.live.category, e.target.value ? parseFloat(e.target.value) : undefined)}
                  suffix="kN/m2"
                  step="0.5"
                />
              )}
            </div>
          </Card>
        )}

        {activeTab === 'wind' && (
          <Card>
            <h3 className="font-semibold text-slate-800 mb-4">Wind Load (EN 1991-1-4 Simplified)</h3>
            <div className="max-w-md space-y-4">
              <Select
                label="Basic Wind Speed (vb,0)"
                value={String(loads.wind.basicWindSpeed)}
                onChange={v => setWindLoad({ basicWindSpeed: parseFloat(v) })}
                options={WIND_SPEED_OPTIONS.map(w => ({ value: String(w.vb0), label: w.label }))}
              />
              <Select
                label="Terrain Category"
                value={loads.wind.terrainCategory}
                onChange={v => setWindLoad({ terrainCategory: v as TerrainCategory })}
                options={Object.entries(TERRAIN_DESCRIPTIONS).map(([k, v]) => ({ value: k, label: `${k} - ${v}` }))}
              />
              {uiMode === 'engineer' && (
                <Input
                  label="Orography Factor (co)"
                  type="number"
                  value={loads.wind.orography}
                  onChange={e => setWindLoad({ orography: parseFloat(e.target.value) || 1.0 })}
                  step="0.1"
                />
              )}
            </div>
          </Card>
        )}

        {activeTab === 'seismic' && (
          <Card>
            <h3 className="font-semibold text-slate-800 mb-4">Seismic Load (EN 1998-1 ELF)</h3>
            <div className="max-w-md space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={loads.seismic.enabled}
                  onChange={e => setSeismicLoad({ enabled: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">Enable seismic analysis</span>
              </label>
              {loads.seismic.enabled && (
                <>
                  <Select
                    label="Seismic Zone"
                    value={String(loads.seismic.agR)}
                    onChange={v => setSeismicLoad({ agR: parseFloat(v) })}
                    options={SEISMIC_ZONE_OPTIONS.map(z => ({ value: String(z.agR), label: z.label }))}
                  />
                  <Select
                    label="Soil Type"
                    value={loads.seismic.soilType}
                    onChange={v => setSeismicLoad({ soilType: v as SoilType })}
                    options={Object.entries(SOIL_PARAMETERS).map(([k, v]) => ({ value: k, label: `${k} - ${v.description}` }))}
                  />
                  {uiMode === 'engineer' && (
                    <Input
                      label="Behavior Factor (q)"
                      type="number"
                      value={loads.seismic.qFactor}
                      onChange={e => setSeismicLoad({ qFactor: parseFloat(e.target.value) || 2.0 })}
                      step="0.5"
                    />
                  )}
                </>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'combinations' && (
          <Card padding={false}>
            <div className="p-6 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Load Combinations (EN 1990)</h3>
              <p className="text-sm text-slate-500 mt-1">Auto-generated from load inputs</p>
            </div>
            {useLoadStore.getState().combinations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Combination</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Type</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Dead</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Live</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Wind</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Seismic</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Vertical</th>
                    </tr>
                  </thead>
                  <tbody>
                    {useLoadStore.getState().combinations.map(combo => (
                      <tr key={combo.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-3 font-medium text-slate-700">{combo.name}</td>
                        <td className="px-6 py-3"><Badge variant={combo.type === 'ULS' ? 'danger' : 'info'}>{combo.type}</Badge></td>
                        <td className="px-6 py-3 text-right font-mono">{combo.factors.dead.toFixed(2)}</td>
                        <td className="px-6 py-3 text-right font-mono">{combo.factors.live.toFixed(2)}</td>
                        <td className="px-6 py-3 text-right font-mono">{combo.factors.wind.toFixed(2)}</td>
                        <td className="px-6 py-3 text-right font-mono">{combo.factors.seismic.toFixed(2)}</td>
                        <td className="px-6 py-3 text-right font-mono font-medium">{combo.resultant.verticalLoad.toFixed(2)} kN/m2</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">
                Click "Generate Combinations" to compute load combinations
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
