import { useEffect, useState } from 'react'
import { createAmbientSound, type AmbientSound } from './audio'
import TodayBoard from './components/TodayBoard'
import Companion from './components/Companion'
import StudyCorner from './components/StudyCorner'
import type { TodayTask } from './components/TodayBoard'
import ChooseHelp from './components/ChooseHelp'
import LocalAiStatus from './components/LocalAiStatus'
import LocalAiFirstStep from './components/LocalAiFirstStep'
import OverlayApp from './OverlayApp'

function App(): React.JSX.Element {
  const overlayTask = new URLSearchParams(window.location.search).get('task')
  if (new URLSearchParams(window.location.search).get('overlay') === '1') return <OverlayApp task={overlayTask || 'Your focus session'} />
  const [task, setTask] = useState('')
  const [started, setStarted] = useState(false)
  const [confirmingEnd, setConfirmingEnd] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60)
  const [sound, setSound] = useState('white_noise')
  const [volume, setVolume] = useState(50)
  const [stars, setStars] = useState(0)
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>([])
  const [paused, setPaused] = useState(false)
  const [onBreak, setOnBreak] = useState(false)

  useEffect(() => {
    if (!started || paused) return
    const interval = window.setInterval(() => setRemainingSeconds((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearInterval(interval)
  }, [paused, started])

  useEffect(() => {
    if (!started) return
    return createAmbientSound(sound as AmbientSound, volume)
  }, [sound, started, volume])

  useEffect(() => {
    if (started && remainingSeconds === 0) {
      setStars((value) => value + 1)
      setStarted(false)
      setOnBreak(true)
      const overlayRequest = window.focusApp?.setOverlayVisible?.({ visible: false })
      void overlayRequest?.catch(() => undefined)
    }
  }, [remainingSeconds, started])

  if (onBreak) {
    return <main className="start-screen"><Companion state="break" /><StudyCorner stars={stars} /><p className="eyebrow">SHORT BREAK</p><h1>Take a 5 minute break</h1><p>Stretch, drink water, or look away from the screen.</p><button onClick={() => setOnBreak(false)}>Back when ready</button></main>
  }

  if (!started) {
    return <main className="start-screen"><Companion state={stars > 0 ? 'celebrate' : 'idle'} /><StudyCorner stars={stars} /><p className="eyebrow">FOCUS COMPANION</p><h1>One small step is enough.</h1><label htmlFor="task">What do you want to move forward right now?</label><input id="task" value={task} onChange={(event) => setTask(event.target.value)} placeholder="e.g. outline my report" /><LocalAiFirstStep task={task} /><button disabled={!task.trim()} onClick={() => { if (!todayTasks.some(({ title }) => title === task) && todayTasks.length < 3) setTodayTasks((tasks) => [...tasks, { id: crypto.randomUUID(), title: task }]); const overlayRequest = window.focusApp?.setOverlayVisible?.({ visible: true, task }); void overlayRequest?.catch(() => undefined); setRemainingSeconds(25 * 60); setPaused(false); setStarted(true) }}>Start 25 minutes</button><ChooseHelp tasks={todayTasks.map((item) => ({ ...item, status: 'today', energy: 'low' as const, completedPomodoros: 0 }))} /><TodayBoard initialTasks={todayTasks} /><LocalAiStatus /></main>
  }

  const clock = `${Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:${(remainingSeconds % 60).toString().padStart(2, '0')}`
  return <main className="timer-screen"><Companion state="focus" /><p className="eyebrow">FOCUSING ON</p><h1>{task}</h1><time>{clock}</time><label className="sound-control">Ambient sound<select aria-label="Ambient sound" value={sound} onChange={(event) => setSound(event.target.value)}><option value="white_noise">White noise</option><option value="rain">Rain</option><option value="cafe">Cafe</option><option value="forest">Forest</option></select></label><label className="sound-control">Ambient volume<input aria-label="Ambient volume" type="number" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></label><button className="quiet" onClick={() => setPaused((value) => !value)}>{paused ? 'Resume timer' : 'Pause timer'}</button>{confirmingEnd ? <section role="dialog"><p>Record and end? This will save your focused minutes but not count as a completed Pomodoro.</p><button onClick={() => { const overlayRequest = window.focusApp?.setOverlayVisible?.({ visible: false }); void overlayRequest?.catch(() => undefined); setStarted(false) }}>Record and end</button><button onClick={() => setConfirmingEnd(false)}>Keep focusing</button></section> : <button className="quiet" onClick={() => setConfirmingEnd(true)}>End early</button>}</main>
}

export default App
