import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../../src/renderer/src/App'

describe('focus flow', () => {
  it('starts a 25-minute focus session from a one-line task', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('What do you want to move forward right now?'), 'Outline my report')
    await user.click(screen.getByRole('button', { name: 'Start 25 minutes' }))
    expect(screen.getByText('Outline my report')).toBeTruthy()
    expect(screen.getByText('25:00')).toBeTruthy()
  })

  it('asks before recording an early end', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('What do you want to move forward right now?'), 'Outline my report')
    await user.click(screen.getByRole('button', { name: 'Start 25 minutes' }))
    await user.click(screen.getByRole('button', { name: 'End early' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
  })
})
