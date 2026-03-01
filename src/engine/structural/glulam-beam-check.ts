import type { GlulamSection } from '@/types/materials'
import type { UtilizationResult, BeamCheckResult } from '@/types/structural'
import { K_MOD, GAMMA_M } from '@/data/material-properties'

function getStatus(ratio: number): 'pass' | 'warning' | 'fail' {
  if (ratio > 1.0) return 'fail'
  if (ratio > 0.8) return 'warning'
  return 'pass'
}

export interface GlulamBeamInput {
  elementId: string
  storyIndex: number
  span: number // mm
  section: GlulamSection
  totalLoadULS: number // kN/m (line load, factored)
  totalLoadSLS: number // kN/m (line load, unfactored)
  serviceClass: number
}

export function checkGlulamBeam(input: GlulamBeamInput): BeamCheckResult {
  const { elementId, storyIndex, span, section, totalLoadULS, totalLoadSLS, serviceClass } = input
  const { width: b, depth: h, properties } = section
  const L = span

  const kmod = K_MOD[String(serviceClass)]?.['medium-term'] ?? 0.8
  const kh = Math.min(Math.pow(600 / h, 0.1), 1.1)

  // Bending
  const fm_d = kmod * kh * properties.fm_k / GAMMA_M.glulam
  const W = b * h * h / 6 // mm^3
  const q_uls = totalLoadULS / 1000 // N/mm
  const M_Ed = q_uls * L * L / 8 // N.mm
  const sigma_m = M_Ed / W
  const bendingRatio = sigma_m / fm_d

  const bending: UtilizationResult = {
    ratio: bendingRatio,
    status: getStatus(bendingRatio),
    demand: M_Ed / 1e6,
    capacity: fm_d * W / 1e6,
    unit: 'kN.m',
    formula: 'sigma_m / fm_d',
  }

  // Shear
  const fv_d = kmod * properties.fv_k / GAMMA_M.glulam
  const V_Ed = q_uls * L / 2 // N
  const tau = 1.5 * V_Ed / (b * h)
  const shearRatio = tau / fv_d

  const shear: UtilizationResult = {
    ratio: shearRatio,
    status: getStatus(shearRatio),
    demand: V_Ed / 1000,
    capacity: fv_d * b * h / 1500,
    unit: 'kN',
    formula: '1.5V/(bh) / fv_d',
  }

  // Deflection
  const q_sls = totalLoadSLS / 1000 // N/mm
  const I = b * h * h * h / 12 // mm^4
  const w_bending = 5 * q_sls * Math.pow(L, 4) / (384 * properties.E_0_mean * I)
  const k_form = 1.2
  const w_shear = w_bending * (properties.E_0_mean / properties.G_mean) * Math.pow(h / L, 2) * k_form
  const w_total = w_bending + w_shear
  const w_limit = L / 300
  const deflRatio = w_total / w_limit

  const deflection: UtilizationResult = {
    ratio: deflRatio,
    status: getStatus(deflRatio),
    demand: w_total,
    capacity: w_limit,
    unit: 'mm',
    formula: 'w_bend + w_shear vs L/300',
  }

  const results = { bending: bendingRatio, shear: shearRatio, deflection: deflRatio }
  const governing = Object.entries(results).reduce((a, b) => b[1] > a[1] ? b : a)[0] as 'bending' | 'shear' | 'deflection'

  return {
    elementId, storyIndex, span, selectedSection: section.id,
    bending, shear, deflection, governing,
  }
}
