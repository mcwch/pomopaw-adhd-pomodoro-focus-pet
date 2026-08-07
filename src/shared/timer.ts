export const FOCUS_SECONDS = 25 * 60

export type TimerPhase = 'idle' | 'focus' | 'short_break'
export type SessionOutcome = 'completed' | 'partial'

export interface TimerSnapshot {
  phase: TimerPhase
  startedAt: string
  completedFocusCount: number
}

export interface TimerResult extends Omit<TimerSnapshot, 'startedAt'> {
  session: { elapsedSeconds: number; outcome: SessionOutcome }
}

export function startFocus(startedAt: string): TimerSnapshot {
  return { phase: 'focus', startedAt, completedFocusCount: 0 }
}

export function endFocusEarly(snapshot: TimerSnapshot, endedAt: string): TimerResult {
  return { phase: 'idle', completedFocusCount: snapshot.completedFocusCount, session: { elapsedSeconds: elapsed(snapshot.startedAt, endedAt), outcome: 'partial' } }
}

export function tickTimer(snapshot: TimerSnapshot, now: string): TimerResult {
  const elapsedSeconds = elapsed(snapshot.startedAt, now)
  if (elapsedSeconds < FOCUS_SECONDS) return { phase: snapshot.phase, completedFocusCount: snapshot.completedFocusCount, session: { elapsedSeconds, outcome: 'partial' } }
  return { phase: 'short_break', completedFocusCount: snapshot.completedFocusCount + 1, session: { elapsedSeconds: FOCUS_SECONDS, outcome: 'completed' } }
}

function elapsed(startedAt: string, endedAt: string): number {
  return Math.max(0, Math.floor((Date.parse(endedAt) - Date.parse(startedAt)) / 1000))
}
