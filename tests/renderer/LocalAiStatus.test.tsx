import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import LocalAiStatus from '../../src/renderer/src/components/LocalAiStatus'

describe('LocalAiStatus', () => {
  it('shows that local AI is ready without exposing task text outside the computer', async () => {
    window.focusApp = { appReady: vi.fn(), ollamaStatus: vi.fn().mockResolvedValue({ available: true, models: ['qwen2.5:3b'] }) }
    render(<LocalAiStatus />)

    expect(await screen.findByText('Local AI ready: qwen2.5:3b')).toBeTruthy()
    expect(screen.getByText(/stays on this computer/i)).toBeTruthy()
  })

  it('explains the optional setup when Ollama is absent', async () => {
    window.focusApp = { appReady: vi.fn(), ollamaStatus: vi.fn().mockResolvedValue({ available: false, models: [] }) }
    render(<LocalAiStatus />)

    expect(await screen.findByText(/Optional local AI is not set up yet/i)).toBeTruthy()
    expect(screen.getByText(/ollama run qwen2.5:3b/i)).toBeTruthy()
  })
})
