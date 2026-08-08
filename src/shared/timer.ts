export const FOCUS_SECONDS = 25 * 60
export const SHORT_BREAK_SECONDS = 5 * 60
export const LONG_BREAK_SECONDS = 15 * 60

export type ActivePhase = 'focus' | 'short_break' | 'long_break'
export type TimerPhase = 'idle' | ActivePhase | 'paused'
export type SessionOutcome = 'completed' | 'partial' | 'discarded'
export interface TimerSnapshot {
  phase: TimerPhase
  pausedFrom: ActivePhase | null
  task: { id: string; title: string } | null
  sessionId: string | null
  startedAt: string | null
  targetEndsAt: string | null
  remainingSeconds: number | null
  completedFocusCount: number
}
export interface SessionRecord { id: string; taskId: string | null; startedAt: string; endedAt: string; elapsedSeconds: number; outcome: SessionOutcome; awardedStars: number }
export interface TimerTransition { snapshot: TimerSnapshot; settledSession?: SessionRecord }

export function idleTimer(completedFocusCount = 0): TimerSnapshot {
  return { phase: 'idle', pausedFrom: null, task: null, sessionId: null, startedAt: null, targetEndsAt: null, remainingSeconds: null, completedFocusCount }
}
export function startFocus(input: { task: { id: string; title: string }; completedFocusCount: number }, now: string, sessionId: string): TimerSnapshot {
  return active('focus', input.task, input.completedFocusCount, now, sessionId)
}
export function pauseTimer(snapshot: TimerSnapshot, now: string): TimerSnapshot {
  if (!isActive(snapshot)) throw new Error('Only active timers can pause')
  return { ...snapshot, phase: 'paused', pausedFrom: snapshot.phase, targetEndsAt: null, remainingSeconds: remaining(snapshot, now) }
}
export function resumeTimer(snapshot: TimerSnapshot, now: string): TimerSnapshot {
  if (snapshot.phase !== 'paused' || !snapshot.pausedFrom || snapshot.remainingSeconds === null) throw new Error('Only paused timers can resume')
  return { ...snapshot, phase: snapshot.pausedFrom, pausedFrom: null, targetEndsAt: add(now, snapshot.remainingSeconds), remainingSeconds: null }
}
export function advanceTimer(snapshot: TimerSnapshot, now: string): TimerTransition {
  if (!isActive(snapshot) || remaining(snapshot, now) > 0) return { snapshot }
  if (snapshot.phase !== 'focus') return { snapshot: idleTimer(snapshot.completedFocusCount) }
  const nextCount = snapshot.completedFocusCount + 1
  const longBreak = nextCount === 4
  const next = active(longBreak ? 'long_break' : 'short_break', null, longBreak ? 0 : nextCount, now, `break-${snapshot.sessionId}`)
  return { snapshot: next, settledSession: session(snapshot, now, 'completed', FOCUS_SECONDS, 1) }
}
export function endFocusEarly(snapshot: TimerSnapshot, now: string): TimerTransition {
  if (snapshot.phase !== 'focus') throw new Error('Only focus can end early')
  return { snapshot: idleTimer(snapshot.completedFocusCount), settledSession: session(snapshot, now, 'partial', Math.min(FOCUS_SECONDS, elapsed(snapshot.startedAt!, now)), 0) }
}
function active(phase: ActivePhase, task: TimerSnapshot['task'], completedFocusCount: number, now: string, sessionId: string): TimerSnapshot {
  const seconds = phase === 'focus' ? FOCUS_SECONDS : phase === 'short_break' ? SHORT_BREAK_SECONDS : LONG_BREAK_SECONDS
  return { phase, pausedFrom: null, task, sessionId, startedAt: now, targetEndsAt: add(now, seconds), remainingSeconds: seconds, completedFocusCount }
}
function isActive(snapshot: TimerSnapshot): snapshot is TimerSnapshot & { phase: ActivePhase; targetEndsAt: string } { return snapshot.phase !== 'idle' && snapshot.phase !== 'paused' && !!snapshot.targetEndsAt }
function remaining(snapshot: TimerSnapshot, now: string): number { return Math.max(0, Math.ceil((Date.parse(snapshot.targetEndsAt!) - Date.parse(now)) / 1000)) }
function elapsed(startedAt: string, endedAt: string): number { return Math.max(0, Math.floor((Date.parse(endedAt) - Date.parse(startedAt)) / 1000)) }
function add(now: string, seconds: number): string { return new Date(Date.parse(now) + seconds * 1000).toISOString() }
function session(snapshot: TimerSnapshot, now: string, outcome: SessionOutcome, elapsedSeconds: number, awardedStars: number): SessionRecord { return { id: snapshot.sessionId!, taskId: snapshot.task?.id ?? null, startedAt: snapshot.startedAt!, endedAt: now, elapsedSeconds, outcome, awardedStars } }
