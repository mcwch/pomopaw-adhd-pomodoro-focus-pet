import { useEffect, useState } from 'react'
import type { TimerSnapshot } from '../../shared/timer'
import { startAmbientSound, stopAmbientSound } from '../ambient-sound'
import SoundControls, { type SoundId } from './SoundControls'

function clock(snapshot: TimerSnapshot, now: number): string {
  const seconds = snapshot.phase === 'paused' ? snapshot.remainingSeconds ?? 0 : Math.max(0, Math.ceil((Date.parse(snapshot.targetEndsAt ?? '') - now) / 1000))
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
}

function useDisplayTime(active: boolean): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const refresh = window.setTimeout(() => setNow(Date.now()), 0)
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => { window.clearTimeout(refresh); window.clearInterval(interval) }
  }, [active])
  return now
}

export interface FocusCanvasProps {
  readonly snapshot: TimerSnapshot
  readonly selectedTask?: string
  readonly onStart: (title: string) => void
  readonly onPause: () => void
  readonly onResume: () => void
  readonly onEndEarly: () => void
}

export default function FocusCanvas({ snapshot, selectedTask, onStart, onPause, onResume, onEndEarly }: FocusCanvasProps): React.JSX.Element {
  const [title, setTitle] = useState('')
  const [sound, setSound] = useState<SoundId>('none')
  const now = useDisplayTime(snapshot.phase !== 'idle' && snapshot.phase !== 'paused')
  const sessionActive = snapshot.phase === 'focus' || snapshot.phase === 'short_break' || snapshot.phase === 'long_break'
  useEffect(() => () => stopAmbientSound(), [])

  const chooseSound = (nextSound: SoundId): void => {
    setSound(nextSound)
    if (sessionActive) startAmbientSound(nextSound)
  }
  const begin = (): void => {
    const task = selectedTask?.trim() || title.trim() || 'A small next step'
    startAmbientSound(sound)
    onStart(task)
  }
  const pause = (): void => { stopAmbientSound(); onPause() }
  const resume = (): void => { startAmbientSound(sound); onResume() }
  const endEarly = (): void => { stopAmbientSound(); onEndEarly() }

  if (snapshot.phase === 'idle') return <section className="focus-canvas focus-canvas--idle" aria-label="Focus timer">
    <div className="focus-canvas__content">
      <div className="focus-task-pill"><span>Focusing on:</span><strong>{selectedTask || 'your next small step'}</strong></div>
      {!selectedTask && <form className="focus-task-form" onSubmit={(event) => { event.preventDefault(); begin() }}>
        <label htmlFor="focus-task">What do you want to move forward right now?</label>
        <input id="focus-task" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. outline the first section" autoComplete="off" />
      </form>}
      <div className="timer-ring" aria-label="25 minute timer"><time dateTime="PT25M">25:00</time></div>
      <button className="primary-action focus-start" type="button" onClick={begin}>Start 25 minutes</button>
      <SoundControls value={sound} onChange={chooseSound} />
      <p className="quiet-copy">A verified full 25-minute focus earns one star. Ending early keeps your real minutes, without a star.</p>
    </div>
  </section>

  const paused = snapshot.phase === 'paused'
  const inBreak = snapshot.phase === 'short_break' || snapshot.phase === 'long_break' || snapshot.pausedFrom === 'short_break' || snapshot.pausedFrom === 'long_break'
  const heading = inBreak ? 'Take a real pause.' : snapshot.task?.title ?? 'Focus session'
  return <section className="focus-canvas" aria-label="Focus timer"><div className="focus-canvas__content"><p className="eyebrow">{inBreak ? 'Break time' : 'Focus session'}</p><h1>{heading}</h1><div className="timer-ring"><time dateTime={`PT${snapshot.remainingSeconds ?? 0}S`}>{clock(snapshot, now)}</time></div><div className="timer-actions">{paused ? <button className="primary-action" onClick={resume}>Resume timer</button> : <button className="primary-action" onClick={pause}>Pause timer</button>}{!inBreak && <button className="secondary-action" onClick={endEarly}>End early</button>}</div><SoundControls value={sound} onChange={chooseSound} /><p className="quiet-copy">{inBreak ? 'The next focus block will be ready when this break ends.' : 'A verified full 25-minute focus earns one star. Ending early keeps your real minutes, without a star.'}</p></div></section>
}
