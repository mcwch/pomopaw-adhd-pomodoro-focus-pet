import { describe, expect, it } from 'vitest'
import { applySessionOutcome, initialRewards } from '../../src/shared/rewards'

describe('focus rewards', () => {
  it('awards one star for a completed focus session', () => {
    expect(applySessionOutcome(initialRewards(), { outcome: 'completed', elapsedSeconds: 1500, awardedStars: 1 })).toEqual({ stars: 1, focusedMinutes: 25 })
  })

  it('records partial focused minutes without a star', () => {
    expect(applySessionOutcome(initialRewards(), { outcome: 'partial', elapsedSeconds: 1080, awardedStars: 0 })).toEqual({ stars: 0, focusedMinutes: 18 })
  })

  it('uses the controller-approved star count instead of inferring a reward in the renderer', () => {
    expect(applySessionOutcome(initialRewards(), { outcome: 'completed', elapsedSeconds: 1500, awardedStars: 0 })).toEqual({ stars: 0, focusedMinutes: 25 })
  })
})
