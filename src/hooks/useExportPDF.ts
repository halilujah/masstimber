import { jsPDF } from 'jspdf'
import { useToastStore } from '@/stores/toastStore'
import { useProjectStore } from '@/stores/projectStore'
import { useGeometryStore } from '@/stores/geometryStore'
import { useStructuralStore } from '@/stores/structuralStore'
import { useCostStore } from '@/stores/costStore'
import { useConnectionStore } from '@/stores/connectionStore'
import { computeFootprintArea, computeTotalHeight, totalWallVolume } from '@/engine/geometry/building-model'

export function useExportPDF() {
  const project = useProjectStore()
  const { walls, stories, roof } = useGeometryStore()
  const results = useStructuralStore(s => s.results)
  const breakdown = useCostStore(s => s.breakdown)
  const connections = useConnectionStore(s => s.summary)

  const addToast = useToastStore(s => s.addToast)

  const exportPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210
    const margin = 20
    const contentWidth = pageWidth - 2 * margin
    let y = margin

    const addHeader = () => {
      doc.setFillColor(139, 111, 71)
      doc.rect(0, 0, pageWidth, 35, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('Mass Timber Suite', margin, 18)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Structural Cost Report', margin, 26)
      doc.setTextColor(0, 0, 0)
      y = 45
    }

    const addFooter = (pageNum: number) => {
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(`Page ${pageNum}`, pageWidth / 2, 290, { align: 'center' })
      doc.text(new Date().toLocaleDateString(), pageWidth - margin, 290, { align: 'right' })
      doc.text('Mass Timber Suite v1.0', margin, 290)
      doc.setTextColor(0, 0, 0)
    }

    const checkNewPage = (needed: number) => {
      if (y + needed > 270) {
        addFooter(doc.getNumberOfPages())
        doc.addPage()
        y = margin
        return true
      }
      return false
    }

    // Page 1: Project Summary
    addHeader()

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Project Summary', margin, y)
    y += 10

    const footprint = computeFootprintArea(walls, 0)
    const totalHeight = computeTotalHeight(stories) / 1000
    const volume = totalWallVolume(walls)
    const gfa = footprint * stories.length

    const summaryRows = [
      ['Project Name', project.name],
      ['Location', project.location],
      ['Stories', String(stories.length)],
      ['Building Height', `${totalHeight.toFixed(1)} m`],
      ['Footprint Area', `${footprint.toFixed(1)} m2`],
      ['Gross Floor Area', `${gfa.toFixed(1)} m2`],
      ['Timber Volume', `${volume.toFixed(2)} m3`],
      ['Roof Type', roof.type],
      ['Total Walls', String(walls.length)],
    ]

    doc.setFontSize(10)
    summaryRows.forEach(([label, value]) => {
      doc.setFont('helvetica', 'normal')
      doc.text(label, margin, y)
      doc.setFont('helvetica', 'bold')
      doc.text(value, margin + 80, y)
      y += 7
    })

    // Structural Results Section
    if (results && (results.slabs.length > 0 || results.walls.length > 0)) {
      y += 10
      checkNewPage(60)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Structural Results', margin, y)
      y += 10

      if (results.slabs.length > 0) {
        doc.setFontSize(11)
        doc.text('CLT Slab Checks', margin, y)
        y += 8

        // Table header
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setFillColor(240, 240, 240)
        doc.rect(margin, y - 4, contentWidth, 7, 'F')
        doc.text('Story', margin + 2, y)
        doc.text('Span (m)', margin + 30, y)
        doc.text('Bending', margin + 65, y)
        doc.text('Deflection', margin + 95, y)
        doc.text('Status', margin + 130, y)
        y += 8

        doc.setFont('helvetica', 'normal')
        results.slabs.forEach(slab => {
          checkNewPage(8)
          doc.text(`Floor ${slab.storyIndex}`, margin + 2, y)
          doc.text(`${(slab.span / 1000).toFixed(1)}`, margin + 30, y)
          doc.text(`${(slab.bending.ratio * 100).toFixed(0)}%`, margin + 65, y)
          doc.text(`${(slab.deflection.ratio * 100).toFixed(0)}%`, margin + 95, y)
          const status = slab.bending.status
          doc.setTextColor(status === 'pass' ? 34 : status === 'warning' ? 245 : 239, status === 'pass' ? 197 : status === 'warning' ? 158 : 68, status === 'pass' ? 94 : status === 'warning' ? 11 : 68)
          doc.text(status.toUpperCase(), margin + 130, y)
          doc.setTextColor(0, 0, 0)
          y += 6
        })
      }

      if (results.walls.length > 0) {
        y += 8
        checkNewPage(40)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text('Wall Checks', margin, y)
        y += 8

        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setFillColor(240, 240, 240)
        doc.rect(margin, y - 4, contentWidth, 7, 'F')
        doc.text('Wall', margin + 2, y)
        doc.text('Shear', margin + 50, y)
        doc.text('Compression', margin + 85, y)
        doc.text('Governing', margin + 130, y)
        y += 8

        doc.setFont('helvetica', 'normal')
        results.walls.forEach(w => {
          checkNewPage(8)
          doc.text(w.wallId.slice(0, 8), margin + 2, y)
          doc.text(`${(w.inPlaneShear.ratio * 100).toFixed(0)}%`, margin + 50, y)
          doc.text(`${(w.compression.ratio * 100).toFixed(0)}%`, margin + 85, y)
          doc.text(w.governing, margin + 130, y)
          y += 6
        })
      }
    }

    // Cost Breakdown
    if (breakdown) {
      checkNewPage(80)
      y += 10
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Cost Breakdown', margin, y)
      y += 10

      // Key figures
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`Total: EUR ${breakdown.totalStructuralCost.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`, margin, y)
      y += 7
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Cost per m2: EUR ${breakdown.costPerM2.toFixed(0)}`, margin, y)
      y += 6
      doc.text(`Cost per m3: EUR ${breakdown.costPerM3.toFixed(0)}`, margin, y)
      y += 10

      // Line items table
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setFillColor(240, 240, 240)
      doc.rect(margin, y - 4, contentWidth, 7, 'F')
      doc.text('Category', margin + 2, y)
      doc.text('Quantity', margin + 70, y)
      doc.text('Unit Cost', margin + 105, y)
      doc.text('Subtotal', margin + 140, y)
      y += 8

      doc.setFont('helvetica', 'normal')
      breakdown.lineItems.forEach(item => {
        checkNewPage(8)
        doc.text(item.category, margin + 2, y)
        doc.text(`${item.quantity.toFixed(2)} ${item.unit}`, margin + 70, y)
        doc.text(`EUR ${item.unitCost.toFixed(0)}`, margin + 105, y)
        doc.text(`EUR ${item.subtotal.toFixed(0)}`, margin + 140, y)
        y += 6
      })

      // Total row
      y += 2
      doc.setFont('helvetica', 'bold')
      doc.text('TOTAL', margin + 2, y)
      doc.text(`EUR ${breakdown.totalStructuralCost.toFixed(0)}`, margin + 140, y)
    }

    // Connection summary
    if (connections) {
      checkNewPage(40)
      y += 10
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Connection Summary', margin, y)
      y += 10

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Angle Brackets: ${connections.totalAngleBrackets}`, margin, y); y += 6
      doc.text(`Hold-downs: ${connections.totalHoldDowns}`, margin, y); y += 6
      doc.text(`Total Screws: ${connections.totalScrews}`, margin, y); y += 6
      doc.text(`Estimated Cost: EUR ${connections.totalCost.toFixed(0)}`, margin, y); y += 6
    }

    addFooter(doc.getNumberOfPages())
    doc.save(`${project.name.replace(/\s+/g, '_')}_Report.pdf`)
    addToast('PDF report exported successfully', 'success')
  }

  return { exportPDF }
}
