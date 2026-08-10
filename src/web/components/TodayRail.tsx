import { useMemo, useState } from 'react'
import type { TodayTask } from '../today-tasks'
import { getLocalFirstStep } from '../local-ai'

export interface TodayRailProps {
  readonly tasks: TodayTask[]
  readonly onAdd: (title: string) => boolean | void
  readonly onToggle: (id: string) => void
  readonly onChoose: (title: string) => void
  readonly onUseSuggestion?: (suggestion: string) => void
}

export default function TodayRail({ tasks, onAdd, onToggle, onChoose, onUseSuggestion }: TodayRailProps): React.JSX.Element {
  const [title, setTitle] = useState('')
  const [atLimit, setAtLimit] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [aiMessage, setAiMessage] = useState('')
  const activeCount = tasks.filter((task) => !task.completed).length
  const aiTask = useMemo(() => title.trim() || tasks.find((task) => !task.completed)?.title || '', [tasks, title])

  const addTask = (event: React.FormEvent): void => {
    event.preventDefault()
    const added = onAdd(title)
    setAtLimit(added === false)
    if (added !== false) { setTitle(''); setSuggestion(null); setAiMessage('') }
  }

  const askLocalAi = async (): Promise<void> => {
    if (!aiTask) { setAiMessage('Add a task first, then I can shrink it into one step.'); return }
    setThinking(true); setSuggestion(null); setAiMessage('')
    const result = await getLocalFirstStep(aiTask)
    setThinking(false)
    if (result.suggestion) setSuggestion(result.suggestion)
    else setAiMessage(result.available ? 'I could not find a smaller step yet. Try a little more detail.' : 'Local AI is unavailable. Focus Companion still works without it.')
  }

  const useSuggestion = (): void => {
    if (!suggestion) return
    setTitle(suggestion)
    setSuggestion(null)
    setAiMessage('Prefilled below — add it when you are ready.')
    onUseSuggestion?.(suggestion)
  }

  return <aside className="today-rail" aria-label="Today">
    <div className="rail-heading"><h2>Choose one small thing.</h2><p>What&apos;s your focus today?</p></div>
    <div className="today-task-list"><ol>{tasks.map((task) => <li key={task.id} className={task.completed ? 'task-row task-row--complete' : 'task-row'}><button className="task-toggle" aria-label={task.completed ? `Mark ${task.title} not done` : `Mark ${task.title} done`} onClick={() => onToggle(task.id)}>{task.completed ? '✓' : ''}</button><button className="task-choice" onClick={() => onChoose(task.title)} disabled={task.completed}>{task.title}</button></li>)}</ol></div>
    <section className="ai-helper" aria-label="Local AI task helper">
      <div className="ai-helper__heading"><span aria-hidden="true">✦</span><h3>Help me shrink this into a first step.</h3></div>
      <div className="ai-helper__body">
        {thinking && <div className="ai-helper__thinking"><p>Thinking locally...</p><span aria-hidden="true">•••</span></div>}
        {suggestion && <div className="ai-helper__result"><span>Try this:</span><strong>{suggestion}</strong><button type="button" onClick={useSuggestion}>Use this step</button></div>}
        {aiMessage && <p className="ai-helper__message" role="status">{aiMessage}</p>}
      </div>
      <button type="button" className="ai-helper__ask" onClick={() => void askLocalAi()}><span aria-hidden="true">↻</span>Ask local AI</button>
    </section>
    <form className="add-task" onSubmit={addTask}><label htmlFor="today-task">Add a small task for today</label><div><input id="today-task" value={title} onChange={(event) => { setTitle(event.target.value); setAtLimit(false) }} placeholder="e.g. read two pages" autoComplete="off" /><button type="submit">Add task</button></div></form>
    {atLimit ? <p className="limit-copy">Finish or mark one task done before adding another.</p> : <p className="quiet-copy">{activeCount}/3 active tasks. Keep this list deliberately small.</p>}
  </aside>
}
