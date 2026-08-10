import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ProgressCalendar from '../../src/web/components/ProgressCalendar'
import { buildCalendarMonth } from '../../src/web/progress-history'

describe('ProgressCalendar', () => {
  it('shows a real month with focused minutes and a flame only for a completed Pomodoro', async () => {
    const user = userEvent.setup()
    const onPrevious = vi.fn()
    const sessions = [
      { id: 'partial', taskId: 'task', startedAt: '2026-08-03T10:00:00.000Z', endedAt: '2026-08-03T10:18:00.000Z', elapsedSeconds: 1080, outcome: 'partial' as const, awardedStars: 0 },
      { id: 'complete', taskId: 'task', startedAt: '2026-08-04T10:00:00.000Z', endedAt: '2026-08-04T10:25:00.000Z', elapsedSeconds: 1500, outcome: 'completed' as const, awardedStars: 1 },
    ]
    const month = buildCalendarMonth(sessions, 2026, 7, new Date('2026-08-10T12:00:00.000Z'))
    render(<ProgressCalendar month={month} onPrevious={onPrevious} onNext={vi.fn()} canGoPrevious canGoNext />)

    expect(screen.getByRole('heading', { name: 'August 2026' })).toBeTruthy()
    expect(screen.getByLabelText('August 3: 18 focused minutes')).toBeTruthy()
    expect(screen.getByLabelText('August 4: 25 focused minutes, 1 completed Pomodoro')).toBeTruthy()
    expect(screen.getAllByText('🔥')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Previous month' }))
    expect(onPrevious).toHaveBeenCalledOnce()
  })
})
