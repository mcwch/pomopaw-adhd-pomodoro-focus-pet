import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../../src/renderer/src/App'
import { useFocusStore } from '../../src/renderer/src/store'
import { idleTimer, startFocus } from '../../src/shared/timer'

const focus = startFocus({ task: { id: 'report', title: 'Outline my report' }, completedFocusCount: 0 }, new Date().toISOString(), 'session-1')
function bridge(snapshot = idleTimer()) {
  return { timerHydrate: vi.fn().mockResolvedValue({ snapshot, recovery: null }), onTimerSnapshot: vi.fn(() => () => undefined), timerStart: vi.fn().mockResolvedValue(focus), timerPause: vi.fn().mockResolvedValue({ ...focus, phase: 'paused', pausedFrom: 'focus', targetEndsAt: null, remainingSeconds: 1500 }), timerResume: vi.fn().mockResolvedValue(focus), timerEndEarly: vi.fn().mockResolvedValue(idleTimer()), resolveTimerRecovery: vi.fn().mockResolvedValue(idleTimer()), appReady: vi.fn(), ollamaStatus: vi.fn(), mistralFirstStep: vi.fn().mockResolvedValue({ suggestion: null }), ollamaFirstStep: vi.fn(), setOverlayVisible: vi.fn(), timerState: vi.fn() }
}
afterEach(() => useFocusStore.setState({ hydrated: false, snapshot: idleTimer(), recovery: null }))

describe('focus flow', () => {
  it('starts focus through the main-process bridge and renders its returned snapshot', async () => {
    const user = userEvent.setup(); const api = bridge(); window.focusApp = api
    render(<App />)
    await user.type(await screen.findByLabelText('What do you want to move forward right now?'), 'Outline my report')
    await user.click(screen.getByRole('button', { name: 'Start 25 minutes' }))
    expect(api.timerStart).toHaveBeenCalledWith(expect.objectContaining({ title: 'Outline my report' }))
    expect(await screen.findByText('25:00')).toBeTruthy()
  })

  it('uses the main-process pause command rather than a renderer interval', async () => {
    const user = userEvent.setup(); const api = bridge(focus); window.focusApp = api
    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Pause timer' }))
    expect(api.timerPause).toHaveBeenCalledOnce()
  })

  it('offers only partial recording or discard after an expired recovered focus', async () => {
    const user = userEvent.setup(); const api = bridge(); api.timerHydrate.mockResolvedValue({ snapshot: idleTimer(), recovery: { id: 'session', taskId: 'report', startedAt: '2026-08-08T09:00:00.000Z', endedAt: '2026-08-08T09:25:00.000Z', elapsedSeconds: 1500, outcome: 'partial', awardedStars: 0 } }); window.focusApp = api
    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Record elapsed time only' }))
    expect(api.resolveTimerRecovery).toHaveBeenCalledWith('record_partial')
    expect(screen.queryByRole('button', { name: /complete/i })).toBeNull()
  })
})
