import { describe, expect, it } from 'vitest'
import { addToToday, recommendNextTask, rescueOptions } from '../../src/shared/tasks'

describe('Today tasks', () => {
  it('refuses a fourth Today task without losing the task', () => {
    const result = addToToday([
      { id: 'one', title: 'One', status: 'today', energy: 'medium' },
      { id: 'two', title: 'Two', status: 'today', energy: 'medium' },
      { id: 'three', title: 'Three', status: 'today', energy: 'medium' }
    ], { id: 'four', title: 'Four', status: 'inbox', energy: 'medium' })

    expect(result).toEqual({ ok: false, reason: 'today_limit' })
  })

  it('prefers an approaching unstarted task matching current energy', () => {
    const task = recommendNextTask([
      { id: 'later', title: 'Read article', status: 'today', energy: 'low', deadline: '2026-08-20', completedPomodoros: 0 },
      { id: 'urgent', title: 'Submit form', status: 'today', energy: 'low', deadline: '2026-08-08', completedPomodoros: 0 },
      { id: 'advanced', title: 'Draft report', status: 'today', energy: 'high', deadline: '2026-08-08', completedPomodoros: 2 }
    ], { energy: 'low', now: '2026-08-07T09:00:00.000Z' })

    expect(task?.id).toBe('urgent')
  })

  it('offers non-judgmental rescue choices after two declines', () => {
    expect(rescueOptions(2)).toEqual(['shrink', 'lower_energy', 'move_to_inbox'])
  })
})
