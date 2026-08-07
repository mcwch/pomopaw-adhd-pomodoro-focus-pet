import { describe, expect, it } from 'vitest'
import { endFocusEarly, startFocus, tickTimer } from '../../src/shared/timer'

describe('Pomodoro timer', () => {
  it('records 18 elapsed minutes without completing a Pomodoro', () => {
    const started = startFocus('2026-08-07T09:00:00.000Z')
    const result = endFocusEarly(started, '2026-08-07T09:18:00.000Z')

    expect(result.session).toEqual({ elapsedSeconds: 1080, outcome: 'partial' })
    expect(result.completedFocusCount).toBe(0)
    expect(result.phase).toBe('idle')
  })

  it('completes a full focus interval and begins a short break', () => {
    const started = startFocus('2026-08-07T09:00:00.000Z')
    const result = tickTimer(started, '2026-08-07T09:25:00.000Z')

    expect(result.session).toEqual({ elapsedSeconds: 1500, outcome: 'completed' })
    expect(result.completedFocusCount).toBe(1)
    expect(result.phase).toBe('short_break')
  })
})
