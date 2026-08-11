import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FriendsPage from '../../src/web/components/FriendsPage'

describe('FriendsPage', () => {
  it('renders a gentle preview board with the current user highlighted', () => {
    render(<FriendsPage completedPomodoros={3} sessions={[{ id: 'one', taskId: 'task', startedAt: '2026-08-11T09:00:00.000Z', endedAt: '2026-08-11T09:25:00.000Z', elapsedSeconds: 1500, outcome: 'completed', awardedStars: 1 }]} onStartFocus={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Study together, gently.' })).toBeTruthy()
    expect(screen.getByRole('row', { name: /You/ })).toBeTruthy()
    expect(screen.getByText('Preview data')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Add a friend' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('returns to focus from the together CTA', async () => {
    const user = userEvent.setup()
    const onStartFocus = vi.fn()
    render(<FriendsPage completedPomodoros={0} sessions={[]} onStartFocus={onStartFocus} />)

    await user.click(screen.getByRole('button', { name: 'Start 25 minutes together' }))
    expect(onStartFocus).toHaveBeenCalledOnce()
  })
})
