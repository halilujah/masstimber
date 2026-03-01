import type { GlulamSection } from '@/types/materials'
import type { GlulamOptimizationResult, RankingCriteria } from '@/types/optimization'
import { checkGlulamBeam } from '../structural/glulam-beam-check'

export interface GlulamOptimizerInput {
  span: number // mm
  totalLoadULS: number // kN/m
  totalLoadSLS: number // kN/m
  availableSections: GlulamSection[]
  serviceClass: number
}

export function optimizeGlulam(input: GlulamOptimizerInput): GlulamOptimizationResult[] {
  const results: GlulamOptimizationResult[] = []

  for (const section of input.availableSections) {
    const check = checkGlulamBeam({
      elementId: `opt-${section.id}`,
      storyIndex: 0,
      span: input.span,
      section,
      totalLoadULS: input.totalLoadULS,
      totalLoadSLS: input.totalLoadSLS,
      serviceClass: input.serviceClass,
    })

    const governingUtil = Math.max(check.bending.ratio, check.shear.ratio, check.deflection.ratio)

    results.push({
      sectionId: section.id,
      section,
      bendingUtil: check.bending.ratio,
      shearUtil: check.shear.ratio,
      deflectionUtil: check.deflection.ratio,
      governingUtil,
      passes: governingUtil <= 1.0,
      rank: { 'min-thickness': 0, 'min-cost': 0, 'min-weight': 0 },
    })
  }

  const passing = results.filter(r => r.passes)
  const rankBy = (criteria: RankingCriteria, getValue: (r: GlulamOptimizationResult) => number) => {
    const sorted = [...passing].sort((a, b) => getValue(a) - getValue(b))
    sorted.forEach((r, i) => { r.rank[criteria] = i + 1 })
  }

  rankBy('min-thickness', r => r.section.depth)
  rankBy('min-cost', r => r.section.costPerM)
  rankBy('min-weight', r => r.section.weight)

  return results
}
