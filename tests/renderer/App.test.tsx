import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../../src/renderer/src/App'

describe('App', () => {
  it('shows a loading gate before local state hydrates', () => {
    render(<App />)
    expect(screen.getByText(/Preparing your study corner/)).toBeTruthy()
  })
})
