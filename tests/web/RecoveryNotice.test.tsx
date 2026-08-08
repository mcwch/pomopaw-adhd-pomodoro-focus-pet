import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import RecoveryNotice from '../../src/web/components/RecoveryNotice'

describe('RecoveryNotice', () => {
  it('offers only partial recording or discarding for an expired focus', async () => {
    const user = userEvent.setup(); const onRecord = vi.fn(); const onDiscard = vi.fn()
    render(<RecoveryNotice elapsedSeconds={1500} onRecord={onRecord} onDiscard={onDiscard} />)

    expect(screen.queryByRole('button', { name: /complete|star/i })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Record elapsed time only' }))
    expect(onRecord).toHaveBeenCalledOnce()
  })
})
