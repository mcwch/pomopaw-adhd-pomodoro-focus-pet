import { mkdtemp, readdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { StateRepository } from '../../src/main/persistence'
import { freshAppState } from '../../src/shared/state'

describe('local persistence', () => {
  it('writes active state and settled history to separate files', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'focus-companion-'))
    const repository = new StateRepository(directory)
    await repository.saveState(freshAppState())
    await repository.appendSession({ id: 'session-1', taskId: 'report', startedAt: '2026-08-08T09:00:00.000Z', endedAt: '2026-08-08T09:25:00.000Z', elapsedSeconds: 1500, outcome: 'completed', awardedStars: 1 })

    expect(await repository.loadState()).toMatchObject({ version: 2, timer: { phase: 'idle' } })
    expect(await repository.loadHistory()).toMatchObject({ version: 1, sessions: [expect.objectContaining({ id: 'session-1' })] })
  })

  it('preserves invalid state data before returning a fresh state', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'focus-companion-'))
    await writeFile(join(directory, 'focus-state.json'), '{not valid JSON')

    await expect(new StateRepository(directory).loadState()).resolves.toEqual(freshAppState())
    expect((await readdir(directory)).some((name) => name.startsWith('focus-state.invalid-'))).toBe(true)
  })
})
