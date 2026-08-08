import { describe, expect, it, vi } from 'vitest'
import { registerTimerIpc } from '../../src/main/timer-ipc'

describe('timer IPC handlers', () => {
  it('validates task starts before delegating to the main-process controller', async () => {
    const handle = vi.fn(); const startFocus = vi.fn(() => Promise.resolve({ phase: 'focus' }))
    registerTimerIpc({ handle, controller: { startFocus } } as never)
    const startHandler = handle.mock.calls.find(([channel]) => channel === 'timer:start')![1]

    await expect(startHandler({}, { task: { id: 'report', title: 'Draft report' } })).resolves.toEqual({ phase: 'focus' })
    expect(startFocus).toHaveBeenCalledWith({ id: 'report', title: 'Draft report' })
    expect(() => startHandler({}, { task: { id: 'report', title: '' } })).toThrow()
    expect(startFocus).toHaveBeenCalledTimes(1)
  })

  it('keeps pause, resume, and early-end actions parameterless', async () => {
    const handle = vi.fn(); const controller = { pause: vi.fn(() => Promise.resolve({ phase: 'paused' })), resume: vi.fn(() => Promise.resolve({ phase: 'focus' })), endFocusEarly: vi.fn(() => Promise.resolve({ phase: 'idle' })) }
    registerTimerIpc({ handle, controller } as never)

    for (const [channel, method] of [['timer:pause', 'pause'], ['timer:resume', 'resume'], ['timer:end-early', 'endFocusEarly']] as const) {
      const handler = handle.mock.calls.find(([registered]) => registered === channel)![1]
      await handler({}, {})
      expect(controller[method]).toHaveBeenCalledOnce()
    }
  })

  it('returns the current snapshot without allowing renderer-supplied state', async () => {
    const handle = vi.fn(); const snapshot = { phase: 'paused', remainingSeconds: 900 }; const getSnapshot = vi.fn(() => Promise.resolve(snapshot))
    registerTimerIpc({ handle, controller: { getSnapshot } } as never)
    const stateHandler = handle.mock.calls.find(([channel]) => channel === 'timer:state')![1]

    await expect(stateHandler({}, {})).resolves.toEqual(snapshot)
    expect(() => stateHandler({}, { phase: 'focus' })).toThrow()
    expect(getSnapshot).toHaveBeenCalledOnce()
  })

  it('hydrates with an explicit recovery candidate rather than a completion decision', async () => {
    const handle = vi.fn(); const hydrate = vi.fn(() => Promise.resolve({ snapshot: { phase: 'idle' }, recovery: { outcome: 'partial', awardedStars: 0 } }))
    registerTimerIpc({ handle, controller: { hydrate } } as never)
    const hydrateHandler = handle.mock.calls.find(([channel]) => channel === 'timer:hydrate')![1]

    await expect(hydrateHandler({}, {})).resolves.toMatchObject({ recovery: { outcome: 'partial', awardedStars: 0 } })
    expect(hydrate).toHaveBeenCalledOnce()
  })

  it('only delegates the two conservative recovery actions', async () => {
    const handle = vi.fn(); const recordRecoveredPartial = vi.fn(() => Promise.resolve({ phase: 'idle' })); const discardRecoveredSession = vi.fn(() => Promise.resolve({ phase: 'idle' }))
    registerTimerIpc({ handle, controller: { recordRecoveredPartial, discardRecoveredSession } } as never)
    const recoveryHandler = handle.mock.calls.find(([channel]) => channel === 'timer:resolve-recovery')![1]

    await recoveryHandler({}, { action: 'record_partial' })
    await recoveryHandler({}, { action: 'discard' })
    expect(recordRecoveredPartial).toHaveBeenCalledOnce()
    expect(discardRecoveredSession).toHaveBeenCalledOnce()
    expect(() => recoveryHandler({}, { action: 'complete' })).toThrow()
  })
})
