import type { LoadDefinition, LoadCombination, LiveLoadCategory } from '@/types/loads'
import { LIVE_LOAD_CATEGORIES, PSI_FACTORS } from '@/data/load-categories'
import { v4 as uuid } from 'uuid'

export function getLiveLoadValue(category: LiveLoadCategory, customValue?: number): number {
  if (customValue !== undefined) return customValue
  const cat = LIVE_LOAD_CATEGORIES.find(c => c.category === category)
  return cat?.qk ?? 2.0
}

export function generateCombinations(loads: LoadDefinition, selfWeight: number): LoadCombination[] {
  const G = selfWeight + loads.dead.additionalPermanent // total dead load kN/m2
  const Q = getLiveLoadValue(loads.live.category, loads.live.customValue)
  const psi = PSI_FACTORS[loads.live.category]

  const combos: LoadCombination[] = [
    // ULS combinations
    {
      id: uuid(), name: 'ULS-1: 1.35G + 1.50Q', type: 'ULS',
      factors: { dead: 1.35, live: 1.50, wind: 0, seismic: 0 },
      resultant: { verticalLoad: 1.35 * G + 1.50 * Q, lateralForce: 0 },
    },
    {
      id: uuid(), name: 'ULS-2: 1.35G + 1.50Q + 0.90W', type: 'ULS',
      factors: { dead: 1.35, live: 1.50, wind: 0.9, seismic: 0 },
      resultant: { verticalLoad: 1.35 * G + 1.50 * Q, lateralForce: 0 },
    },
    {
      id: uuid(), name: `ULS-3: 1.35G + 1.50W + ${(1.5 * psi.psi_0).toFixed(2)}Q`, type: 'ULS',
      factors: { dead: 1.35, live: 1.5 * psi.psi_0, wind: 1.50, seismic: 0 },
      resultant: { verticalLoad: 1.35 * G + 1.5 * psi.psi_0 * Q, lateralForce: 0 },
    },
    // SLS combinations
    {
      id: uuid(), name: 'SLS-1: G + Q (Characteristic)', type: 'SLS',
      factors: { dead: 1.0, live: 1.0, wind: 0, seismic: 0 },
      resultant: { verticalLoad: G + Q, lateralForce: 0 },
    },
    {
      id: uuid(), name: `SLS-2: G + ${psi.psi_2}Q (Quasi-permanent)`, type: 'SLS',
      factors: { dead: 1.0, live: psi.psi_2, wind: 0, seismic: 0 },
      resultant: { verticalLoad: G + psi.psi_2 * Q, lateralForce: 0 },
    },
  ]

  if (loads.seismic.enabled && loads.seismic.agR > 0) {
    combos.push({
      id: uuid(), name: `ULS-4: G + E + ${(psi.psi_2).toFixed(1)}Q (Seismic)`, type: 'ULS',
      factors: { dead: 1.0, live: psi.psi_2, wind: 0, seismic: 1.0 },
      resultant: { verticalLoad: G + psi.psi_2 * Q, lateralForce: 0 },
    })
  }

  return combos
}
