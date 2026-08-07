import { useState } from 'react'

export interface TodayTask { id: string; title: string }

export default function TodayBoard({ initialTasks }: { initialTasks: TodayTask[] }): React.JSX.Element {
  const [activeTasks, setActiveTasks] = useState(initialTasks.slice(0, 3))
  const [completedTasks, setCompletedTasks] = useState<TodayTask[]>([])
  const complete = (task: TodayTask): void => {
    setActiveTasks((tasks) => tasks.filter(({ id }) => id !== task.id))
    setCompletedTasks((tasks) => [...tasks, task])
  }
  return <section className="today-board"><div><p className="eyebrow">TODAY</p><strong>{activeTasks.length} of 3 active tasks</strong></div><ul>{activeTasks.map((task) => <li key={task.id}><span>{task.title}</span><button className="quiet" onClick={() => complete(task)} aria-label={`Complete ${task.title}`}>Done</button></li>)}</ul>{completedTasks.map((task) => <p key={task.id}>Completed today: {task.title}</p>)}</section>
}
