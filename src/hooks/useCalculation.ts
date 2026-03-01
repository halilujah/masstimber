import { useEffect, useRef } from 'react'
import { useGeometryStore } from '@/stores/geometryStore'
import { useLoadStore } from '@/stores/loadStore'
import { useMaterialStore } from '@/stores/materialStore'
import { useStructuralStore } from '@/stores/structuralStore'
import { useOptimizationStore } from '@/stores/optimizationStore'
import { useConnectionStore } from '@/stores/connectionStore'
import { useCostStore } from '@/stores/costStore'
import { generateCombinations, getLiveLoadValue } from '@/engine/loads/load-combinations'
import { calculatePeakVelocityPressure, calculateWindForceOnFace } from '@/engine/loads/wind-loads'
import { calculateBaseShear, distributeStoryForces } from '@/engine/loads/seismic-loads'
import { checkCLTSlab } from '@/engine/structural/clt-slab-check'
import { checkWall } from '@/engine/structural/wall-check'
import { checkLateral } from '@/engine/structural/lateral-check'
import { optimizeCLT } from '@/engine/optimization/clt-optimizer'
import { optimizeGlulam } from '@/engine/optimization/glulam-optimizer'
import { estimateWallConnections, summarizeConnections } from '@/engine/connections/connection-estimator'
import { calculateCosts } from '@/engine/cost/cost-calculator'
import {
  wallLength, getMaxSpan, computeFootprintArea, computeTotalHeight,
  totalWallVolume, computeGrossFloorArea, getTotalBuildingMass, getStoryMass
} from '@/engine/geometry/building-model'
import type { StructuralResults } from '@/types/structural'

