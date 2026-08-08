import { readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { AppStateSchema, FocusHistorySchema, freshAppState, freshFocusHistory, type AppState, type FocusHistory } from '../shared/state'
import type { SessionRecord } from '../shared/timer'

export class StateRepository {
  constructor(private readonly directory: string) {}
  async loadState(): Promise<AppState> { return this.load('focus-state.json', AppStateSchema, freshAppState) }
  async saveState(state: AppState): Promise<void> { await this.write('focus-state.json', AppStateSchema.parse(state)) }
  async loadHistory(): Promise<FocusHistory> { return this.load('focus-history.json', FocusHistorySchema, freshFocusHistory) }
  async appendSession(session: SessionRecord): Promise<void> { const history = await this.loadHistory(); if (history.sessions.some(({ id }) => id === session.id)) throw new Error('Duplicate session ID'); await this.write('focus-history.json', { ...history, sessions: [...history.sessions, session] }) }
  private async load<T>(name: string, schema: { parse(value: unknown): T }, fresh: () => T): Promise<T> { const file = join(this.directory, name); try { return schema.parse(JSON.parse(await readFile(file, 'utf8'))) } catch { try { await rename(file, join(this.directory, `${name.replace('.json', '')}.invalid-${Date.now()}.json`)) } catch {} return fresh() } }
  private async write(name: string, value: unknown): Promise<void> { const target = join(this.directory, name); await writeFile(`${target}.tmp`, JSON.stringify(value), 'utf8'); await rename(`${target}.tmp`, target) }
}
