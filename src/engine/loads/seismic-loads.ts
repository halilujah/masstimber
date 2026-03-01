import type { SeismicLoadInput } from '@/types/loads'
import { SOIL_PARAMETERS, IMPORTANCE_FACTORS } from '@/data/seismic-zones'

export function calculateFundamentalPeriod(buildingHeightM: number): number {
  const Ct = 0.05 // timber
  return Ct * Math.pow(buildingHeightM, 0.75)
}

export function calculateDesignSpectrum(T1: number, seismic: SeismicLoadInput): number {
  const soil = SOIL_PARAMETERS[seismic.soilType]
  const gammaI = IMPORTANCE_FACTORS[seismic.importanceClass]?.factor ?? 1.0
  const ag = seismic.agR * gammaI * 9.81 // m/s^2
  const { S, TB, TC, TD } = soil
  const q = seismic.qFactor

  let Sd: number
  if (T1 <= TB) {
    Sd = ag * S * (2/3 + T1/TB * (2.5/q - 2/3))
  } else if (T1 <= TC) {
    Sd = ag * S * 2.5 / q
  } else if (T1 <= TD) {
    Sd = ag * S * 2.5 / q * TC / T1
  } else {
    Sd = ag * S * 2.5 / q * TC * TD / (T1 * T1)
  }

  // Minimum value
  Sd = Math.max(Sd, 0.2 * ag)

  return Sd // m/s^2
}

export function calculateBaseShear(
  buildingHeightM: number,
  totalMassKg: number,
  seismic: SeismicLoadInput,
  numStories: number
): number {
  const T1 = calculateFundamentalPeriod(buildingHeightM)
  const Sd = calculateDesignSpectrum(T1, seismic)
  const soil = SOIL_PARAMETERS[seismic.soilType]
  const lambda = (T1 <= 2 * soil.TC && numStories > 2) ? 0.85 : 1.0

  return Sd * (totalMassKg / 1000) * lambda // kN (mass in tonnes * m/s^2 = kN)
}

export function distributeStoryForces(
  baseShear: number,
  storyMasses: number[], // kg per story
  storyHeights: number[] // cumulative height to each story in m
): number[] {
  const sumMZ = storyMasses.reduce((sum, m, i) => sum + m * storyHeights[i], 0)
  if (sumMZ === 0) return storyMasses.map(() => 0)

  return storyMasses.map((m, i) => baseShear * (m * storyHeights[i]) / sumMZ)
}
