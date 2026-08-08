import { AppStateSchema, FocusHistorySchema, freshAppState, freshFocusHistory, type AppState, type FocusHistory } from '../shared/state'
import type { SessionRecord } from '../shared/timer'

const stateKey = 'focus-companion:web:state'; const historyKey = 'focus-companion:web:history'
export function createBrowserRepository(storage: Storage = window.localStorage) {
  const load = <T>(key: string, parse: (value: unknown) => T, fresh: () => T): T => { try { return parse(JSON.parse(storage.getItem(key) ?? 'null')) } catch { return fresh() } }
  return {
    async loadState(): Promise<AppState> { return load(stateKey, (value) => AppStateSchema.parse(value), freshAppState) },
    async saveState(state: AppState): Promise<void> { storage.setItem(stateKey, JSON.stringify(AppStateSchema.parse(state))) },
    async loadHistory(): Promise<FocusHistory> { return load(historyKey, (value) => FocusHistorySchema.parse(value), freshFocusHistory) },
    async appendSession(session: SessionRecord): Promise<void> { const history = await this.loadHistory(); if (history.sessions.some((item) => item.id === session.id)) throw new Error('Duplicate session ID'); storage.setItem(historyKey, JSON.stringify({ ...history, sessions: [...history.sessions, session] })) }
  }
}
