import { recommendNextTask, type Task } from '../../../shared/tasks'

export default function ChooseHelp({ tasks }: { tasks: Task[] }): React.JSX.Element | null {
  const recommendation = recommendNextTask(tasks, { energy: 'low', now: new Date().toISOString() })
  if (!recommendation) return null
  return <section className="choose-help"><p className="eyebrow">NOT SURE WHERE TO START?</p><p>Try this next: {recommendation.title}</p><small>You can always choose another task.</small><button>Use this task</button></section>
}
