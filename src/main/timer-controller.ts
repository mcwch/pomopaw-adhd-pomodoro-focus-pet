import { advanceTimer, endFocusEarly, idleTimer, pauseTimer, resumeTimer, startFocus, type SessionRecord, type TimerSnapshot } from '../shared/timer'
import { applySessionOutcome } from '../shared/rewards'
import type { AppState, FocusHistory } from '../shared/state'
import { recoverTimer } from './recovery'

type Repository = { loadState(): Promise<AppState>; saveState(state: AppState): Promise<void>; loadHistory(): Promise<FocusHistory>; appendSession(session: FocusHistory['sessions'][number]): Promise<void> }
export interface HydrationResult { snapshot: TimerSnapshot; recovery: SessionRecord | null }
export class TimerController {
  private state: AppState | undefined
  private recovery: SessionRecord | null = null
  constructor(private readonly options: { repository: Repository; now: () => string; makeId: () => string; publish: (snapshot: TimerSnapshot) => void }) {}
  async hydrate(): Promise<HydrationResult> {
    if (this.state) return { snapshot: this.state.timer, recovery: this.recovery }
    this.state = await this.options.repository.loadState()
    const result = recoverTimer(this.state.timer, this.options.now())
    if (result.kind === 'expired_focus') {
      this.recovery = result.session
      this.state.timer = idleTimer(this.state.timer.completedFocusCount)
    } else {
      this.state.timer = result.snapshot
    }
    return { snapshot: this.state.timer, recovery: this.recovery }
  }
  async getSnapshot(): Promise<TimerSnapshot> { return (await this.ready()).timer }
  async startFocus(task: { id: string; title: string }, at = this.options.now()): Promise<TimerSnapshot> { const state = await this.ready(); state.timer = startFocus({ task, completedFocusCount: state.timer.completedFocusCount }, at, this.options.makeId()); await this.commit(); return state.timer }
  async pause(at = this.options.now()): Promise<TimerSnapshot> { const state = await this.ready(); state.timer = pauseTimer(state.timer, at); await this.commit(); return state.timer }
  async resume(at = this.options.now()): Promise<TimerSnapshot> { const state = await this.ready(); state.timer = resumeTimer(state.timer, at); await this.commit(); return state.timer }
  async endFocusEarly(at = this.options.now()): Promise<TimerSnapshot> { const state = await this.ready(); const transition = endFocusEarly(state.timer, at); state.timer = transition.snapshot; if (transition.settledSession) { await this.options.repository.appendSession(transition.settledSession); state.rewards = applySessionOutcome(state.rewards, transition.settledSession) } await this.commit(); return state.timer }
  async recordRecoveredPartial(): Promise<TimerSnapshot> { const state = await this.ready(); if (!this.recovery) throw new Error('No recovered session to record'); await this.options.repository.appendSession(this.recovery); state.rewards = applySessionOutcome(state.rewards, this.recovery); this.recovery = null; await this.commit(); return state.timer }
  async discardRecoveredSession(): Promise<TimerSnapshot> { const state = await this.ready(); if (!this.recovery) throw new Error('No recovered session to discard'); this.recovery = null; await this.commit(); return state.timer }
  async tick(): Promise<TimerSnapshot> { const state = await this.ready(); const transition = advanceTimer(state.timer, this.options.now()); if (transition.snapshot === state.timer) return state.timer; state.timer = transition.snapshot; if (transition.settledSession) { await this.options.repository.appendSession(transition.settledSession); state.rewards = applySessionOutcome(state.rewards, transition.settledSession) } await this.commit(); return state.timer }
  private async ready(): Promise<AppState> { if (!this.state) await this.hydrate(); return this.state! }
  private async commit(): Promise<void> { await this.options.repository.saveState(this.state!); this.options.publish(this.state!.timer) }
}
