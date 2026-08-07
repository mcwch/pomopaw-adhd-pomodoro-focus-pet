import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import OverlayApp from '../../src/renderer/src/OverlayApp'

describe('OverlayApp', () => {
  it('shows a compact studying companion with the focused task', () => {
    render(<OverlayApp task="Outline my report" />)

    expect(screen.getByText('Outline my report')).toBeTruthy()
    expect(screen.getByText('Studying with you')).toBeTruthy()
  })
})
