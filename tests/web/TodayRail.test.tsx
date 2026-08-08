import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import TodayRail from '../../src/web/components/TodayRail'

describe('TodayRail', () => {
  it('lets someone add a small task and choose it for their next focus', async () => {
    const user = userEvent.setup(); const onAdd = vi.fn(); const onChoose = vi.fn()
    render(<TodayRail tasks={[]} onAdd={onAdd} onToggle={vi.fn()} onChoose={onChoose} />)

    await user.type(screen.getByLabelText('Add a small task for today'), 'Read two pages')
    await user.click(screen.getByRole('button', { name: 'Add task' }))
    expect(onAdd).toHaveBeenCalledWith('Read two pages')
  })
})
