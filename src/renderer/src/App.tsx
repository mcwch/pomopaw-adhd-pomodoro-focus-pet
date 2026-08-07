import { useEffect, useState } from 'react'

function App(): React.JSX.Element {
  const [task, setTask] = useState('')
  const [started, setStarted] = useState(false)
  const [confirmingEnd, setConfirmingEnd] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60)

  useEffect(() => {
    if (!started) return
    const interval = window.setInterval(() => setRemainingSeconds((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearInterval(interval)
  }, [started])

  if (!started) {
    return <main className="start-screen"><p className="eyebrow">FOCUS COMPANION</p><h1>One small step is enough.</h1><label htmlFor="task">What do you want to move forward right now?</label><input id="task" value={task} onChange={(event) => setTask(event.target.value)} placeholder="e.g. outline my report" /><button disabled={!task.trim()} onClick={() => { setRemainingSeconds(25 * 60); setStarted(true) }}>Start 25 minutes</button></main>
  }

  const clock = `${Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:${(remainingSeconds % 60).toString().padStart(2, '0')}`
  return <main className="timer-screen"><p className="eyebrow">FOCUSING ON</p><h1>{task}</h1><time>{clock}</time>{confirmingEnd ? <section role="dialog"><p>Record and end? This will save your focused minutes but not count as a completed Pomodoro.</p><button onClick={() => setStarted(false)}>Record and end</button><button onClick={() => setConfirmingEnd(false)}>Keep focusing</button></section> : <button className="quiet" onClick={() => setConfirmingEnd(true)}>End early</button>}</main>
}

export default App
