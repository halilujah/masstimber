import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Edges } from '@react-three/drei'
import { useGeometryStore } from '@/stores/geometryStore'
import { computeTotalHeight } from '@/engine/geometry/building-model'
import * as THREE from 'three'
import type { WallSegment } from '@/types/geometry'

/* ---- Outer boundary tracing ---- */

type Pt = { x: number; y: number }
const ptKey = (p: Pt) => `${Math.round(p.x)},${Math.round(p.y)}`

/**
 * Traces the outer boundary of connected wall segments.
 * Walks the perimeter by always taking the smallest-CCW-turn edge,
 * which follows the outer contour and preserves 90-degree corners.
 * Falls back to convex hull if walls don't form a closed polygon.
 */
function traceOuterBoundary(walls: WallSegment[]): Pt[] {
  if (walls.length < 3) return walls.flatMap(w => [w.start, w.end])

  // Build adjacency graph
  const adj = new Map<string, Pt[]>()
  const verts = new Map<string, Pt>()

  for (const w of walls) {
    const sk = ptKey(w.start), ek = ptKey(w.end)
    if (sk === ek) continue
    verts.set(sk, w.start)
    verts.set(ek, w.end)
    if (!adj.has(sk)) adj.set(sk, [])
    if (!adj.has(ek)) adj.set(ek, [])
    if (!adj.get(sk)!.some(p => ptKey(p) === ek)) adj.get(sk)!.push(w.end)
    if (!adj.get(ek)!.some(p => ptKey(p) === sk)) adj.get(ek)!.push(w.start)
  }

  // Start at leftmost vertex (guaranteed on outer boundary)
  let start: Pt | null = null
  for (const v of verts.values()) {
    if (!start || v.x < start.x || (v.x === start.x && v.y < start.y)) start = v
  }
  if (!start) return []

  // Walk the boundary
  const path: Pt[] = [start]
  let current = start
  let inAngle = 0 // pretend arriving from the left

  for (let step = 0; step < verts.size + 2; step++) {
    const neighbors = adj.get(ptKey(current))
    if (!neighbors || neighbors.length === 0) break

    const reverseAngle = inAngle + Math.PI
    let best: Pt | null = null
    let bestTurn = Infinity

    for (const n of neighbors) {
      const outAngle = Math.atan2(n.y - current.y, n.x - current.x)
      let turn = outAngle - reverseAngle
      while (turn < 0) turn += 2 * Math.PI
      while (turn >= 2 * Math.PI) turn -= 2 * Math.PI
      if (turn < 0.001) turn = 2 * Math.PI // don't go back the way we came

      if (turn < bestTurn) {
        bestTurn = turn
        best = n
      }
    }

    if (!best) break
    if (ptKey(best) === ptKey(start) && path.length > 2) break // closed loop

    inAngle = Math.atan2(best.y - current.y, best.x - current.x)
    current = best
    if (ptKey(current) === ptKey(start)) break
    path.push(current)
  }

  return path.length >= 3 ? path : []
}

/** Convex hull fallback (Andrew's monotone chain) */
function convexHull(points: Pt[]): Pt[] {
  const pts = [...new Map(points.map(p => [ptKey(p), p])).values()]
  if (pts.length < 3) return pts
  pts.sort((a, b) => a.x - b.x || a.y - b.y)

  const cross = (O: Pt, A: Pt, B: Pt) =>
    (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x)

  const lower: Pt[] = []
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop()
    lower.push(p)
  }
  const upper: Pt[] = []
  for (const p of [...pts].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop()
    upper.push(p)
  }
  lower.pop()
  upper.pop()
  return lower.concat(upper)
}

/* ---- Meshes ---- */

