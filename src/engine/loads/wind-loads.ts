import type { WindLoadInput } from '@/types/loads'
import { EXPOSURE_FACTOR } from '@/data/wind-zones'

export function calculateBasicVelocityPressure(vb0: number): number {
  const rho = 1.25 // kg/m3 air density
  return 0.5 * rho * vb0 * vb0 / 1000 // kN/m2
}

export function getExposureFactor(terrainCategory: string, height: number): number {
  const factors = EXPOSURE_FACTOR[terrainCategory as keyof typeof EXPOSURE_FACTOR]
  if (!factors) return 2.1

  // Interpolate between height values
  const heights = [5, 10, 15, 20]
  const values = heights.map(h => factors[String(h)] ?? 2.1)

  if (height <= 5) return values[0]
  if (height >= 20) return values[3]

  for (let i = 0; i < heights.length - 1; i++) {
    if (height >= heights[i] && height <= heights[i + 1]) {
      const t = (height - heights[i]) / (heights[i + 1] - heights[i])
      return values[i] + t * (values[i + 1] - values[i])
    }
  }
  return 2.1
}

export function calculatePeakVelocityPressure(wind: WindLoadInput, buildingHeight: number): number {
  const qb = calculateBasicVelocityPressure(wind.basicWindSpeed)
  const ce = getExposureFactor(wind.terrainCategory, buildingHeight / 1000) // height in m
  return qb * ce * wind.orography
}

export function calculateWindForceOnFace(qp: number, areaWidth: number, areaHeight: number): number {
  // Simplified: windward cpe=0.8, internal cpi=-0.3, net = 1.1
  const cpe = 0.8
  const cpi = -0.3
  const Aref = (areaWidth / 1000) * (areaHeight / 1000) // m2
  return qp * Aref * (cpe - cpi) // kN
}
