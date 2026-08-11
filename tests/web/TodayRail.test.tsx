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

  it('requires a question before asking AI', () => {
    render(<TodayRail tasks={[]} onAdd={vi.fn()} onToggle={vi.fn()} onChoose={vi.fn()} />)

    expect((screen.getByRole('button', { name: 'Ask AI' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('accepts a separate question for the AI helper', async () => {
    render(<TodayRail tasks={[]} onAdd={vi.fn()} onToggle={vi.fn()} onChoose={vi.fn()} />)

    await userEvent.setup().type(screen.getByLabelText('What feels hard right now?'), 'I cannot start my literature review')
    expect((screen.getByRole('button', { name: 'Ask AI' }) as HTMLButtonElement).disabled).toBe(false)
  })
})
