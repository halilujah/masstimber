import { useRef, useState, useCallback, useEffect } from 'react'
import { Stage, Layer, Line, Circle, Text, Group } from 'react-konva'
import { useGeometryStore } from '@/stores/geometryStore'
import type { Point2D } from '@/types/geometry'

const GRID_SIZE = 500 // 500mm grid
const BASE_SCALE = 0.12 // pixels per mm at zoom=1

function snapToGrid(val: number): number {
  return Math.round(val / GRID_SIZE) * GRID_SIZE
}

function constrainOrthogonal(start: Point2D, cursor: Point2D): Point2D {
  const dx = Math.abs(cursor.x - start.x)
  const dy = Math.abs(cursor.y - start.y)
  return dx > dy
    ? { x: cursor.x, y: start.y }
    : { x: start.x, y: cursor.y }
}

export function PlanCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    walls, activeStoryIndex, drawingMode,
    addWall, selectWall, removeWall, addOpening, selectedWallId
  } = useGeometryStore()
  const [drawStart, setDrawStart] = useState<Point2D | null>(null)
  const [mousePos, setMousePos] = useState<Point2D | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0 })
  const panOffsetStart = useRef({ x: 0, y: 0 })

  // Clear draw start when leaving wall mode
  useEffect(() => {
    if (drawingMode !== 'wall') {
      setDrawStart(null)
    }
  }, [drawingMode])

  // Resize observer
  const containerCallback = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const ro = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect
        setCanvasSize({ width, height })
      })
      ro.observe(node)
      ;(containerRef as React.MutableRefObject<HTMLDivElement>).current = node
    }
  }, [])

  // World to canvas coordinates (before stage transform)
  const toCanvas = (p: Point2D): { x: number; y: number } => {
    return { x: p.x * BASE_SCALE, y: p.y * BASE_SCALE }
  }

  // Canvas (screen) to world coordinates, accounting for zoom and pan
  const screenToWorld = (sx: number, sy: number): Point2D => {
    const wx = (sx - panOffset.x) / (zoom * BASE_SCALE)
    const wy = (sy - panOffset.y) / (zoom * BASE_SCALE)
    return { x: wx, y: wy }
  }

  const storyWalls = walls.filter(w => w.storyIndex === activeStoryIndex)
  const otherWalls = walls.filter(w => w.storyIndex !== activeStoryIndex && w.storyIndex < activeStoryIndex)

  // Find nearest wall to a world point
  const findNearestWall = (point: Point2D, maxDist: number) => {
    let nearest: { wallId: string; dist: number; offset: number } | null = null
    for (const wall of storyWalls) {
      const ax = wall.start.x, ay = wall.start.y
      const bx = wall.end.x, by = wall.end.y
      const dx = bx - ax, dy = by - ay
      const len2 = dx * dx + dy * dy
      if (len2 === 0) continue
      let t = ((point.x - ax) * dx + (point.y - ay) * dy) / len2
      t = Math.max(0, Math.min(1, t))
      const px = ax + t * dx, py = ay + t * dy
      const dist = Math.sqrt((point.x - px) ** 2 + (point.y - py) ** 2)
      if (dist < maxDist && (!nearest || dist < nearest.dist)) {
        nearest = { wallId: wall.id, dist, offset: t * Math.sqrt(len2) }
      }
    }
    return nearest
  }

  const handleClick = (e: any) => {
    if (isPanning.current) return
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    if (!pos) return

    const worldPos = screenToWorld(pos.x, pos.y)
    const snapped: Point2D = { x: snapToGrid(worldPos.x), y: snapToGrid(worldPos.y) }

    if (drawingMode === 'wall') {
      if (!drawStart) {
        setDrawStart(snapped)
      } else {
        const end = constrainOrthogonal(drawStart, snapped)
        const dx = end.x - drawStart.x
        const dy = end.y - drawStart.y
        if (Math.sqrt(dx * dx + dy * dy) > 200) {
          addWall(drawStart, end)
        }
        setDrawStart(end) // chain mode
      }
    } else if (drawingMode === 'opening') {
      // Find wall near click and add opening
      const hit = findNearestWall(worldPos, 500 / zoom) // 500mm threshold scaled by zoom
      if (hit) {
        const wall = storyWalls.find(w => w.id === hit.wallId)
        if (wall) {
          const wallLen = Math.sqrt((wall.end.x - wall.start.x) ** 2 + (wall.end.y - wall.start.y) ** 2)
          const openingWidth = 1000 // 1m default
          const centerOffset = Math.max(openingWidth / 2, Math.min(wallLen - openingWidth / 2, hit.offset))
          addOpening(wall.id, {
            type: 'window',
            width: openingWidth,
            height: 1200,
            sillHeight: 900,
            offsetFromStart: centerOffset - openingWidth / 2,
          })
        }
      }
    }
  }

  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    if (!pos) return

    if (isPanning.current) {
      const dx = pos.x - panStart.current.x
      const dy = pos.y - panStart.current.y
      setPanOffset({
        x: panOffsetStart.current.x + dx,
        y: panOffsetStart.current.y + dy,
      })
      return
    }

    const worldPos = screenToWorld(pos.x, pos.y)
    setMousePos({ x: snapToGrid(worldPos.x), y: snapToGrid(worldPos.y) })
  }

  const handleMouseDown = (e: any) => {
    // Middle mouse button (button 1) or right button (button 2) for pan
    if (e.evt.button === 1 || e.evt.button === 2) {
      isPanning.current = true
      const stage = e.target.getStage()
      const pos = stage.getPointerPosition()
      if (pos) {
        panStart.current = { x: pos.x, y: pos.y }
        panOffsetStart.current = { ...panOffset }
      }
    }
  }

  const handleMouseUp = (e: any) => {
    if (e.evt.button === 1 || e.evt.button === 2) {
      isPanning.current = false
    }
  }

  const handleRightClick = (e: any) => {
    e.evt.preventDefault()
    if (!isPanning.current) {
      setDrawStart(null)
    }
  }

  const handleWheel = (e: any) => {
    e.evt.preventDefault()
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    if (!pos) return

    const direction = e.evt.deltaY < 0 ? 1 : -1
    const factor = 1.12
    const newZoom = direction > 0 ? zoom * factor : zoom / factor
    const clamped = Math.max(0.2, Math.min(8, newZoom))

    // Zoom toward cursor
    const mx = pos.x
    const my = pos.y
    const newPanX = mx - (mx - panOffset.x) * (clamped / zoom)
    const newPanY = my - (my - panOffset.y) * (clamped / zoom)

    setZoom(clamped)
    setPanOffset({ x: newPanX, y: newPanY })
  }

  const handleWallClick = (wallId: string) => {
    if (drawingMode === 'select') {
      selectWall(wallId)
    } else if (drawingMode === 'delete') {
      removeWall(wallId)
    }
  }

  // Draw grid
  const gridLines: { x1: number; y1: number; x2: number; y2: number; major: boolean }[] = []
  const gridRange = 30000 // 30m
  for (let i = -gridRange; i <= gridRange; i += GRID_SIZE) {
    const c1 = toCanvas({ x: i, y: -gridRange })
    const c2 = toCanvas({ x: i, y: gridRange })
    gridLines.push({ x1: c1.x, y1: c1.y, x2: c2.x, y2: c2.y, major: i % 1000 === 0 })
    const c3 = toCanvas({ x: -gridRange, y: i })
    const c4 = toCanvas({ x: gridRange, y: i })
    gridLines.push({ x1: c3.x, y1: c3.y, x2: c4.x, y2: c4.y, major: i % 1000 === 0 })
  }

  return (
    <div ref={containerCallback} className="w-full h-full relative">
      <Stage
        width={canvasSize.width}
        height={canvasSize.height}
        scaleX={zoom}
        scaleY={zoom}
        x={panOffset.x}
        y={panOffset.y}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={handleRightClick}
        onWheel={handleWheel}
      >
        {/* Grid */}
        <Layer listening={false}>
          {gridLines.map((line, i) => (
            <Line
              key={i}
              points={[line.x1, line.y1, line.x2, line.y2]}
              stroke={line.major ? '#cbd5e1' : '#e2e8f0'}
              strokeWidth={(line.major ? 0.8 : 0.3) / zoom}
            />
          ))}
          {/* Origin marker */}
          <Circle x={0} y={0} radius={4 / zoom} fill="#94a3b8" />
          <Line points={[-20 / zoom, 0, 20 / zoom, 0]} stroke="#94a3b8" strokeWidth={1 / zoom} />
          <Line points={[0, -20 / zoom, 0, 20 / zoom]} stroke="#94a3b8" strokeWidth={1 / zoom} />
        </Layer>

        {/* Ghost walls from lower stories */}
        <Layer listening={false} opacity={0.15}>
          {otherWalls.map(wall => {
            const s = toCanvas(wall.start)
            const e = toCanvas(wall.end)
            return (
              <Line
                key={`ghost-${wall.id}`}
                points={[s.x, s.y, e.x, e.y]}
                stroke="#64748b"
                strokeWidth={wall.thickness * BASE_SCALE}
                lineCap="round"
              />
            )
          })}
        </Layer>

        {/* Active story walls */}
        <Layer>
          {storyWalls.map(wall => {
            const s = toCanvas(wall.start)
            const e = toCanvas(wall.end)
            const isSelected = wall.id === selectedWallId
            return (
              <Group key={wall.id} onClick={() => handleWallClick(wall.id)}>
                <Line
                  points={[s.x, s.y, e.x, e.y]}
                  stroke={isSelected ? '#f59e0b' : '#5c4a32'}
                  strokeWidth={wall.thickness * BASE_SCALE}
                  lineCap="round"
                  hitStrokeWidth={20 / zoom}
                />
                {/* Openings */}
                {wall.openings.map(opening => {
                  const wallDx = wall.end.x - wall.start.x
                  const wallDy = wall.end.y - wall.start.y
                  const len = Math.sqrt(wallDx * wallDx + wallDy * wallDy)
                  if (len === 0) return null
                  const nx = wallDx / len
                  const ny = wallDy / len
                  const oStart = {
                    x: wall.start.x + nx * opening.offsetFromStart,
                    y: wall.start.y + ny * opening.offsetFromStart,
                  }
                  const oEnd = {
                    x: oStart.x + nx * opening.width,
                    y: oStart.y + ny * opening.width,
                  }
                  const cs = toCanvas(oStart)
                  const ce = toCanvas(oEnd)
                  return (
                    <Line
                      key={opening.id}
                      points={[cs.x, cs.y, ce.x, ce.y]}
                      stroke={opening.type === 'door' ? '#2563eb' : '#0891b2'}
                      strokeWidth={wall.thickness * BASE_SCALE + 2 / zoom}
                      lineCap="butt"
                    />
                  )
                })}
                {/* Dimension label */}
                {isSelected && (() => {
                  const len = Math.sqrt((wall.end.x - wall.start.x) ** 2 + (wall.end.y - wall.start.y) ** 2)
                  return (
                    <Text
                      x={(s.x + e.x) / 2 - 20 / zoom}
                      y={(s.y + e.y) / 2 - 18 / zoom}
                      text={`${(len / 1000).toFixed(2)}m`}
                      fontSize={11 / zoom}
                      fill="#f59e0b"
                      fontStyle="bold"
                    />
                  )
                })()}
              </Group>
            )
          })}

          {/* Drawing preview */}
          {drawStart && mousePos && drawingMode === 'wall' && (() => {
            const end = constrainOrthogonal(drawStart, mousePos)
            const s = toCanvas(drawStart)
            const e = toCanvas(end)
            const len = Math.sqrt((end.x - drawStart.x) ** 2 + (end.y - drawStart.y) ** 2)
            return (
              <>
                <Line
                  points={[s.x, s.y, e.x, e.y]}
                  stroke="#f59e0b"
                  strokeWidth={120 * BASE_SCALE}
                  dash={[8 / zoom, 4 / zoom]}
                  opacity={0.6}
                />
                <Text
                  x={(s.x + e.x) / 2 - 20 / zoom}
                  y={(s.y + e.y) / 2 - 18 / zoom}
                  text={`${(len / 1000).toFixed(2)}m`}
                  fontSize={12 / zoom}
                  fill="#f59e0b"
                  fontStyle="bold"
                />
                <Circle x={s.x} y={s.y} radius={5 / zoom} fill="#f59e0b" />
              </>
            )
          })()}

          {/* Snap cursor */}
          {mousePos && (drawingMode === 'wall' || drawingMode === 'opening') && (() => {
            const c = toCanvas(drawStart ? constrainOrthogonal(drawStart, mousePos) : mousePos)
            return (
              <Circle
                x={c.x}
                y={c.y}
                radius={4 / zoom}
                fill={drawingMode === 'opening' ? '#0891b2' : '#f59e0b'}
                stroke="#fff"
                strokeWidth={1 / zoom}
              />
            )
          })()}
        </Layer>
      </Stage>

      {/* Zoom indicator (overlay) */}
      <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded px-2 py-1 text-[10px] text-slate-500 font-mono pointer-events-none">
        {(zoom * 100).toFixed(0)}%
        {mousePos && (
          <span className="ml-2">
            ({(mousePos.x / 1000).toFixed(2)}, {(mousePos.y / 1000).toFixed(2)})m
          </span>
        )}
      </div>

      {/* Scale bar (overlay) */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 pointer-events-none">
        <div style={{ width: 1000 * BASE_SCALE * zoom }} className="h-0.5 bg-slate-500" />
        <span className="text-[10px] text-slate-500 font-mono">1m</span>
      </div>
    </div>
  )
}
