import { readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { z } from 'zod'

const appStateSchema = z.object({
  version: z.literal(1),
  tasks: z.array(z.unknown()),
  sessions: z.array(z.unknown()),
  rewards: z.object({ stars: z.number(), focusedMinutes: z.number() })
})
export type AppState = z.infer<typeof appStateSchema>
export const freshAppState = (): AppState => ({ version: 1, tasks: [], sessions: [], rewards: { stars: 0, focusedMinutes: 0 } })

export class StateRepository {
  constructor(private readonly directory: string) {}
  async load(): Promise<AppState> {
    try { return appStateSchema.parse(JSON.parse(await readFile(join(this.directory, 'focus-state.json'), 'utf8'))) } catch { return freshAppState() }
  }
  async save(state: AppState): Promise<void> {
    const target = join(this.directory, 'focus-state.json')
    const temporary = `${target}.tmp`
    await writeFile(temporary, JSON.stringify(appStateSchema.parse(state)), 'utf8')
    await rename(temporary, target)
  }
}
