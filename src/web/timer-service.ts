import { applySessionOutcome } from '../shared/rewards'
import { recoverTimer } from '../main/recovery'
import { advanceTimer, endFocusEarly, idleTimer, pauseTimer, resumeTimer, startFocus, type SessionRecord, type TimerSnapshot } from '../shared/timer'
import type { AppState, FocusHistory } from '../shared/state'

type Repository = { loadState(): Promise<AppState>; saveState(state: AppState): Promise<void>; loadHistory(): Promise<FocusHistory>; appendSession(session: SessionRecord): Promise<void> }
export interface HydrationResult { snapshot: TimerSnapshot; recovery: SessionRecord | null }
export interface TimerService { hydrate(): Promise<HydrationResult>; start(task: { id: string; title: string }, at?: string): Promise<TimerSnapshot>; pause(): Promise<TimerSnapshot>; resume(): Promise<TimerSnapshot>; endEarly(): Promise<TimerSnapshot>; recordRecoveredPartial(): Promise<TimerSnapshot>; discardRecoveredSession(): Promise<TimerSnapshot>; tick(): Promise<TimerSnapshot>; subscribe(listener: (snapshot: TimerSnapshot) => void): () => void }

export function createTimerService(options: { repository: Repository; now: () => string; makeId: () => string }): TimerService {
  let state: AppState | undefined; let recovery: SessionRecord | null = null; const listeners = new Set<(snapshot: TimerSnapshot) => void>()
  const ready = async () => { if (!state) await hydrate(); return state! }
  const publish = () => listeners.forEach((listener) => listener(state!.timer))
  const commit = async () => { await options.repository.saveState(state!); publish() }
  const settle = async (session: SessionRecord) => { await options.repository.appendSession(session); state!.rewards = applySessionOutcome(state!.rewards, session) }
  const hydrate = async (): Promise<HydrationResult> => {
    if (state) return { snapshot: state.timer, recovery }
    state = await options.repository.loadState(); const result = recoverTimer(state.timer, options.now())
    if (result.kind === 'expired_focus') { recovery = result.session; state.timer = idleTimer(state.timer.completedFocusCount) } else state.timer = result.snapshot
    return { snapshot: state.timer, recovery }
  }
  return {
    hydrate,
    async start(task, at = options.now()) { const current = await ready(); current.timer = startFocus({ task, completedFocusCount: current.timer.completedFocusCount }, at, options.makeId()); await commit(); return current.timer },
    async pause() { const current = await ready(); current.timer = pauseTimer(current.timer, options.now()); await commit(); return current.timer },
    async resume() { const current = await ready(); current.timer = resumeTimer(current.timer, options.now()); await commit(); return current.timer },
    async endEarly() { const current = await ready(); const result = endFocusEarly(current.timer, options.now()); current.timer = result.snapshot; if (result.settledSession) await settle(result.settledSession); await commit(); return current.timer },
    async recordRecoveredPartial() { const current = await ready(); if (!recovery) throw new Error('No recovered session to record'); await settle(recovery); recovery = null; await commit(); return current.timer },
    async discardRecoveredSession() { const current = await ready(); if (!recovery) throw new Error('No recovered session to discard'); recovery = null; await commit(); return current.timer },
    async tick() { const current = await ready(); const result = advanceTimer(current.timer, options.now()); if (result.snapshot === current.timer) return current.timer; current.timer = result.snapshot; if (result.settledSession) await settle(result.settledSession); await commit(); return current.timer },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) }
  }
}
