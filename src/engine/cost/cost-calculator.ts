import type { CostParameters, CostLineItem, CostBreakdown } from '@/types/cost'
import type { ConnectionSummary } from '@/types/connections'

export interface CostInput {
  params: CostParameters
  cltVolumeM3: number
  cltAreaM2: number
  glulamVolumeM3: number
  glulamLengthM: number
  connections: ConnectionSummary | null
  grossFloorAreaM2: number
}

export function calculateCosts(input: CostInput): CostBreakdown {
  const { params, cltVolumeM3, glulamVolumeM3, connections, grossFloorAreaM2 } = input

  const lineItems: CostLineItem[] = []

  // CLT
  const cltMaterialCost = cltVolumeM3 * params.cltCostPerM3
  lineItems.push({
    category: 'CLT Panels', description: 'CLT wall and slab panels',
    quantity: cltVolumeM3, unit: 'm3', unitCost: params.cltCostPerM3, subtotal: cltMaterialCost,
  })

  // Glulam
  const glulamMaterialCost = glulamVolumeM3 * params.glulamCostPerM3
  lineItems.push({
    category: 'Glulam Beams', description: 'Glulam beams and columns',
    quantity: glulamVolumeM3, unit: 'm3', unitCost: params.glulamCostPerM3, subtotal: glulamMaterialCost,
  })

  const materialCost = cltMaterialCost + glulamMaterialCost

  // Connections
  const connectionCost = connections?.totalCost ?? 0
  if (connections) {
    lineItems.push({
      category: 'Connections', description: 'Angle brackets, hold-downs, and screws',
      quantity: connections.totalAngleBrackets + connections.totalHoldDowns,
      unit: 'pcs', unitCost: connectionCost / Math.max(connections.totalAngleBrackets + connections.totalHoldDowns, 1),
      subtotal: connectionCost,
    })
  }

  // Waste
  const wasteCost = materialCost * (params.wasteFactor - 1)
  lineItems.push({
    category: 'Waste', description: `Material waste (${((params.wasteFactor - 1) * 100).toFixed(0)}%)`,
    quantity: 1, unit: 'ls', unitCost: wasteCost, subtotal: wasteCost,
  })

  // Installation
  const installationCost = materialCost * (params.installationFactor - 1)
  lineItems.push({
    category: 'Installation', description: `Installation labor (${((params.installationFactor - 1) * 100).toFixed(0)}%)`,
    quantity: 1, unit: 'ls', unitCost: installationCost, subtotal: installationCost,
  })

  // Transport
  const totalTimberVolume = cltVolumeM3 + glulamVolumeM3
  const transportCost = totalTimberVolume * params.transportCostPerM3
  lineItems.push({
    category: 'Transport', description: 'Material delivery',
    quantity: totalTimberVolume, unit: 'm3', unitCost: params.transportCostPerM3, subtotal: transportCost,
  })

  // Crane
  const craneCost = params.craneCostPerDay * params.estimatedInstallDays
  lineItems.push({
    category: 'Crane', description: `Crane hire (${params.estimatedInstallDays} days)`,
    quantity: params.estimatedInstallDays, unit: 'days', unitCost: params.craneCostPerDay, subtotal: craneCost,
  })

  const totalStructuralCost = materialCost + connectionCost + wasteCost + installationCost + transportCost + craneCost

  return {
    lineItems,
    materialCost,
    connectionCost,
    installationCost,
    wasteCost,
    transportCost,
    totalStructuralCost,
    costPerM2: grossFloorAreaM2 > 0 ? totalStructuralCost / grossFloorAreaM2 : 0,
    costPerM3: totalTimberVolume > 0 ? totalStructuralCost / totalTimberVolume : 0,
  }
}
