import type { WallSegment } from '@/types/geometry'
import type { UtilizationResult, WallCheckResult } from '@/types/structural'
import { K_MOD, GAMMA_M, TIMBER_GRADES } from '@/data/material-properties'

function getStatus(ratio: number): 'pass' | 'warning' | 'fail' {
  if (ratio > 1.0) return 'fail'
  if (ratio > 0.8) return 'warning'
  return 'pass'
}

export interface WallCheckInput {
  wall: WallSegment
  storyShear: number // kN - lateral force assigned to this wall
  axialLoad: number // kN - vertical load on this wall
  serviceClass: number
}

export function checkWall(input: WallCheckInput): WallCheckResult {
  const { wall, storyShear, axialLoad, serviceClass } = input
  const t = wall.thickness // mm
  const dx = wall.end.x - wall.start.x
  const dy = wall.end.y - wall.start.y
  const grossLength = Math.sqrt(dx * dx + dy * dy) // mm
  const openingWidths = wall.openings.reduce((sum, o) => sum + o.width, 0)
  const netLength = grossLength - openingWidths

  const kmod = K_MOD[String(serviceClass)]?.['medium-term'] ?? 0.8
  const props = TIMBER_GRADES['C24']

  // In-plane shear
  const fv_d = kmod * props.fv_k / GAMMA_M.clt
  const V_demand = Math.abs(storyShear) * 1000 // N
  const V_capacity = fv_d * t * netLength // N
  const shearRatio = V_capacity > 0 ? V_demand / V_capacity : 0

  const inPlaneShear: UtilizationResult = {
    ratio: shearRatio,
    status: getStatus(shearRatio),
    demand: storyShear,
    capacity: V_capacity / 1000,
    unit: 'kN',
    formula: 'V / (fv_d * t * L_net)',
  }

  // Compression
  const fc_90_d = kmod * props.fc_90_k / GAMMA_M.clt
  const N_demand = Math.abs(axialLoad) * 1000 // N
  const A_bearing = t * netLength // mm^2
  const sigma_c = A_bearing > 0 ? N_demand / A_bearing : 0
  const compRatio = fc_90_d > 0 ? sigma_c / fc_90_d : 0

  const compression: UtilizationResult = {
    ratio: compRatio,
    status: getStatus(compRatio),
    demand: axialLoad,
    capacity: fc_90_d * A_bearing / 1000,
    unit: 'kN',
    formula: 'N / (fc_90_d * t * L_net)',
  }

  return {
    wallId: wall.id, storyIndex: wall.storyIndex,
    inPlaneShear, compression,
    governing: shearRatio > compRatio ? 'shear' : 'compression',
  }
}