function WallMesh({ wall, yOffset }: { wall: WallSegment; yOffset: number }) {
  const dx = wall.end.x - wall.start.x
  const dy = wall.end.y - wall.start.y
  const length = Math.sqrt(dx * dx + dy * dy) / 1000
  const height = wall.height / 1000
  const thickness = wall.thickness / 1000
  const cx = (wall.start.x + wall.end.x) / 2 / 1000
  const cy = (wall.start.y + wall.end.y) / 2 / 1000
  const angle = Math.atan2(-dy, dx)

  return (
    <mesh
      position={[cx, yOffset + height / 2, -cy]}
      rotation={[0, angle, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[length, height, thickness]} />
      <meshStandardMaterial color="#d4a574" />
      <Edges threshold={15} color="#3d2e0a" />
    </mesh>
  )
}

function SlabMesh({ walls, yOffset, thickness }: { walls: WallSegment[]; yOffset: number; thickness: number }) {
  // Try boundary tracing first (preserves 90° corners), fall back to convex hull
  let outline = traceOuterBoundary(walls)
  if (outline.length < 3) {
    outline = convexHull(walls.flatMap(w => [w.start, w.end]))
  }
  if (outline.length < 3) return null

  const t = thickness / 1000

  // Shape in XY plane; rotation -PI/2 around X maps: shape X → world X, shape Y → world -Z
  const shape = new THREE.Shape()
  shape.moveTo(outline[0].x / 1000, outline[0].y / 1000)
  for (let i = 1; i < outline.length; i++) {
    shape.lineTo(outline[i].x / 1000, outline[i].y / 1000)
  }
  shape.closePath()

  return (
    <mesh position={[0, yOffset, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <extrudeGeometry args={[shape, { steps: 1, depth: t, bevelEnabled: false }]} />
      <meshStandardMaterial color="#c9a96e" />
      <Edges threshold={15} color="#2e2210" />
    </mesh>
  )
}

function RoofMesh({ footprint, yOffset, roofType, pitch }: { footprint: { minX: number; maxX: number; minY: number; maxY: number }; yOffset: number; roofType: string; pitch: number }) {
  const w = (footprint.maxX - footprint.minX) / 1000
  const d = (footprint.maxY - footprint.minY) / 1000
  const cx = (footprint.minX + footprint.maxX) / 2 / 1000
  const cy = (footprint.minY + footprint.maxY) / 2 / 1000

  if (w <= 0 || d <= 0) return null

  if (roofType === 'flat') {
    return (
      <mesh position={[cx, yOffset + 0.1, -cy]}>
        <boxGeometry args={[w + 0.3, 0.2, d + 0.3]} />
        <meshStandardMaterial color="#8b6f47" />
        <Edges threshold={15} color="#1e1508" />
      </mesh>
    )
  }

  if (roofType === 'gable') {
    const ridgeHeight = Math.tan((pitch || 15) * Math.PI / 180) * (d / 2)
    const shape = new THREE.Shape()
    shape.moveTo(-d/2, 0)
    shape.lineTo(0, ridgeHeight)
    shape.lineTo(d/2, 0)
    shape.closePath()

    const extrudeSettings = { steps: 1, depth: w, bevelEnabled: false }

    return (
      <mesh position={[cx - w/2, yOffset, -cy]} rotation={[0, Math.PI/2, 0]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial color="#8b6f47" side={THREE.DoubleSide} />
        <Edges threshold={15} color="#1e1508" />
      </mesh>
    )
  }

  // mono-pitch
  const rise = Math.tan((pitch || 10) * Math.PI / 180) * d
  const shape = new THREE.Shape()
  shape.moveTo(-d/2, 0)
  shape.lineTo(-d/2, rise)
  shape.lineTo(d/2, 0)
  shape.closePath()

  return (
    <mesh position={[cx - w/2, yOffset, -cy]} rotation={[0, Math.PI/2, 0]}>
      <extrudeGeometry args={[shape, { steps: 1, depth: w, bevelEnabled: false }]} />
      <meshStandardMaterial color="#8b6f47" side={THREE.DoubleSide} />
      <Edges threshold={15} color="#1e1508" />
    </mesh>
  )
}

/* ---- Building assembly ---- */

function Building() {
  const walls = useGeometryStore(s => s.walls)
  const stories = useGeometryStore(s => s.stories)
  const roof = useGeometryStore(s => s.roof)

  if (walls.length === 0) return null

  // Roof only appears when topmost story has walls
  const topStoryIndex = stories.length - 1
  const topStoryWalls = walls.filter(w => w.storyIndex === topStoryIndex)
  const showRoof = topStoryWalls.length > 0

  // Compute roof footprint (bounding box) from top story walls
  let roofFootprint: { minX: number; maxX: number; minY: number; maxY: number } | null = null
  if (showRoof) {
    const pts = topStoryWalls.flatMap(w => [w.start, w.end])
    roofFootprint = {
      minX: Math.min(...pts.map(p => p.x)),
      maxX: Math.max(...pts.map(p => p.x)),
      minY: Math.min(...pts.map(p => p.y)),
      maxY: Math.max(...pts.map(p => p.y)),
    }
  }

  let cumulativeHeight = 0

  return (
    <group>
      {stories.map((story, i) => {
        const yOffset = cumulativeHeight / 1000
        cumulativeHeight += story.height
        const storyWalls = walls.filter(w => w.storyIndex === i)

        return (
          <group key={i}>
            {/* Floor slab — only if this story has walls and not ground floor */}
            {i > 0 && storyWalls.length > 0 && (
              <SlabMesh walls={storyWalls} yOffset={yOffset} thickness={story.floorThickness} />
            )}
            {/* Walls */}
            {storyWalls.map(wall => (
              <WallMesh key={wall.id} wall={wall} yOffset={yOffset} />
            ))}
          </group>
        )
      })}
      {/* Roof — only when topmost story has walls */}
      {showRoof && roofFootprint && (
        <RoofMesh
          footprint={roofFootprint}
          yOffset={computeTotalHeight(stories) / 1000}
          roofType={roof.type}
          pitch={roof.pitch}
        />
      )}
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
    </group>
  )
}

export function BuildingScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [15, 12, 15], fov: 50 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <Building />
        <OrbitControls makeDefault />
        <Grid
          args={[50, 50]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#d1d5db"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#9ca3af"
          fadeDistance={50}
          position={[0, -0.02, 0]}
        />
      </Canvas>
    </div>
  )
}
