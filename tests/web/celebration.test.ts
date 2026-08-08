import { describe, expect, it } from 'vitest'
import { isCompletedFocusTransition } from '../../src/web/celebration'
import { idleTimer, startFocus } from '../../src/shared/timer'

describe('celebration trigger', () => {
  it('celebrates only when a focus block reaches a break', () => {
    const focus = startFocus({ task: { id: 'report', title: 'Outline report' }, completedFocusCount: 0 }, '2026-08-08T09:00:00.000Z', 'session-1')
    const shortBreak = { ...focus, phase: 'short_break' as const, task: null }

    expect(isCompletedFocusTransition(focus, shortBreak)).toBe(true)
    expect(isCompletedFocusTransition(focus, idleTimer())).toBe(false)
  })
})
