import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import TodayBoard from '../../src/renderer/src/components/TodayBoard'

describe('TodayBoard', () => {
  it('frees a Today slot when a task is completed', async () => {
    const user = userEvent.setup()
    render(<TodayBoard initialTasks={[{ id: 'a', title: 'Outline report' }, { id: 'b', title: 'Reply to email' }]} />)
    await user.click(screen.getByRole('button', { name: 'Complete Outline report' }))
    expect(screen.getByText('Completed today: Outline report')).toBeTruthy()
    expect(screen.getByText('1 of 3 active tasks')).toBeTruthy()
  })
})
