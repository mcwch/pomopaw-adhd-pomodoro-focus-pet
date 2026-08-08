import { FOCUS_SECONDS, type TimerSnapshot } from '../shared/timer'

export type RecoveryResult =
  | { kind: 'active'; elapsedSeconds: number }
  | { kind: 'expired_focus'; elapsedSeconds: number; requiresUserAcknowledgement: true; awardedCompletion: false }

export function recoverTimer(snapshot: TimerSnapshot, now: string): RecoveryResult {
  const elapsedSeconds = Math.max(0, Math.floor((Date.parse(now) - Date.parse(snapshot.startedAt ?? now)) / 1000))
  if (snapshot.phase === 'focus' && elapsedSeconds >= FOCUS_SECONDS) {
    return { kind: 'expired_focus', elapsedSeconds, requiresUserAcknowledgement: true, awardedCompletion: false }
  }
  return { kind: 'active', elapsedSeconds }
}
