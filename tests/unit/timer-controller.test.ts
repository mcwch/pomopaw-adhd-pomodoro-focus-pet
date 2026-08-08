import { describe, expect, it, vi } from 'vitest'
import { TimerController } from '../../src/main/timer-controller'
import { freshAppState, freshFocusHistory } from '../../src/shared/state'

function repository() {
  let state = freshAppState(); let history = freshFocusHistory()
  return { loadState: async () => state, saveState: async (next: typeof state) => { state = next }, loadHistory: async () => history, appendSession: async (session: (typeof history.sessions)[number]) => { history = { ...history, sessions: [...history.sessions, session] } }, get state() { return state }, get history() { return history } }
}

describe('TimerController', () => {
  it('settles and persists a completed focus before publishing its break snapshot', async () => {
    const storage = repository(); const publish = vi.fn()
    const controller = new TimerController({ repository: storage, now: () => '2026-08-08T09:25:00.000Z', makeId: () => 'session-1', publish })
    await controller.startFocus({ id: 'report', title: 'Draft report' }, '2026-08-08T09:00:00.000Z')
    await controller.tick()

    expect(storage.history.sessions[0]).toMatchObject({ outcome: 'completed', awardedStars: 1 })
    expect(storage.state.rewards.stars).toBe(1)
    expect(publish).toHaveBeenLastCalledWith(expect.objectContaining({ phase: 'short_break' }))
  })
})
