import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FocusCanvas from '../../src/web/components/FocusCanvas'
import { startFocus } from '../../src/shared/timer'

describe('FocusCanvas', () => {
  it('starts the focus session with the user’s small next step', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<FocusCanvas snapshot={{ phase: 'idle', pausedFrom: null, task: null, sessionId: null, startedAt: null, targetEndsAt: null, remainingSeconds: null, completedFocusCount: 0 }} onStart={onStart} onPause={vi.fn()} onResume={vi.fn()} onEndEarly={vi.fn()} />)

    await user.type(screen.getByLabelText('What do you want to move forward right now?'), 'Draft one outline')
    await user.click(screen.getByRole('button', { name: 'Start 25 minutes' }))

    expect(onStart).toHaveBeenCalledWith('Draft one outline')
  })

  it('renders a controller-provided focus snapshot without a renderer-owned countdown', () => {
    const snapshot = startFocus({ task: { id: 'report', title: 'Outline report' }, completedFocusCount: 0 }, new Date().toISOString(), 'session-1')
    render(<FocusCanvas snapshot={snapshot} onStart={vi.fn()} onPause={vi.fn()} onResume={vi.fn()} onEndEarly={vi.fn()} />)

    expect(screen.getByRole('region', { name: 'Focus timer' })).toBeTruthy()
    expect(screen.getByText('Outline report')).toBeTruthy()
    expect(screen.getByText('25:00')).toBeTruthy()
  })
})
