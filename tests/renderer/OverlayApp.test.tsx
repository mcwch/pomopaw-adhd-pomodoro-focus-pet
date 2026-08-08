import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import OverlayApp from '../../src/renderer/src/OverlayApp'
import { startFocus } from '../../src/shared/timer'

describe('OverlayApp', () => {
  it('shows a compact studying companion with the controller snapshot', () => {
    const snapshot = startFocus({ task: { id: 'report', title: 'Outline my report' }, completedFocusCount: 0 }, new Date().toISOString(), 'session-1')
    render(<OverlayApp snapshot={snapshot} />)

    expect(screen.getByText('Outline my report')).toBeTruthy()
    expect(screen.getByText('Studying with you')).toBeTruthy()
    expect(screen.getByText('25:00')).toBeTruthy()
  })
})
