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

  it('persists an early-ended focus as a partial session with its actual elapsed time', async () => {
    const storage = repository(); const publish = vi.fn()
    const controller = new TimerController({ repository: storage, now: () => '2026-08-08T09:18:00.000Z', makeId: () => 'session-1', publish })
    await controller.startFocus({ id: 'report', title: 'Draft report' }, '2026-08-08T09:00:00.000Z')

    await controller.endFocusEarly()

    expect(storage.history.sessions[0]).toMatchObject({ outcome: 'partial', elapsedSeconds: 18 * 60, awardedStars: 0 })
    expect(storage.state.rewards.stars).toBe(0)
    expect(publish).toHaveBeenLastCalledWith(expect.objectContaining({ phase: 'idle' }))
  })

  it('retains the remaining duration when an active focus is paused then resumed', async () => {
    const storage = repository(); const publish = vi.fn(); let now = '2026-08-08T09:10:00.000Z'
    const controller = new TimerController({ repository: storage, now: () => now, makeId: () => 'session-1', publish })
    await controller.startFocus({ id: 'report', title: 'Draft report' }, '2026-08-08T09:00:00.000Z')

    const paused = await controller.pause()
    now = '2026-08-08T10:00:00.000Z'
    const resumed = await controller.resume()

    expect(paused).toMatchObject({ phase: 'paused', pausedFrom: 'focus', remainingSeconds: 15 * 60 })
    expect(resumed).toMatchObject({ phase: 'focus', remainingSeconds: null, targetEndsAt: '2026-08-08T10:15:00.000Z' })
  })

  it('does not save or publish a no-op tick before the timer expires', async () => {
    const storage = repository(); const publish = vi.fn()
    const controller = new TimerController({ repository: storage, now: () => '2026-08-08T09:10:00.000Z', makeId: () => 'session-1', publish })
    await controller.startFocus({ id: 'report', title: 'Draft report' }, '2026-08-08T09:00:00.000Z')
    publish.mockClear()

    await controller.tick()

    expect(publish).not.toHaveBeenCalled()
  })
})
