import type { SessionOutcome } from './timer'

export interface Rewards { stars: number; focusedMinutes: number }

export function initialRewards(): Rewards { return { stars: 0, focusedMinutes: 0 } }

export function applySessionOutcome(rewards: Rewards, session: { outcome: SessionOutcome; elapsedSeconds: number }): Rewards {
  return {
    stars: rewards.stars + (session.outcome === 'completed' ? 1 : 0),
    focusedMinutes: rewards.focusedMinutes + Math.floor(session.elapsedSeconds / 60)
  }
}
