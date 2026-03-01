import type { ConnectionEstimate, ConnectionSummary } from '@/types/connections'
import { ANGLE_BRACKETS, HOLD_DOWNS } from '@/data/connection-catalog'

export interface ConnectionInput {
  wallId: string
  wallLength: number // mm
  storyShear: number // kN (lateral force for this wall)
  storyHeight: number // mm
  axialLoad: number // kN (vertical)
  totalShearWallLength: number // mm (all shear walls at this story)
}

export function estimateWallConnections(input: ConnectionInput): ConnectionEstimate {
  const { wallId, wallLength, storyShear, storyHeight, axialLoad, totalShearWallLength } = input

  // Distribute shear proportionally to wall length
  const wallShearShare = totalShearWallLength > 0
    ? Math.abs(storyShear) * (wallLength / totalShearWallLength)
    : 0

  // Angle brackets for shear
  const bracket = ANGLE_BRACKETS[1] // ABR 105
  const nBrackets = Math.max(2, Math.ceil(wallShearShare / bracket.shearCapacity))

  // Hold-downs for uplift at wall ends
  const leverArm = wallLength / 1000 // m
  const M_overturning = wallShearShare * (storyHeight / 1000) // kN.m
  const T_uplift = leverArm > 0 ? M_overturning / leverArm - Math.abs(axialLoad) * 0.5 : 0

  const holdDown = HOLD_DOWNS[0] // HTT 22
  const nHoldDowns = T_uplift > 0 ? Math.max(2, Math.ceil(T_uplift / holdDown.tensionCapacity)) : 2

  const screwCount = nBrackets * bracket.screwsRequired + nHoldDowns * holdDown.screwsRequired
  const cost = nBrackets * bracket.unitCost + nHoldDowns * holdDown.unitCost + (screwCount / 100) * 18

  return {
    location: 'wall-floor',
    elementId: wallId,
    angleBrackets: nBrackets,
    holdDowns: nHoldDowns,
    screwCount,
    shearDemand: wallShearShare,
    upliftDemand: Math.max(0, T_uplift),
    estimatedCost: Math.round(cost * 100) / 100,
  }
}

export function summarizeConnections(estimates: ConnectionEstimate[]): ConnectionSummary {
  return {
    totalAngleBrackets: estimates.reduce((s, e) => s + e.angleBrackets, 0),
    totalHoldDowns: estimates.reduce((s, e) => s + e.holdDowns, 0),
    totalScrews: estimates.reduce((s, e) => s + e.screwCount, 0),
    totalCost: estimates.reduce((s, e) => s + e.estimatedCost, 0),
    details: estimates,
  }
}
