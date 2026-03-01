import * as XLSX from 'xlsx'
import { useToastStore } from '@/stores/toastStore'
import { useProjectStore } from '@/stores/projectStore'
import { useGeometryStore } from '@/stores/geometryStore'
import { useLoadStore } from '@/stores/loadStore'
import { useStructuralStore } from '@/stores/structuralStore'
import { useCostStore } from '@/stores/costStore'
import { useConnectionStore } from '@/stores/connectionStore'
import { computeFootprintArea, computeTotalHeight, totalWallVolume, wallLength } from '@/engine/geometry/building-model'

export function useExportExcel() {
  const project = useProjectStore()
  const { walls, stories, roof } = useGeometryStore()
  const loads = useLoadStore(s => s.loads)
  const combinations = useLoadStore(s => s.combinations)
  const results = useStructuralStore(s => s.results)
  const breakdown = useCostStore(s => s.breakdown)
  const connections = useConnectionStore(s => s.summary)

  const addToast = useToastStore(s => s.addToast)

  const exportExcel = () => {
    const wb = XLSX.utils.book_new()

    // Sheet 1: Project Info
    const projectData = [
      ['Mass Timber Suite - Project Report'],
      [''],
      ['Project Name', project.name],
      ['Location', project.location],
      ['Date', new Date().toLocaleDateString()],
      ['Mode', project.uiMode],
      [''],
      ['Building Summary'],
      ['Stories', stories.length],
      ['Building Height (m)', computeTotalHeight(stories) / 1000],
      ['Footprint Area (m2)', computeFootprintArea(walls, 0)],
      ['Gross Floor Area (m2)', computeFootprintArea(walls, 0) * stories.length],
      ['Timber Volume (m3)', totalWallVolume(walls)],
      ['Roof Type', roof.type],
      ['Roof Pitch (deg)', roof.pitch],
      ['Total Walls', walls.length],
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(projectData)
    ws1['!cols'] = [{ wch: 25 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, ws1, 'Project Info')

    // Sheet 2: Geometry
    const geoHeader = ['Wall ID', 'Story', 'Length (m)', 'Height (m)', 'Thickness (mm)', 'Material', 'Openings']
    const geoData = walls.map(w => [
      w.id.slice(0, 8),
      w.storyIndex,
      (wallLength(w) / 1000).toFixed(2),
      (w.height / 1000).toFixed(2),
      w.thickness,
      w.materialType,
      w.openings.length,
    ])
    const ws2 = XLSX.utils.aoa_to_sheet([geoHeader, ...geoData])
    ws2['!cols'] = [{ wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 10 }]
    XLSX.utils.book_append_sheet(wb, ws2, 'Geometry')

    // Sheet 3: Loads
    const loadData = [
      ['Load Definition'],
      [''],
      ['Dead Load'],
      ['Additional Permanent (kN/m2)', loads.dead.additionalPermanent],
      [''],
      ['Live Load'],
      ['Category', loads.live.category],
      ['Custom Value (kN/m2)', loads.live.customValue ?? 'N/A'],
      [''],
      ['Wind Load'],
      ['Basic Wind Speed (m/s)', loads.wind.basicWindSpeed],
      ['Terrain Category', loads.wind.terrainCategory],
      ['Orography Factor', loads.wind.orography],
      [''],
      ['Seismic Load'],
      ['Enabled', loads.seismic.enabled ? 'Yes' : 'No'],
      ['Peak Ground Acceleration (g)', loads.seismic.agR],
      ['Soil Type', loads.seismic.soilType],
      ['Importance Class', loads.seismic.importanceClass],
      ['Behavior Factor (q)', loads.seismic.qFactor],
    ]
    if (combinations.length > 0) {
      loadData.push([''], ['Load Combinations'])
      loadData.push(['Name', 'Type', 'Dead', 'Live', 'Wind', 'Seismic', 'Vertical (kN/m2)'])
      combinations.forEach(c => {
        loadData.push([
          c.name, c.type,
          c.factors.dead, c.factors.live, c.factors.wind, c.factors.seismic,
          c.resultant.verticalLoad.toFixed(2),
        ] as any)
      })
    }
    const ws3 = XLSX.utils.aoa_to_sheet(loadData)
    ws3['!cols'] = [{ wch: 30 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(wb, ws3, 'Loads')

    // Sheet 4: Structural Results
    if (results) {
      const structData: any[][] = [['Structural Validation Results'], ['']]

      if (results.slabs.length > 0) {
        structData.push(['CLT Slab Checks'])
        structData.push(['Story', 'Span (m)', 'Panel', 'Bending %', 'Deflection %', 'Vibration %', 'Status'])
        results.slabs.forEach(s => {
          structData.push([
            `Floor ${s.storyIndex}`,
            (s.span / 1000).toFixed(1),
            s.selectedPanel,
            (s.bending.ratio * 100).toFixed(1),
            (s.deflection.ratio * 100).toFixed(1),
            (s.vibration.ratio * 100).toFixed(1),
            s.bending.status,
          ])
        })
        structData.push([''])
      }

      if (results.walls.length > 0) {
        structData.push(['Wall Checks'])
        structData.push(['Wall ID', 'Story', 'Shear %', 'Compression %', 'Governing'])
        results.walls.forEach(w => {
          structData.push([
            w.wallId.slice(0, 8),
            w.storyIndex,
            (w.inPlaneShear.ratio * 100).toFixed(1),
            (w.compression.ratio * 100).toFixed(1),
            w.governing,
          ])
        })
      }

      const ws4 = XLSX.utils.aoa_to_sheet(structData)
      ws4['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 10 }]
      XLSX.utils.book_append_sheet(wb, ws4, 'Structural')
    }

    // Sheet 5: Connections
    if (connections) {
      const connHeader = ['Wall ID', 'Location', 'Shear (kN)', 'Brackets', 'Hold-downs', 'Screws', 'Cost (EUR)']
      const connData = connections.details.map(d => [
        d.elementId.slice(0, 8),
        d.location,
        d.shearDemand.toFixed(1),
        d.angleBrackets,
        d.holdDowns,
        d.screwCount,
        d.estimatedCost.toFixed(0),
      ])
      connData.push(['', '', 'TOTAL', connections.totalAngleBrackets, connections.totalHoldDowns, connections.totalScrews, connections.totalCost.toFixed(0)])
      const ws5 = XLSX.utils.aoa_to_sheet([connHeader, ...connData])
      ws5['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 12 }]
      XLSX.utils.book_append_sheet(wb, ws5, 'Connections')
    }

    // Sheet 6: Cost Breakdown
    if (breakdown) {
      const costData: any[][] = [
        ['Cost Breakdown'],
        [''],
        ['Total Structural Cost (EUR)', breakdown.totalStructuralCost.toFixed(0)],
        ['Cost per m2 (EUR)', breakdown.costPerM2.toFixed(0)],
        ['Cost per m3 (EUR)', breakdown.costPerM3.toFixed(0)],
        [''],
        ['Detailed Line Items'],
        ['Category', 'Description', 'Quantity', 'Unit', 'Unit Cost (EUR)', 'Subtotal (EUR)'],
      ]
      breakdown.lineItems.forEach(item => {
        costData.push([
          item.category, item.description,
          item.quantity.toFixed(2), item.unit,
          item.unitCost.toFixed(2), item.subtotal.toFixed(0),
        ])
      })
      costData.push(['', '', '', '', 'TOTAL', breakdown.totalStructuralCost.toFixed(0)])

      const ws6 = XLSX.utils.aoa_to_sheet(costData)
      ws6['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 12 }, { wch: 8 }, { wch: 15 }, { wch: 15 }]
      XLSX.utils.book_append_sheet(wb, ws6, 'Cost Breakdown')
    }

    XLSX.writeFile(wb, `${project.name.replace(/\s+/g, '_')}_Report.xlsx`)
    addToast('Excel report exported successfully', 'success')
  }

  return { exportExcel }
}