export function useCalculation() {
  const walls = useGeometryStore(s => s.walls)
  const stories = useGeometryStore(s => s.stories)
  const loads = useLoadStore(s => s.loads)
  const setCombinations = useLoadStore(s => s.setCombinations)
  const manufacturer = useMaterialStore(s => s.getActiveManufacturer())
  const { setResults, setCalculating } = useStructuralStore()
  const { setOutput: setOptOutput } = useOptimizationStore()
  const rankingCriteria = useOptimizationStore(s => s.rankingCriteria)
  const { setSummary: setConnSummary } = useConnectionStore()
  const { parameters: costParams, setBreakdown } = useCostStore()

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (walls.length === 0) return

    timerRef.current = setTimeout(() => {
      setCalculating(true)

      try {
        // 1. Generate load combinations
        const slabSelfWeight = 2.0 // ~2 kN/m2 approx for CLT slab
        const combos = generateCombinations(loads, slabSelfWeight)
        setCombinations(combos)

        const liveLoad = getLiveLoadValue(loads.live.category, loads.live.customValue)
        const deadLoad = loads.dead.additionalPermanent + slabSelfWeight
        const panels = manufacturer.cltPanels
        const midPanel = panels[Math.min(3, panels.length - 1)]

        // 2. Wind loads
        const totalHeight = computeTotalHeight(stories)
        const qp = calculatePeakVelocityPressure(loads.wind, totalHeight)

        // 3. Seismic loads
        let baseShear = 0
        let storyForces: number[] = []
        const footprint = computeFootprintArea(walls, 0)

        if (loads.seismic.enabled && loads.seismic.agR > 0) {
          const buildingHeightM = totalHeight / 1000
          const totalMass = getTotalBuildingMass(walls, stories, midPanel?.weight ?? 50)
          baseShear = calculateBaseShear(buildingHeightM, totalMass, loads.seismic, stories.length)

          const storyMasses = stories.map((_, i) =>
            getStoryMass(walls, i, stories, footprint, midPanel?.weight ?? 50)
          )
          let cumH = 0
          const cumHeights = stories.map(s => {
            cumH += s.height / 1000
            return cumH
          })
          storyForces = distributeStoryForces(baseShear, storyMasses, cumHeights)
        } else {
          storyForces = stories.map(() => 0)
        }

        // Also add wind contribution to story forces
        const allPoints = walls.flatMap(w => [w.start, w.end])
        const buildingWidth = allPoints.length > 0
          ? (Math.max(...allPoints.map(p => p.x)) - Math.min(...allPoints.map(p => p.x)))
          : 10000
        stories.forEach((s, i) => {
          const windForce = calculateWindForceOnFace(qp, buildingWidth, s.height)
          storyForces[i] = Math.max(storyForces[i], windForce)
        })

        // 4. Structural checks - Slabs
        const slabResults = stories.filter(s => s.index > 0).map(story => {
          const span = getMaxSpan(walls, 0)
          return checkCLTSlab({
            elementId: `slab-${story.index}`,
            storyIndex: story.index,
            span,
            panel: midPanel,
            deadLoadULS: deadLoad * 1.35,
            liveLoadULS: liveLoad * 1.5,
            deadLoadSLS: deadLoad,
            liveLoadSLS: liveLoad,
            serviceClass: 1,
          })
        })

        // 5. Structural checks - Walls
        const wallResults = walls.map(wall => {
          const storyWalls = walls.filter(w => w.storyIndex === wall.storyIndex)
          const totalShearLen = storyWalls.reduce((s, w) => s + wallLength(w), 0)
          const sf = storyForces[wall.storyIndex] ?? 0
          const axialLoad = (deadLoad + liveLoad) * footprint / Math.max(storyWalls.length, 1) * (stories.length - wall.storyIndex)

          return checkWall({
            wall,
            storyShear: sf * (wallLength(wall) / Math.max(totalShearLen, 1)),
            axialLoad,
            serviceClass: 1,
          })
        })

        // 6. Lateral check
        const storyStiffness = stories.map((_, i) => {
          const sw = walls.filter(w => w.storyIndex === i)
          return sw.reduce((sum, w) => sum + wallLength(w) * w.thickness / 1000, 0) * 0.5 // simplified kN/mm
        })

        const lateralResult = checkLateral({
          baseShear: Math.max(baseShear, storyForces.reduce((a, b) => a + b, 0)),
          storyForces,
          storyHeights: stories.map(s => s.height),
          storyStiffness,
          qFactor: loads.seismic.qFactor,
        })

        const structResults: StructuralResults = {
          slabs: slabResults,
          beams: [],
          columns: [],
          walls: wallResults,
          lateral: lateralResult,
          timestamp: Date.now(),
        }
        setResults(structResults)

        // 7. Optimization
        const span = getMaxSpan(walls, 0)
        const cltOpt = optimizeCLT({
          span,
          deadLoadULS: deadLoad * 1.35,
          liveLoadULS: liveLoad * 1.5,
          deadLoadSLS: deadLoad,
          liveLoadSLS: liveLoad,
          availablePanels: manufacturer.cltPanels,
          serviceClass: 1,
        })

        const tributaryWidth = 1.0 // 1m strip
        const glulamOpt = optimizeGlulam({
          span,
          totalLoadULS: (deadLoad * 1.35 + liveLoad * 1.5) * tributaryWidth,
          totalLoadSLS: (deadLoad + liveLoad) * tributaryWidth,
          availableSections: manufacturer.glulamSections,
          serviceClass: 1,
        })

        const cltPassing = cltOpt.filter(r => r.passes)
        const glulamPassing = glulamOpt.filter(r => r.passes)

        const findRecommended = <T extends { rank: Record<string, number> }>(results: T[], criteria: string): T | null => {
          return results.find(r => r.rank[criteria] === 1) ?? null
        }

        setOptOutput({
          clt: {
            allResults: cltOpt,
            recommended: {
              'min-thickness': findRecommended(cltPassing, 'min-thickness'),
              'min-cost': findRecommended(cltPassing, 'min-cost'),
              'min-weight': findRecommended(cltPassing, 'min-weight'),
            },
          },
          glulam: {
            allResults: glulamOpt,
            recommended: {
              'min-thickness': findRecommended(glulamPassing, 'min-thickness'),
              'min-cost': findRecommended(glulamPassing, 'min-cost'),
              'min-weight': findRecommended(glulamPassing, 'min-weight'),
            },
          },
        })

        // 8. Connection estimation
        const connEstimates = walls.map(wall => {
          const storyWalls = walls.filter(w => w.storyIndex === wall.storyIndex)
          const totalShearLen = storyWalls.reduce((s, w) => s + wallLength(w), 0)
          return estimateWallConnections({
            wallId: wall.id,
            wallLength: wallLength(wall),
            storyShear: storyForces[wall.storyIndex] ?? 0,
            storyHeight: stories[wall.storyIndex]?.height ?? 3000,
            axialLoad: (deadLoad + liveLoad) * footprint / Math.max(storyWalls.length, 1),
            totalShearWallLength: totalShearLen,
          })
        })
        const connSummary = summarizeConnections(connEstimates)
        setConnSummary(connSummary)

        // 9. Cost calculation
        const cltVolume = totalWallVolume(walls)
        const gfa = computeGrossFloorArea(walls, stories)
        const costResult = calculateCosts({
          params: costParams,
          cltVolumeM3: cltVolume,
          cltAreaM2: gfa,
          glulamVolumeM3: cltVolume * 0.15,
          glulamLengthM: gfa * 0.3,
          connections: connSummary,
          grossFloorAreaM2: gfa,
        })
        setBreakdown(costResult)
      } catch (err) {
        console.error('Calculation pipeline error:', err)
      } finally {
        setCalculating(false)
      }
    }, 300)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [walls, stories, loads, manufacturer, costParams, rankingCriteria])
}
