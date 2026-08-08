import { useEffect, useState } from 'react'
import Companion from './components/Companion'
import { idleTimer, type TimerSnapshot } from '../../shared/timer'

function remaining(snapshot: TimerSnapshot): string {
  const seconds = snapshot.phase === 'paused' ? snapshot.remainingSeconds ?? 0 : Math.max(0, Math.ceil((Date.parse(snapshot.targetEndsAt ?? '') - Date.now()) / 1000))
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
}

function OverlayApp({ snapshot, task }: { snapshot?: TimerSnapshot; task?: string }): React.JSX.Element {
  const [current, setCurrent] = useState<TimerSnapshot>(snapshot ?? idleTimer())
  useEffect(() => {
    if (snapshot) return
    void window.focusApp.timerHydrate().then(({ snapshot }) => setCurrent(snapshot))
    return window.focusApp.onTimerSnapshot(setCurrent)
  }, [snapshot])
  const title = current.task?.title ?? task ?? 'Your focus session'
  return <main className="overlay-screen"><Companion state={current.phase === 'focus' ? 'focus' : 'break'} /><div><p className="eyebrow">FOCUS COMPANION</p><strong>{title}</strong>{current.phase !== 'idle' && <time>{remaining(current)}</time>}</div></main>
}

export default OverlayApp
