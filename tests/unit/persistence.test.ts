import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { StateRepository } from '../../src/main/persistence'

describe('local persistence', () => {
  it('falls back to fresh state when persisted JSON is invalid', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'focus-companion-'))
    await writeFile(join(directory, 'focus-state.json'), '{"version":"wrong"}')

    await expect(new StateRepository(directory).load()).resolves.toEqual({ version: 1, tasks: [], sessions: [], rewards: { stars: 0, focusedMinutes: 0 } })
  })
})
