import type { SessionOutcome } from './timer'

export interface Rewards { stars: number; focusedMinutes: number }

export function initialRewards(): Rewards { return { stars: 0, focusedMinutes: 0 } }

export function applySessionOutcome(rewards: Rewards, session: { outcome: SessionOutcome; elapsedSeconds: number; awardedStars: number }): Rewards {
  return {
    stars: rewards.stars + session.awardedStars,
    focusedMinutes: rewards.focusedMinutes + Math.floor(session.elapsedSeconds / 60)
  }
}
