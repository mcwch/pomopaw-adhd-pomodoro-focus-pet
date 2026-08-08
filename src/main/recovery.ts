import { FOCUS_SECONDS, idleTimer, type SessionRecord, type TimerSnapshot } from '../shared/timer'

export type RecoveryResult =
  | { kind: 'resume'; snapshot: TimerSnapshot }
  | { kind: 'idle'; snapshot: TimerSnapshot }
  | { kind: 'expired_focus'; session: SessionRecord }

export function recoverTimer(snapshot: TimerSnapshot, now: string): RecoveryResult {
  if (snapshot.phase === 'paused') return { kind: 'resume', snapshot }
  if (snapshot.phase === 'idle') return { kind: 'idle', snapshot }
  const remaining = Math.max(0, Math.ceil((Date.parse(snapshot.targetEndsAt ?? now) - Date.parse(now)) / 1000))
  if (remaining > 0) return { kind: 'resume', snapshot: { ...snapshot, remainingSeconds: remaining } }
  if (snapshot.phase !== 'focus') return { kind: 'idle', snapshot: idleTimer(snapshot.completedFocusCount) }
  return { kind: 'expired_focus', session: { id: snapshot.sessionId!, taskId: snapshot.task?.id ?? null, startedAt: snapshot.startedAt!, endedAt: now, elapsedSeconds: FOCUS_SECONDS, outcome: 'partial', awardedStars: 0 } }
}
