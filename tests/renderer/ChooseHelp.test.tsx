import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ChooseHelp from '../../src/renderer/src/components/ChooseHelp'

describe('ChooseHelp', () => {
  it('offers a local recommendation without automatically starting it', () => {
    render(<ChooseHelp tasks={[{ id: 'urgent', title: 'Submit form', status: 'today', energy: 'low', deadline: '2026-08-08', completedPomodoros: 0 }]} />)
    expect(screen.getByText('Try this next: Submit form')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Use this task' })).toBeTruthy()
  })
})
