import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../../src/renderer/src/App'

describe('focus flow', () => {
  afterEach(() => vi.useRealTimers())
  it('starts a 25-minute focus session from a one-line task', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('What do you want to move forward right now?'), 'Outline my report')
    await user.click(screen.getByRole('button', { name: 'Start 25 minutes' }))
    expect(screen.getByText('Outline my report')).toBeTruthy()
    expect(screen.getByText('25:00')).toBeTruthy()
    expect(screen.getByText('Studying with you')).toBeTruthy()
  })

  it('counts down after a focus session starts', () => {
    vi.useFakeTimers()
    render(<App />)
    fireEvent.change(screen.getByLabelText('What do you want to move forward right now?'), { target: { value: 'Outline my report' } })
    fireEvent.click(screen.getByRole('button', { name: 'Start 25 minutes' }))
    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByText('24:59')).toBeTruthy()
  })

  it('awards a focus star only when the full session ends', () => {
    vi.useFakeTimers()
    render(<App />)
    fireEvent.change(screen.getByLabelText('What do you want to move forward right now?'), { target: { value: 'Outline my report' } })
    fireEvent.click(screen.getByRole('button', { name: 'Start 25 minutes' }))
    act(() => vi.advanceTimersByTime(25 * 60 * 1000))
    expect(screen.getByText(/1 focus stars/)).toBeTruthy()
  })

  it('asks before recording an early end', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('What do you want to move forward right now?'), 'Outline my report')
    await user.click(screen.getByRole('button', { name: 'Start 25 minutes' }))
    await user.click(screen.getByRole('button', { name: 'End early' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Record and end' }))
    expect(screen.getByText('Outline my report')).toBeTruthy()
  })

  it('lets the user select an ambient sound during focus', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('What do you want to move forward right now?'), 'Outline my report')
    await user.click(screen.getByRole('button', { name: 'Start 25 minutes' }))
    await user.selectOptions(screen.getByLabelText('Ambient sound'), 'rain')
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('rain')
  })

  it('lets the user adjust ambient volume during focus', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('What do you want to move forward right now?'), 'Outline my report')
    await user.click(screen.getByRole('button', { name: 'Start 25 minutes' }))
    await user.clear(screen.getByLabelText('Ambient volume'))
    await user.type(screen.getByLabelText('Ambient volume'), '35')
    expect((screen.getByLabelText('Ambient volume') as HTMLInputElement).value).toBe('35')
  })
})
