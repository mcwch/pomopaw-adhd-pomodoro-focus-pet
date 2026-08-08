import type { TimerSnapshot } from '../../shared/timer'

function clock(snapshot: TimerSnapshot): string {
  const seconds = snapshot.phase === 'paused' ? snapshot.remainingSeconds ?? 0 : Math.max(0, Math.ceil((Date.parse(snapshot.targetEndsAt ?? '') - Date.now()) / 1000))
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
}

export default function FocusCanvas({ snapshot, onStart, onPause, onResume, onEndEarly }: { snapshot: TimerSnapshot; onStart: (title: string) => void; onPause: () => void; onResume: () => void; onEndEarly: () => void }): React.JSX.Element {
  if (snapshot.phase === 'idle') return <section aria-label="Focus timer"><h1>One small step is enough.</h1><button onClick={() => onStart('A small next step')}>Start 25 minutes</button></section>
  const paused = snapshot.phase === 'paused'
  return <section aria-label="Focus timer"><p>{snapshot.task?.title}</p><time>{clock(snapshot)}</time>{paused ? <button onClick={onResume}>Resume timer</button> : <button onClick={onPause}>Pause timer</button>}<button onClick={onEndEarly}>End early</button></section>
}
