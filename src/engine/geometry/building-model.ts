import type { WallSegment, Story, Point2D } from '@/types/geometry'

export function wallLength(wall: WallSegment): number {
  const dx = wall.end.x - wall.start.x
  const dy = wall.end.y - wall.start.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function wallNetLength(wall: WallSegment): number {
  const gross = wallLength(wall)
  const openingWidths = wall.openings.reduce((sum, o) => sum + o.width, 0)
  return gross - openingWidths
}

export function wallArea(wall: WallSegment): number {
  const len = wallLength(wall)
  const grossArea = len * wall.height
  const openingArea = wall.openings.reduce((sum, o) => sum + o.width * o.height, 0)
  return grossArea - openingArea
}

export function wallVolume(wall: WallSegment): number {
  return wallArea(wall) * wall.thickness / 1e9 // mm^3 to m^3
}

export function totalWallArea(walls: WallSegment[]): number {
  return walls.reduce((sum, w) => sum + wallArea(w), 0) / 1e6 // mm^2 to m^2
}

export function totalWallVolume(walls: WallSegment[]): number {
  return walls.reduce((sum, w) => sum + wallVolume(w), 0)
}

export function distance2D(a: Point2D, b: Point2D): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function midpoint(a: Point2D, b: Point2D): Point2D {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

export function computeFootprintArea(walls: WallSegment[], storyIndex: number): number {
  // Simplified: compute bounding box of walls on the given story
  const storyWalls = walls.filter(w => w.storyIndex === storyIndex)
  if (storyWalls.length === 0) return 0

  const allPoints = storyWalls.flatMap(w => [w.start, w.end])
  const minX = Math.min(...allPoints.map(p => p.x))
  const maxX = Math.max(...allPoints.map(p => p.x))
  const minY = Math.min(...allPoints.map(p => p.y))
  const maxY = Math.max(...allPoints.map(p => p.y))

  return ((maxX - minX) * (maxY - minY)) / 1e6 // mm^2 to m^2
}

export function computeTotalHeight(stories: Story[]): number {
  return stories.reduce((sum, s) => sum + s.height, 0)
}

export function computeGrossFloorArea(walls: WallSegment[], stories: Story[]): number {
  const footprint = computeFootprintArea(walls, 0)
  return footprint * stories.length
}

export function getMaxSpan(walls: WallSegment[], storyIndex: number): number {
  // Simplified: max distance between parallel walls as the slab span
  const storyWalls = walls.filter(w => w.storyIndex === storyIndex)
  if (storyWalls.length < 2) return 5000 // default 5m span

  const allPoints = storyWalls.flatMap(w => [w.start, w.end])
  const minX = Math.min(...allPoints.map(p => p.x))
  const maxX = Math.max(...allPoints.map(p => p.x))
  const minY = Math.min(...allPoints.map(p => p.y))
  const maxY = Math.max(...allPoints.map(p => p.y))

  // Take the shorter dimension as the slab span
  return Math.min(maxX - minX, maxY - minY)
}

export function getTotalBuildingMass(walls: WallSegment[], stories: Story[], slabWeightPerM2: number): number {
  // Wall mass (assume 420 kg/m3 for CLT)
  const wallMass = walls.reduce((sum, w) => {
    return sum + wallVolume(w) * 420 // kg
  }, 0)

  // Slab mass
  const footprint = computeFootprintArea(walls, 0)
  const slabMass = footprint * slabWeightPerM2 * (stories.length - 1)

  return wallMass + slabMass // kg
}

export function getStoryMass(walls: WallSegment[], storyIndex: number, _stories: Story[], footprintArea: number, slabWeightPerM2: number): number {
  const storyWalls = walls.filter(w => w.storyIndex === storyIndex)
  const wallMass = storyWalls.reduce((sum, w) => sum + wallVolume(w) * 420, 0)
  const slabMass = storyIndex > 0 ? footprintArea * slabWeightPerM2 : 0
  return wallMass + slabMass
}
