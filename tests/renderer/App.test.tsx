import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from '../../src/renderer/src/App'
import { idleTimer } from '../../src/shared/timer'
import { useFocusStore } from '../../src/renderer/src/store'

describe('App', () => {
  it('shows one task prompt after main-process hydration', async () => {
    useFocusStore.setState({ hydrated: false, snapshot: idleTimer(), recovery: null })
    window.focusApp = { timerHydrate: vi.fn().mockResolvedValue({ snapshot: idleTimer(), recovery: null }), onTimerSnapshot: vi.fn(() => () => undefined), timerStart: vi.fn(), timerPause: vi.fn(), timerResume: vi.fn(), timerEndEarly: vi.fn(), resolveTimerRecovery: vi.fn(), timerState: vi.fn(), appReady: vi.fn(), ollamaStatus: vi.fn(), mistralFirstStep: vi.fn().mockResolvedValue({ suggestion: null }), ollamaFirstStep: vi.fn(), setOverlayVisible: vi.fn() }
    render(<App />)
    expect(await screen.findByLabelText('What do you want to move forward right now?')).toBeTruthy()
  })
})
