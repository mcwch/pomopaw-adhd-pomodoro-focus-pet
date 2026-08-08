import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import StudyDesk from '../../src/web/components/StudyDesk'
import { idleTimer } from '../../src/shared/timer'

afterEach(() => window.localStorage.clear())

describe('StudyDesk', () => {
  it('adds a task through the real study desk flow', async () => {
    const user = userEvent.setup()
    render(<StudyDesk snapshot={idleTimer()} stars={0} onStart={vi.fn()} onPause={vi.fn()} onResume={vi.fn()} onEndEarly={vi.fn()} />)

    await user.type(screen.getByLabelText('Add a small task for today'), 'Read two pages')
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(screen.getByRole('button', { name: 'Read two pages' })).toBeTruthy()
  })
})
