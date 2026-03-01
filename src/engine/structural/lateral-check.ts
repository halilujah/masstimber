import type { LateralCheckResult } from '@/types/structural'

function getStatus(ratio: number): 'pass' | 'warning' | 'fail' {
  if (ratio > 1.0) return 'fail'
  if (ratio > 0.8) return 'warning'
  return 'pass'
}

export interface LateralInput {
  baseShear: number // kN
  storyForces: number[] // kN per story
  storyHeights: number[] // mm per story
  storyStiffness: number[] // kN/mm per story (simplified)
  qFactor: number
}

export function checkLateral(input: LateralInput): LateralCheckResult {
  const { baseShear, storyForces, storyHeights, storyStiffness, qFactor } = input
  const driftLimit = 0.005 // H/200 for brittle non-structural
  const v = 0.5 // reduction factor for importance class II

  const storyDrifts: number[] = []
  const driftRatios: number[] = []

  for (let i = 0; i < storyForces.length; i++) {
    const stiffness = storyStiffness[i] > 0 ? storyStiffness[i] : 10 // kN/mm fallback
    const de = storyForces[i] / stiffness // elastic drift in mm
    const dr = qFactor * de // design drift
    const h = storyHeights[i]
    const ratio = h > 0 ? (dr * v) / h : 0

    storyDrifts.push(dr)
    driftRatios.push(ratio)
  }

  const maxDriftRatio = Math.max(...driftRatios, 0)

  return {
    baseShear,
    storyForces,
    storyDrifts,
    driftRatios,
    maxDriftRatio,
    driftLimit,
    status: getStatus(maxDriftRatio / driftLimit),
  }
}
