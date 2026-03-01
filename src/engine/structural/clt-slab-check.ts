import type { CLTPanel } from '@/types/materials'
import type { UtilizationResult, SlabCheckResult } from '@/types/structural'

function getStatus(ratio: number): 'pass' | 'warning' | 'fail' {
  if (ratio > 1.0) return 'fail'
  if (ratio > 0.8) return 'warning'
  return 'pass'
}

export interface CLTSlabInput {
  elementId: string
  storyIndex: number
  span: number // mm
  panel: CLTPanel
  deadLoadULS: number // kN/m2 (factored)
  liveLoadULS: number // kN/m2 (factored)
  deadLoadSLS: number // kN/m2 (unfactored)
  liveLoadSLS: number // kN/m2 (unfactored)
  serviceClass: number
}

export function checkCLTSlab(input: CLTSlabInput): SlabCheckResult {
  const { elementId, storyIndex, span, panel, deadLoadULS, liveLoadULS, deadLoadSLS, liveLoadSLS } = input
  const L = span // mm

  // ULS bending check (simply supported, 1m strip)
  const q_uls = (deadLoadULS + liveLoadULS) / 1000 // kN/mm per mm width -> N/mm per mm
  const M_Ed = q_uls * L * L / 8 // N.mm per mm width

  // Use precomputed EI_eff and moment capacity
  const M_Rd = panel.moment_capacity * 1e6 // kN.m/m -> N.mm/mm (per mm width)
  const bendingRatio = M_Ed / M_Rd

  const bending: UtilizationResult = {
    ratio: bendingRatio,
    status: getStatus(bendingRatio),
    demand: M_Ed / 1e6,
    capacity: M_Rd / 1e6,
    unit: 'kN.m/m',
    formula: 'M_Ed / M_Rd (gamma method)',
  }

  // SLS deflection check
  const q_sls = (deadLoadSLS + liveLoadSLS) / 1000 // N/mm per mm
  const w_inst = 5 * q_sls * Math.pow(L, 4) / (384 * panel.EI_eff) // mm (EI_eff is per m width)
  const w_limit = L / 300
  const deflRatio = w_inst / w_limit

  const deflection: UtilizationResult = {
    ratio: deflRatio,
    status: getStatus(deflRatio),
    demand: w_inst,
    capacity: w_limit,
    unit: 'mm',
    formula: '5qL^4/(384EI) vs L/300',
  }

  // Vibration check (simplified frequency)
  const massPerM = panel.weight // kg/m2
  const massPerMM = massPerM / 1e6 // kg/mm2
  const f1 = (Math.PI / 2) * Math.sqrt(panel.EI_eff / (massPerMM * Math.pow(L, 4))) // Hz
  const f_limit = 8 // Hz
  const vibRatio = f_limit / Math.max(f1, 0.1)

  const vibration: UtilizationResult = {
    ratio: vibRatio,
    status: getStatus(vibRatio),
    demand: f_limit,
    capacity: f1,
    unit: 'Hz',
    formula: 'f1 = pi/2 * sqrt(EI/mL^4) >= 8Hz',
  }

  const results = { bending: bendingRatio, deflection: deflRatio, vibration: vibRatio }
  const governing = Object.entries(results).reduce((a, b) => b[1] > a[1] ? b : a)[0] as 'bending' | 'deflection' | 'vibration'

  return {
    elementId, storyIndex, span, selectedPanel: panel.id,
    bending, deflection, vibration, governing,
  }
}
