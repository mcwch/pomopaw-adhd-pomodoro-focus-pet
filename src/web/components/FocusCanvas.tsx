import { useEffect, useState } from 'react'
import type { TimerSnapshot } from '../../shared/timer'

function clock(snapshot: TimerSnapshot, now: number): string {
  const seconds = snapshot.phase === 'paused' ? snapshot.remainingSeconds ?? 0 : Math.max(0, Math.ceil((Date.parse(snapshot.targetEndsAt ?? '') - now) / 1000))
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
}

function useDisplayTime(active: boolean): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    setNow(Date.now())
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [active])
  return now
}

export default function FocusCanvas({ snapshot, onStart, onPause, onResume, onEndEarly }: { snapshot: TimerSnapshot; onStart: (title: string) => void; onPause: () => void; onResume: () => void; onEndEarly: () => void }): React.JSX.Element {
  const [title, setTitle] = useState('')
  const now = useDisplayTime(snapshot.phase !== 'idle' && snapshot.phase !== 'paused')
  if (snapshot.phase === 'idle') return <section className="focus-canvas focus-canvas--idle" aria-label="Focus timer"><p className="eyebrow">Your next focus session</p><h1>Choose one small thing.</h1><form onSubmit={(event) => { event.preventDefault(); onStart(title.trim() || 'A small next step') }}><label htmlFor="focus-task">What do you want to move forward right now?</label><input id="focus-task" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. outline the first section" autoComplete="off" /><button type="submit">Start 25 minutes</button></form><p className="quiet-copy">A finished 25-minute session earns one star. Ending early keeps the time, without a star.</p></section>
  const paused = snapshot.phase === 'paused'
  const inBreak = snapshot.phase === 'short_break' || snapshot.phase === 'long_break' || snapshot.pausedFrom === 'short_break' || snapshot.pausedFrom === 'long_break'
  const heading = inBreak ? 'Take a real pause.' : snapshot.task?.title ?? 'Focus session'
  return <section className="focus-canvas" aria-label="Focus timer"><p className="eyebrow">{inBreak ? 'Break time' : 'Focus session'}</p><h1>{heading}</h1><div className="timer-ring"><time dateTime={`PT${snapshot.remainingSeconds ?? 0}S`}>{clock(snapshot, now)}</time></div><div className="timer-actions">{paused ? <button className="primary-action" onClick={onResume}>Resume timer</button> : <button className="primary-action" onClick={onPause}>Pause timer</button>}{!inBreak && <button className="secondary-action" onClick={onEndEarly}>End early</button>}</div><p className="quiet-copy">{inBreak ? 'The next focus block will be ready when this break ends.' : 'Only the timer service changes session state; this screen only displays it.'}</p></section>
}
