import { describe, expect, it } from 'vitest'
import { recoverTimer } from '../../src/main/recovery'
import { startFocus } from '../../src/shared/timer'

const task = { id: 'report', title: 'Draft report' }

describe('timer recovery', () => {
  it('requires acknowledgement for focus that expired while unavailable', () => {
    const result = recoverTimer(startFocus({ task, completedFocusCount: 0 }, '2026-08-08T09:00:00.000Z', 'session-1'), '2026-08-08T10:00:00.000Z')

    expect(result).toMatchObject({ kind: 'expired_focus', session: { outcome: 'partial', awardedStars: 0, elapsedSeconds: 1500 } })
  })

  it('restores paused focus without charging unavailable time', () => {
    const active = startFocus({ task, completedFocusCount: 0 }, '2026-08-08T09:00:00.000Z', 'session-1')
    const paused = { ...active, phase: 'paused' as const, pausedFrom: 'focus' as const, targetEndsAt: null, remainingSeconds: 900 }
    const result = recoverTimer(paused, '2026-08-08T10:00:00.000Z')

    expect(result).toMatchObject({ kind: 'resume', snapshot: { phase: 'paused', remainingSeconds: 900 } })
  })

  it('returns idle when a break expired while unavailable', () => {
    const breakSnapshot = { ...startFocus({ task, completedFocusCount: 1 }, '2026-08-08T09:00:00.000Z', 'session-1'), phase: 'short_break' as const, targetEndsAt: '2026-08-08T09:05:00.000Z' }
    const result = recoverTimer(breakSnapshot, '2026-08-08T09:06:00.000Z')

    expect(result).toMatchObject({ kind: 'idle', snapshot: { phase: 'idle' } })
  })
})
