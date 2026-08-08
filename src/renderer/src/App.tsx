import { useEffect, useState } from 'react'
import { createAmbientSound, type AmbientSound } from './audio'
import Companion from './components/Companion'
import StudyCorner from './components/StudyCorner'
import OverlayApp from './OverlayApp'
import { useFocusStore } from './store'

function format(snapshot: ReturnType<typeof useFocusStore.getState>['snapshot']): string {
  const seconds = snapshot.phase === 'paused' ? snapshot.remainingSeconds ?? 0 : Math.max(0, Math.ceil((Date.parse(snapshot.targetEndsAt ?? '') - Date.now()) / 1000))
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
}

function App(): React.JSX.Element {
  if (new URLSearchParams(window.location.search).get('overlay') === '1') return <OverlayApp task={new URLSearchParams(window.location.search).get('task') || 'Your focus session'} />
  const { hydrated, snapshot, recovery, hydrate, start, pause, resume, endEarly, resolveRecovery } = useFocusStore()
  const [task, setTask] = useState(''); const [confirmingEnd, setConfirmingEnd] = useState(false); const [sound, setSound] = useState('white_noise'); const [volume, setVolume] = useState(50)
  useEffect(() => { void hydrate() }, [hydrate])
  useEffect(() => snapshot.phase === 'focus' ? createAmbientSound(sound as AmbientSound, volume) : undefined, [snapshot.phase, sound, volume])
  if (!hydrated) return <main className="start-screen"><p>Loading your focus timer…</p></main>
  if (recovery) return <main className="start-screen"><Companion state="idle" /><h1>Your timer finished while the app was closed.</h1><p>{Math.floor(recovery.elapsedSeconds / 60)} minutes can be recorded without a star.</p><button onClick={() => void resolveRecovery('record_partial')}>Record elapsed time only</button><button onClick={() => void resolveRecovery('discard')}>Discard this session</button></main>
  if (snapshot.phase === 'short_break' || snapshot.phase === 'long_break') return <main className="start-screen"><Companion state="break" /><p className="eyebrow">{snapshot.phase === 'long_break' ? 'LONG BREAK' : 'SHORT BREAK'}</p><h1>Take a {snapshot.phase === 'long_break' ? '15' : '5'} minute break</h1><time>{format(snapshot)}</time></main>
  if (snapshot.phase === 'idle') return <main className="start-screen"><Companion state="idle" /><StudyCorner stars={0} /><p className="eyebrow">FOCUS COMPANION</p><h1>One small step is enough.</h1><label htmlFor="task">What do you want to move forward right now?</label><input id="task" value={task} onChange={(event) => setTask(event.target.value)} placeholder="e.g. outline my report" /><button disabled={!task.trim()} onClick={() => void start({ id: crypto.randomUUID(), title: task.trim() })}>Start 25 minutes</button></main>
  const paused = snapshot.phase === 'paused'
  return <main className="timer-screen"><Companion state="focus" /><p className="eyebrow">FOCUSING ON</p><h1>{snapshot.task?.title}</h1><time>{format(snapshot)}</time><label className="sound-control">Ambient sound<select aria-label="Ambient sound" value={sound} onChange={(event) => setSound(event.target.value)}><option value="white_noise">White noise</option><option value="rain">Rain</option><option value="cafe">Cafe</option><option value="forest">Forest</option></select></label><label className="sound-control">Ambient volume<input aria-label="Ambient volume" type="number" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></label><button className="quiet" onClick={() => void (paused ? resume() : pause())}>{paused ? 'Resume timer' : 'Pause timer'}</button>{confirmingEnd ? <section role="dialog"><p>Record and end? This will save your focused minutes but not count as a completed Pomodoro.</p><button onClick={() => void endEarly()}>Record and end</button><button onClick={() => setConfirmingEnd(false)}>Keep focusing</button></section> : <button className="quiet" onClick={() => setConfirmingEnd(true)}>End early</button>}</main>
}

export default App
