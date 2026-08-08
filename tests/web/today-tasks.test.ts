import { describe, expect, it } from 'vitest'
import { addTodayTask, toggleTodayTask, type TodayTask } from '../../src/web/today-tasks'

describe('today tasks', () => {
  it('allows a new task once a completed task frees an active slot', () => {
    const tasks: TodayTask[] = [
      { id: 'one', title: 'Read two pages', completed: false },
      { id: 'two', title: 'Reply to one email', completed: false },
      { id: 'three', title: 'Outline report', completed: false }
    ]

    expect(addTodayTask(tasks, 'Plan tomorrow', () => 'four').added).toBe(false)
    const withOneDone = toggleTodayTask(tasks, 'two')
    const result = addTodayTask(withOneDone, 'Plan tomorrow', () => 'four')

    expect(result.added).toBe(true)
    expect(result.tasks).toContainEqual({ id: 'four', title: 'Plan tomorrow', completed: false })
  })
})
