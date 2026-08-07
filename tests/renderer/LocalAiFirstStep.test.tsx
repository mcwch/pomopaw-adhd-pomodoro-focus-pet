import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import LocalAiFirstStep from '../../src/renderer/src/components/LocalAiFirstStep'

describe('LocalAiFirstStep', () => {
  it('shows one private, actionable first step only after the user asks', async () => {
    const user = userEvent.setup()
    window.focusApp = {
      appReady: vi.fn(),
      ollamaStatus: vi.fn(),
      ollamaFirstStep: vi.fn().mockResolvedValue({ suggestion: 'Open the report and write three bullet headings.' })
    }
    render(<LocalAiFirstStep task="Write my report" />)

    expect(screen.queryByText('Open the report and write three bullet headings.')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Help me choose a first step' }))
    expect(await screen.findByText('Open the report and write three bullet headings.')).toBeTruthy()
  })

  it('does not invite an empty task to the model', () => {
    render(<LocalAiFirstStep task="" />)

    expect((screen.getByRole('button', { name: 'Help me choose a first step' }) as HTMLButtonElement).disabled).toBe(true)
  })
})
