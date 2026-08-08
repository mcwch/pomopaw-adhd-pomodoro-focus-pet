import { useState } from 'react'
import type { TodayTask } from '../today-tasks'

export default function TodayRail({ tasks, onAdd, onToggle, onChoose }: { tasks: TodayTask[]; onAdd: (title: string) => boolean | void; onToggle: (id: string) => void; onChoose: (title: string) => void }): React.JSX.Element {
  const [title, setTitle] = useState('')
  const [atLimit, setAtLimit] = useState(false)
  const activeCount = tasks.filter((task) => !task.completed).length
  const addTask = (event: React.FormEvent) => {
    event.preventDefault()
    const added = onAdd(title)
    setAtLimit(added === false)
    if (added !== false) setTitle('')
  }

  return <aside className="today-rail" aria-label="Today"><div className="rail-heading"><p className="eyebrow">Today</p><h2>Choose one small thing.</h2></div><ol>{tasks.map((task) => <li key={task.id} className={task.completed ? 'task-row task-row--complete' : 'task-row'}><button className="task-choice" onClick={() => onChoose(task.title)} disabled={task.completed}>{task.title}</button><button className="task-toggle" aria-label={task.completed ? `Mark ${task.title} not done` : `Mark ${task.title} done`} onClick={() => onToggle(task.id)}>{task.completed ? 'Done' : 'Mark done'}</button></li>)}</ol><form className="add-task" onSubmit={addTask}><label htmlFor="today-task">Add a small task for today</label><div><input id="today-task" value={title} onChange={(event) => { setTitle(event.target.value); setAtLimit(false) }} placeholder="e.g. read two pages" autoComplete="off" /><button type="submit">Add task</button></div></form>{atLimit ? <p className="limit-copy">Finish or mark one task done before adding another.</p> : <p className="quiet-copy">{activeCount}/3 active tasks. Keep this list deliberately small.</p>}</aside>
}
