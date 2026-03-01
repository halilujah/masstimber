import type { GlulamSection } from '@/types/materials'
import type { UtilizationResult, ColumnCheckResult } from '@/types/structural'
import { K_MOD, GAMMA_M } from '@/data/material-properties'

function getStatus(ratio: number): 'pass' | 'warning' | 'fail' {
  if (ratio > 1.0) return 'fail'
  if (ratio > 0.8) return 'warning'
  return 'pass'
}

export interface ColumnInput {
  elementId: string
  storyIndex: number
  height: number // mm
  section: GlulamSection
  axialLoad: number // kN
  serviceClass: number
  buckleLengthFactor: number // 1.0 for pinned-pinned
}

export function checkColumn(input: ColumnInput): ColumnCheckResult {
  const { elementId, storyIndex, height, section, axialLoad, serviceClass, buckleLengthFactor } = input
  const { width: b, depth: h, properties } = section

  const kmod = K_MOD[String(serviceClass)]?.['medium-term'] ?? 0.8
  const fc_0_d = kmod * properties.fc_0_k / GAMMA_M.glulam
  const A = b * h // mm^2
  const sigma_c = (axialLoad * 1000) / A // N/mm2

  // Pure compression
  const compRatio = sigma_c / fc_0_d
  const compression: UtilizationResult = {
    ratio: compRatio,
    status: getStatus(compRatio),
    demand: axialLoad,
    capacity: fc_0_d * A / 1000,
    unit: 'kN',
    formula: 'N / (fc_0_d * A)',
  }

  // Buckling
  const I_min = Math.min(b * h * h * h / 12, h * b * b * b / 12)
  const i = Math.sqrt(I_min / A)
  const Leff = buckleLengthFactor * height
  const lambda = Leff / i
  const lambda_rel = (lambda / Math.PI) * Math.sqrt(properties.fc_0_k / properties.E_0_05)

  let kc: number
  if (lambda_rel <= 0.3) {
    kc = 1.0
  } else {
    const beta_c = 0.1 // glulam
    const k = 0.5 * (1 + beta_c * (lambda_rel - 0.3) + lambda_rel * lambda_rel)
    kc = 1 / (k + Math.sqrt(k * k - lambda_rel * lambda_rel))
  }

  const bucklingRatio = sigma_c / (kc * fc_0_d)
  const buckling: UtilizationResult = {
    ratio: bucklingRatio,
    status: getStatus(bucklingRatio),
    demand: axialLoad,
    capacity: kc * fc_0_d * A / 1000,
    unit: 'kN',
    formula: 'sigma_c / (kc * fc_0_d)',
  }

  return {
    elementId, storyIndex, height, selectedSection: section.id,
    compression, buckling,
    governing: bucklingRatio > compRatio ? 'buckling' : 'compression',
  }
}
