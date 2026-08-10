import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SoundControls from '../../src/web/components/SoundControls'

describe('SoundControls', () => {
  it('lets the user choose the ambient sound from the Stitch control', async () => {
    const user = userEvent.setup(); const onChange = vi.fn()
    render(<SoundControls value="white_noise" onChange={onChange} />)
    expect(screen.getAllByText('White noise')).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: 'Rain' }))
    expect(onChange).toHaveBeenCalledWith('rain')
  })
})
