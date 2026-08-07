export type Energy = 'low' | 'medium' | 'high'
export type TaskStatus = 'inbox' | 'today' | 'completed'

export interface Task {
  id: string
  title: string
  status: TaskStatus
  energy: Energy
  deadline?: string
  completedPomodoros?: number
}

export function addToToday(tasks: Task[], task: Task): { ok: true; task: Task } | { ok: false; reason: 'today_limit' } {
  if (tasks.filter(({ status }) => status === 'today').length >= 3) return { ok: false, reason: 'today_limit' }
  return { ok: true, task: { ...task, status: 'today' } }
}

export function recommendNextTask(tasks: Task[], context: { energy: Energy; now: string }): Task | undefined {
  const now = Date.parse(context.now)
  return tasks
    .filter(({ status }) => status === 'today')
    .toSorted((left, right) => score(right, context.energy, now) - score(left, context.energy, now))[0]
}

export function rescueOptions(declineCount: number): Array<'shrink' | 'lower_energy' | 'move_to_inbox'> {
  return declineCount >= 2 ? ['shrink', 'lower_energy', 'move_to_inbox'] : []
}

function score(task: Task, energy: Energy, now: number): number {
  const deadline = task.deadline ? Date.parse(`${task.deadline}T23:59:59.999Z`) : Number.MAX_SAFE_INTEGER
  const urgency = Number.isFinite(deadline) ? Math.max(0, 10_000 - Math.floor((deadline - now) / 86_400_000)) : 0
  const unstarted = task.completedPomodoros === 0 ? 500 : 0
  const energyMatch = task.energy === energy ? 100 : 0
  return urgency + unstarted + energyMatch
}
