import { useMaterialStore } from '@/stores/materialStore'
import { Card } from '@/components/common/Card'
import { Select } from '@/components/common/Select'

export default function LibraryModule() {
  const { manufacturers, activeManufacturerId, selectManufacturer, getActiveManufacturer } = useMaterialStore()
  const mfr = getActiveManufacturer()

  return (
    <div className="flex-1 p-6 overflow-auto bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Manufacturer Library</h2>

        <div className="mb-6 max-w-xs">
          <Select
            label="Active Manufacturer"
            value={activeManufacturerId}
            onChange={selectManufacturer}
            options={manufacturers.map(m => ({ value: m.id, label: `${m.name} (${m.country})` }))}
          />
        </div>

        <div className="grid gap-6">
          <Card padding={false}>
            <div className="p-6 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">CLT Panels ({mfr.cltPanels.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Name</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Layers</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Thickness</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Weight</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Cost/m2</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Moment Cap.</th>
                  </tr>
                </thead>
                <tbody>
                  {mfr.cltPanels.map(p => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium text-slate-700">{p.name}</td>
                      <td className="px-6 py-3 text-right">{p.layup.layers}L</td>
                      <td className="px-6 py-3 text-right">{p.layup.totalThickness} mm</td>
                      <td className="px-6 py-3 text-right">{p.weight} kg/m2</td>
                      <td className="px-6 py-3 text-right">€{p.costPerM2}</td>
                      <td className="px-6 py-3 text-right">{p.moment_capacity} kN.m/m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card padding={false}>
            <div className="p-6 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Glulam Sections ({mfr.glulamSections.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Grade</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Width</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Depth</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Weight</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Cost/m</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500">Moment Cap.</th>
                  </tr>
                </thead>
                <tbody>
                  {mfr.glulamSections.map(s => (
                    <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium text-slate-700">{s.name}</td>
                      <td className="px-6 py-3">{s.grade}</td>
                      <td className="px-6 py-3 text-right">{s.width} mm</td>
                      <td className="px-6 py-3 text-right">{s.depth} mm</td>
                      <td className="px-6 py-3 text-right">{s.weight.toFixed(1)} kg/m</td>
                      <td className="px-6 py-3 text-right">€{s.costPerM.toFixed(1)}</td>
                      <td className="px-6 py-3 text-right">{s.momentCapacity.toFixed(1)} kN.m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
