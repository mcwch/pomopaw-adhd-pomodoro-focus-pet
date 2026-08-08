import { describe, expect, it } from 'vitest'
import { advanceTimer, endFocusEarly, pauseTimer, resumeTimer, startFocus } from '../../src/shared/timer'

const task = { id: 'report', title: 'Draft report' }

describe('Pomodoro timer', () => {
  it('moves a fourth completed focus into a 15-minute long break', () => {
    const started = startFocus({ task, completedFocusCount: 3 }, '2026-08-08T09:00:00.000Z', 'session-4')
    const result = advanceTimer(started, '2026-08-08T09:25:00.000Z')

    expect(result.settledSession).toMatchObject({ outcome: 'completed', elapsedSeconds: 1500, awardedStars: 1 })
    expect(result.snapshot).toMatchObject({ phase: 'long_break', completedFocusCount: 0, remainingSeconds: 900 })
  })

  it('freezes remaining time while paused and recalculates the target when resumed', () => {
    const started = startFocus({ task, completedFocusCount: 0 }, '2026-08-08T09:00:00.000Z', 'session-1')
    const paused = pauseTimer(started, '2026-08-08T09:10:00.000Z')
    const resumed = resumeTimer(paused, '2026-08-08T09:30:00.000Z')

    expect(paused).toMatchObject({ phase: 'paused', pausedFrom: 'focus', remainingSeconds: 900, targetEndsAt: null })
    expect(resumed).toMatchObject({ phase: 'focus', targetEndsAt: '2026-08-08T09:45:00.000Z' })
  })

  it('records an early focus end as partial without changing the cycle', () => {
    const started = startFocus({ task, completedFocusCount: 2 }, '2026-08-08T09:00:00.000Z', 'session-3')
    const result = endFocusEarly(started, '2026-08-08T09:18:00.000Z')

    expect(result.settledSession).toMatchObject({ outcome: 'partial', elapsedSeconds: 1080, awardedStars: 0 })
    expect(result.snapshot).toMatchObject({ phase: 'idle', completedFocusCount: 2 })
  })
})
