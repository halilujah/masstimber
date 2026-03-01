import type { CLTPanel } from '@/types/materials'
import type { CLTOptimizationResult, RankingCriteria } from '@/types/optimization'
import { checkCLTSlab } from '../structural/clt-slab-check'

export interface CLTOptimizerInput {
  span: number // mm
  deadLoadULS: number // kN/m2
  liveLoadULS: number // kN/m2
  deadLoadSLS: number // kN/m2
  liveLoadSLS: number // kN/m2
  availablePanels: CLTPanel[]
  serviceClass: number
}

export function optimizeCLT(input: CLTOptimizerInput): CLTOptimizationResult[] {
  const results: CLTOptimizationResult[] = []

  for (const panel of input.availablePanels) {
    const check = checkCLTSlab({
      elementId: `opt-${panel.id}`,
      storyIndex: 0,
      span: input.span,
      panel,
      deadLoadULS: input.deadLoadULS,
      liveLoadULS: input.liveLoadULS,
      deadLoadSLS: input.deadLoadSLS,
      liveLoadSLS: input.liveLoadSLS,
      serviceClass: input.serviceClass,
    })

    const governingUtil = Math.max(check.bending.ratio, check.deflection.ratio, check.vibration.ratio)

    results.push({
      panelId: panel.id,
      panel,
      bendingUtil: check.bending.ratio,
      deflectionUtil: check.deflection.ratio,
      governingUtil,
      passes: governingUtil <= 1.0,
      rank: { 'min-thickness': 0, 'min-cost': 0, 'min-weight': 0 },
    })
  }

  // Rank passing results
  const passing = results.filter(r => r.passes)
  const rankBy = (criteria: RankingCriteria, getValue: (r: CLTOptimizationResult) => number) => {
    const sorted = [...passing].sort((a, b) => getValue(a) - getValue(b))
    sorted.forEach((r, i) => { r.rank[criteria] = i + 1 })
  }

  rankBy('min-thickness', r => r.panel.layup.totalThickness)
  rankBy('min-cost', r => r.panel.costPerM2)
  rankBy('min-weight', r => r.panel.weight)

  return results
}
