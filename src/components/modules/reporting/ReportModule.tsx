import { useGeometryStore } from '@/stores/geometryStore'
import { useStructuralStore } from '@/stores/structuralStore'
import { useCostStore } from '@/stores/costStore'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { FileText, Table } from 'lucide-react'
import { useExportPDF } from '@/hooks/useExportPDF'
import { useExportExcel } from '@/hooks/useExportExcel'

export default function ReportModule() {
  const walls = useGeometryStore(s => s.walls)
  const results = useStructuralStore(s => s.results)
  const breakdown = useCostStore(s => s.breakdown)
  const { exportPDF } = useExportPDF()
  const { exportExcel } = useExportExcel()

  const hasData = walls.length > 0

  return (
    <div className="flex-1 p-6 overflow-auto bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Reports & Export</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-4">
              <FileText size={32} className="text-red-500" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">PDF Report</h3>
            <p className="text-sm text-slate-500 mb-4">Professional report with structural summary and cost breakdown</p>
            <Button onClick={exportPDF} disabled={!hasData}>Generate PDF</Button>
          </Card>

          <Card className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Table size={32} className="text-green-500" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Excel Export</h3>
            <p className="text-sm text-slate-500 mb-4">Detailed quantity tables, load summary, and cost calculations</p>
            <Button onClick={exportExcel} disabled={!hasData}>Generate Excel</Button>
          </Card>
        </div>

        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Report Contents</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Geometry data</span>
              <span className={hasData ? 'text-green-600 font-medium' : 'text-slate-400'}>{hasData ? `${walls.length} walls defined` : 'Not available'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Structural results</span>
              <span className={results ? 'text-green-600 font-medium' : 'text-slate-400'}>{results ? 'Available' : 'Not available'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Cost breakdown</span>
              <span className={breakdown ? 'text-green-600 font-medium' : 'text-slate-400'}>{breakdown ? `€${breakdown.totalStructuralCost.toFixed(0)}` : 'Not available'}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
