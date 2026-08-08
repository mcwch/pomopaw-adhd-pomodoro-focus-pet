import { advanceTimer, endFocusEarly, pauseTimer, resumeTimer, startFocus, type TimerSnapshot } from '../shared/timer'
import { applySessionOutcome } from '../shared/rewards'
import type { AppState, FocusHistory } from '../shared/state'

type Repository = { loadState(): Promise<AppState>; saveState(state: AppState): Promise<void>; loadHistory(): Promise<FocusHistory>; appendSession(session: FocusHistory['sessions'][number]): Promise<void> }
export class TimerController {
  private state: AppState | undefined
  constructor(private readonly options: { repository: Repository; now: () => string; makeId: () => string; publish: (snapshot: TimerSnapshot) => void }) {}
  async hydrate(): Promise<AppState> { this.state = await this.options.repository.loadState(); return this.state }
  async getSnapshot(): Promise<TimerSnapshot> { return (await this.ready()).timer }
  async startFocus(task: { id: string; title: string }, at = this.options.now()): Promise<TimerSnapshot> { const state = await this.ready(); state.timer = startFocus({ task, completedFocusCount: state.timer.completedFocusCount }, at, this.options.makeId()); await this.commit(); return state.timer }
  async pause(at = this.options.now()): Promise<TimerSnapshot> { const state = await this.ready(); state.timer = pauseTimer(state.timer, at); await this.commit(); return state.timer }
  async resume(at = this.options.now()): Promise<TimerSnapshot> { const state = await this.ready(); state.timer = resumeTimer(state.timer, at); await this.commit(); return state.timer }
  async endFocusEarly(at = this.options.now()): Promise<TimerSnapshot> { const state = await this.ready(); const transition = endFocusEarly(state.timer, at); state.timer = transition.snapshot; if (transition.settledSession) { await this.options.repository.appendSession(transition.settledSession); state.rewards = applySessionOutcome(state.rewards, transition.settledSession) } await this.commit(); return state.timer }
  async tick(): Promise<TimerSnapshot> { const state = await this.ready(); const transition = advanceTimer(state.timer, this.options.now()); if (transition.snapshot === state.timer) return state.timer; state.timer = transition.snapshot; if (transition.settledSession) { await this.options.repository.appendSession(transition.settledSession); state.rewards = applySessionOutcome(state.rewards, transition.settledSession) } await this.commit(); return state.timer }
  private async ready(): Promise<AppState> { return this.state ?? this.hydrate() }
  private async commit(): Promise<void> { await this.options.repository.saveState(this.state!); this.options.publish(this.state!.timer) }
}
