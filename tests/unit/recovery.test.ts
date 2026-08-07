import { describe, expect, it } from 'vitest'
import { recoverTimer } from '../../src/main/recovery'

describe('timer recovery', () => {
  it('requires acknowledgement instead of awarding a completion after an expired closed focus timer', () => {
    const result = recoverTimer({ phase: 'focus', startedAt: '2026-08-07T09:00:00.000Z', completedFocusCount: 0 }, '2026-08-07T10:00:00.000Z')

    expect(result).toEqual({ kind: 'expired_focus', elapsedSeconds: 3600, requiresUserAcknowledgement: true, awardedCompletion: false })
  })

  it('keeps an in-progress timer active when it has not yet elapsed', () => {
    const result = recoverTimer({ phase: 'focus', startedAt: '2026-08-07T09:00:00.000Z', completedFocusCount: 0 }, '2026-08-07T09:10:00.000Z')

    expect(result).toEqual({ kind: 'active', elapsedSeconds: 600 })
  })
})
