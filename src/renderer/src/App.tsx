import { useState } from 'react'

function App(): React.JSX.Element {
  const [task, setTask] = useState('')
  const [started, setStarted] = useState(false)
  const [confirmingEnd, setConfirmingEnd] = useState(false)

  if (!started) {
    return <main className="start-screen"><p className="eyebrow">FOCUS COMPANION</p><h1>One small step is enough.</h1><label htmlFor="task">What do you want to move forward right now?</label><input id="task" value={task} onChange={(event) => setTask(event.target.value)} placeholder="e.g. outline my report" /><button disabled={!task.trim()} onClick={() => setStarted(true)}>Start 25 minutes</button></main>
  }

  return <main className="timer-screen"><p className="eyebrow">FOCUSING ON</p><h1>{task}</h1><time>25:00</time>{confirmingEnd ? <section role="dialog"><p>Record and end? This will save your focused minutes but not count as a completed Pomodoro.</p><button onClick={() => setStarted(false)}>Record and end</button><button onClick={() => setConfirmingEnd(false)}>Keep focusing</button></section> : <button className="quiet" onClick={() => setConfirmingEnd(true)}>End early</button>}</main>
}

export default App
