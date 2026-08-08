import { useEffect, useRef, useState } from 'react'
import type { TimerSnapshot } from '../../shared/timer'
import { isCompletedFocusTransition } from '../celebration'
import { addTodayTask, loadTodayTasks, saveTodayTasks, toggleTodayTask, type TodayTask } from '../today-tasks'
import FocusCanvas from './FocusCanvas'
import StudyCorner from './StudyCorner'
import TodayRail from './TodayRail'

export default function StudyDesk({ snapshot, stars, onStart, onPause, onResume, onEndEarly }: { snapshot: TimerSnapshot; stars: number; onStart: (title: string) => void; onPause: () => void; onResume: () => void; onEndEarly: () => void }): React.JSX.Element {
  const [tasks, setTasks] = useState<TodayTask[]>(() => loadTodayTasks())
  const [celebrating, setCelebrating] = useState(false)
  const previousSnapshot = useRef(snapshot)
  useEffect(() => {
    const previous = previousSnapshot.current
    previousSnapshot.current = snapshot
    if (!isCompletedFocusTransition(previous, snapshot)) return
    setCelebrating(true)
    const timeout = window.setTimeout(() => setCelebrating(false), 3600)
    return () => window.clearTimeout(timeout)
  }, [snapshot])
  const addTask = (title: string): boolean => {
    const result = addTodayTask(tasks, title, crypto.randomUUID)
    if (result.added) { setTasks(result.tasks); saveTodayTasks(result.tasks) }
    return result.added
  }
  const toggleTask = (id: string) => { const next = toggleTodayTask(tasks, id); setTasks(next); saveTodayTasks(next) }
  return <main className="study-desk"><TodayRail tasks={tasks} onAdd={addTask} onToggle={toggleTask} onChoose={onStart} /><FocusCanvas snapshot={snapshot} onStart={onStart} onPause={onPause} onResume={onResume} onEndEarly={onEndEarly} /><StudyCorner phase={snapshot.phase} stars={stars} celebrating={celebrating} /></main>
}
