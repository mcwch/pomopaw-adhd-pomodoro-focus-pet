import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ProgressPage from '../../src/web/components/ProgressPage'

describe('ProgressPage', () => {
  it('uses recorded sessions to show the first meaningful calendar month and room progress', () => {
    render(<ProgressPage completedPomodoros={3} sessions={[
      { id: 'one', taskId: 'task', startedAt: '2026-06-04T10:00:00.000Z', endedAt: '2026-06-04T10:25:00.000Z', elapsedSeconds: 1500, outcome: 'completed', awardedStars: 1 },
    ]} now={new Date('2026-08-10T12:00:00.000Z')} />)

    expect(screen.getByRole('heading', { name: 'June 2026' })).toBeTruthy()
    expect(screen.getByText('A room that grows with every full focus block.')).toBeTruthy()
    expect(screen.getByText('3 completed focus blocks · 1/4 room details discovered')).toBeTruthy()
  })
})
