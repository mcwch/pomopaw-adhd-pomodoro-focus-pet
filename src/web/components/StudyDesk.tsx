import { useState } from 'react'
import type { TimerSnapshot } from '../../shared/timer'
import { addTodayTask, loadTodayTasks, saveTodayTasks, toggleTodayTask, type TodayTask } from '../today-tasks'
import FocusCanvas from './FocusCanvas'
import TodayRail from './TodayRail'

export interface StudyDeskProps { readonly snapshot: TimerSnapshot; readonly onStart: (title: string) => void; readonly onPause: () => void; readonly onResume: () => void; readonly onEndEarly: () => void }

export default function StudyDesk({ snapshot, onStart, onPause, onResume, onEndEarly }: StudyDeskProps): React.JSX.Element {
  const [tasks, setTasks] = useState<TodayTask[]>(() => loadTodayTasks())
  const [selectedTask, setSelectedTask] = useState(() => loadTodayTasks().find((task) => !task.completed)?.title ?? '')
  const addTask = (title: string): boolean => {
    const result = addTodayTask(tasks, title, () => crypto.randomUUID())
    if (result.added) { setTasks(result.tasks); setSelectedTask((current) => current || title.trim()); saveTodayTasks(result.tasks) }
    return result.added
  }
  const toggleTask = (id: string): void => { const next = toggleTodayTask(tasks, id); setTasks(next); saveTodayTasks(next) }
  return <main className="study-desk"><TodayRail tasks={tasks} onAdd={addTask} onToggle={toggleTask} onChoose={setSelectedTask} /><FocusCanvas snapshot={snapshot} selectedTask={selectedTask} onStart={onStart} onPause={onPause} onResume={onResume} onEndEarly={onEndEarly} /></main>
}
