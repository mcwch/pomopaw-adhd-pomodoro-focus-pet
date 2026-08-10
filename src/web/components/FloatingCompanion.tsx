import { useEffect, useMemo, useRef, useState } from 'react'
import type { TimerPhase } from '../../shared/timer'
import stitchStudyLion from '../assets/lion/stitch-study-desk-transparent.png'

interface FloatingPosition {
  readonly x: number
  readonly y: number
}

export interface FloatingCompanionProps {
  readonly phase: TimerPhase
  readonly page: 'focus' | 'progress'
  readonly celebrating?: boolean
}

const POSITION_KEY = 'focus-companion:floating-position'

function defaultPosition(): FloatingPosition {
  return { x: Math.max(16, window.innerWidth - 224), y: Math.max(92, window.innerHeight - 214) }
}

function readPosition(): FloatingPosition {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(POSITION_KEY) ?? '') as Partial<FloatingPosition>
    if (typeof parsed.x === 'number' && typeof parsed.y === 'number') return parsed
  } catch {
    // Fall back to the comfortable bottom-right position on malformed local state.
  }
  return defaultPosition()
}

function clampPosition(position: FloatingPosition): FloatingPosition {
  const width = 190
  const height = 182
  return {
    x: Math.min(Math.max(10, position.x), Math.max(10, window.innerWidth - width)),
    y: Math.min(Math.max(76, position.y), Math.max(76, window.innerHeight - height)),
  }
}

export default function FloatingCompanion({ phase, page, celebrating = false }: FloatingCompanionProps): React.JSX.Element {
  const [position, setPosition] = useState<FloatingPosition>(() => clampPosition(readPosition()))
  const [hidden, setHidden] = useState(false)
  const [dragging, setDragging] = useState(false)
  const dragOffset = useRef<FloatingPosition>({ x: 0, y: 0 })

  const status = useMemo(() => {
    if (celebrating) return 'Blue-maned lion celebrating after a completed focus session'
    if (phase === 'focus') return 'Blue-maned lion studying with you'
    if (phase === 'short_break' || phase === 'long_break' || phase === 'paused') return 'Blue-maned lion resting during a break'
    return page === 'progress' ? 'Blue-maned lion keeping your place' : 'Blue-maned lion companion ready to study'
  }, [celebrating, page, phase])

  useEffect(() => {
    const onResize = (): void => setPosition((current) => clampPosition(current))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!dragging) return
    const onMove = (event: PointerEvent): void => {
      const next = clampPosition({ x: event.clientX - dragOffset.current.x, y: event.clientY - dragOffset.current.y })
      setPosition(next)
    }
    const onUp = (): void => setDragging(false)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp, { once: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [dragging])

  useEffect(() => {
    window.localStorage.setItem(POSITION_KEY, JSON.stringify(position))
  }, [position])

  if (hidden) {
    return <button className="floating-companion__reopen" type="button" onClick={() => setHidden(false)} aria-label="Show study companion">Show companion</button>
  }

  return <aside
    className={`floating-companion${dragging ? ' floating-companion--dragging' : ''}${celebrating ? ' floating-companion--celebrating' : ''}`}
    style={{ left: position.x, top: position.y }}
    aria-label="Floating study companion"
  >
    <button
      className="floating-companion__pet"
      type="button"
      aria-label="Drag study companion"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture?.(event.pointerId)
        dragOffset.current = { x: event.clientX - position.x, y: event.clientY - position.y }
        setDragging(true)
      }}
    >
      <img src={stitchStudyLion} alt={status} draggable="false" />
    </button>
    <button className="floating-companion__hide" type="button" onClick={() => setHidden(true)} aria-label="Hide study companion">×</button>
  </aside>
}
