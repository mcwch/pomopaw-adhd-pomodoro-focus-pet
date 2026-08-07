import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../../src/renderer/src/App'

describe('App', () => {
  it('shows one task prompt before focus starts', () => {
    render(<App />)
    expect(screen.getByLabelText('What do you want to move forward right now?')).toBeTruthy()
  })
})
