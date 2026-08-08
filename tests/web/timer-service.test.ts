import { describe, expect, it } from 'vitest'
import { createTimerService } from '../../src/web/timer-service'
import { freshAppState, freshFocusHistory } from '../../src/shared/state'
import { startFocus } from '../../src/shared/timer'

function repository(state = freshAppState()) {
  let current = state; let history = freshFocusHistory()
  return { loadState: async () => current, saveState: async (next: typeof current) => { current = next }, loadHistory: async () => history, appendSession: async (session: (typeof history.sessions)[number]) => { history = { ...history, sessions: [...history.sessions, session] } }, get history() { return history } }
}

describe('browser timer service', () => {
  it('settles a full focus before publishing its short break', async () => {
    const storage = repository(); const published: string[] = []
    const service = createTimerService({ repository: storage, now: () => '2026-08-08T09:25:00.000Z', makeId: () => 'session-1' })
    service.subscribe((snapshot) => published.push(snapshot.phase))
    await service.start({ id: 'report', title: 'Outline report' }, '2026-08-08T09:00:00.000Z')
    await service.tick()

    expect(storage.history.sessions[0]).toMatchObject({ outcome: 'completed', awardedStars: 1 })
    expect(published.at(-1)).toBe('short_break')
  })

  it('makes the awarded star available to a client after a completed focus', async () => {
    const service = createTimerService({ repository: repository(), now: () => '2026-08-08T09:25:00.000Z', makeId: () => 'session-1' })
    await service.start({ id: 'report', title: 'Outline report' }, '2026-08-08T09:00:00.000Z')
    await service.tick()

    expect((await service.getState()).rewards.stars).toBe(1)
  })

  it('requires confirmation before recording an expired recovered focus', async () => {
    const state = freshAppState(); state.timer = startFocus({ task: { id: 'report', title: 'Outline report' }, completedFocusCount: 0 }, '2026-08-08T09:00:00.000Z', 'recovered')
    const storage = repository(state)
    const service = createTimerService({ repository: storage, now: () => '2026-08-08T10:00:00.000Z', makeId: () => 'unused' })

    expect((await service.hydrate()).recovery).toMatchObject({ outcome: 'partial', awardedStars: 0 })
    expect(storage.history.sessions).toHaveLength(0)
    await service.recordRecoveredPartial()
    expect(storage.history.sessions[0]).toMatchObject({ outcome: 'partial', awardedStars: 0 })
  })
})
