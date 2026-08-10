import { useEffect, useRef, useState } from 'react'
import type { TimerSnapshot } from '../../shared/timer'
import { isCompletedFocusTransition } from '../celebration'
import { addTodayTask, loadTodayTasks, saveTodayTasks, toggleTodayTask, type TodayTask } from '../today-tasks'
import FocusCanvas from './FocusCanvas'
import StudyCorner from './StudyCorner'
import TodayRail from './TodayRail'

export interface StudyDeskProps { readonly snapshot: TimerSnapshot; readonly stars: number; readonly onStart: (title: string) => void; readonly onPause: () => void; readonly onResume: () => void; readonly onEndEarly: () => void }

export default function StudyDesk({ snapshot, stars, onStart, onPause, onResume, onEndEarly }: StudyDeskProps): React.JSX.Element {
  const [tasks, setTasks] = useState<TodayTask[]>(() => loadTodayTasks())
  const [selectedTask, setSelectedTask] = useState(() => loadTodayTasks().find((task) => !task.completed)?.title ?? '')
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
    const result = addTodayTask(tasks, title, () => crypto.randomUUID())
    if (result.added) { setTasks(result.tasks); setSelectedTask((current) => current || title.trim()); saveTodayTasks(result.tasks) }
    return result.added
  }
  const toggleTask = (id: string): void => { const next = toggleTodayTask(tasks, id); setTasks(next); saveTodayTasks(next) }
  return <main className="study-desk"><TodayRail tasks={tasks} onAdd={addTask} onToggle={toggleTask} onChoose={setSelectedTask} /><FocusCanvas snapshot={snapshot} selectedTask={selectedTask} onStart={onStart} onPause={onPause} onResume={onResume} onEndEarly={onEndEarly} /><StudyCorner phase={snapshot.phase} stars={stars} celebrating={celebrating} /></main>
}
