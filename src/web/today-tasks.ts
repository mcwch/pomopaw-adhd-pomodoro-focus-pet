export interface TodayTask { id: string; title: string; completed: boolean }

const TODAY_TASKS_KEY = 'focus-companion:web:today-tasks'

export function addTodayTask(tasks: TodayTask[], title: string, makeId: () => string): { tasks: TodayTask[]; added: boolean } {
  const cleanedTitle = title.trim()
  if (!cleanedTitle || tasks.filter((task) => !task.completed).length >= 3) return { tasks, added: false }
  return { tasks: [...tasks, { id: makeId(), title: cleanedTitle, completed: false }], added: true }
}

export function toggleTodayTask(tasks: TodayTask[], id: string): TodayTask[] {
  return tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task)
}

export function loadTodayTasks(storage: Storage = window.localStorage): TodayTask[] {
  try {
    const value: unknown = JSON.parse(storage.getItem(TODAY_TASKS_KEY) ?? '[]')
    if (!Array.isArray(value)) return []
    return value.filter((task): task is TodayTask => typeof task === 'object' && task !== null && typeof task.id === 'string' && typeof task.title === 'string' && typeof task.completed === 'boolean')
  } catch { return [] }
}

export function saveTodayTasks(tasks: TodayTask[], storage: Storage = window.localStorage): void {
  storage.setItem(TODAY_TASKS_KEY, JSON.stringify(tasks))
}
