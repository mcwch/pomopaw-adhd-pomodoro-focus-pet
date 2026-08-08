import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FocusCanvas from '../../src/web/components/FocusCanvas'
import { startFocus } from '../../src/shared/timer'

describe('FocusCanvas', () => {
  it('renders a controller-provided focus snapshot without a renderer-owned countdown', () => {
    const snapshot = startFocus({ task: { id: 'report', title: 'Outline report' }, completedFocusCount: 0 }, new Date().toISOString(), 'session-1')
    render(<FocusCanvas snapshot={snapshot} onStart={vi.fn()} onPause={vi.fn()} onResume={vi.fn()} onEndEarly={vi.fn()} />)

    expect(screen.getByRole('region', { name: 'Focus timer' })).toBeTruthy()
    expect(screen.getByText('Outline report')).toBeTruthy()
    expect(screen.getByText('25:00')).toBeTruthy()
  })
})
