import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StudyCorner from '../../src/renderer/src/components/StudyCorner'

describe('StudyCorner', () => {
  it('unlocks a lamp after the first completed focus star', () => {
    render(<StudyCorner stars={1} />)
    expect(screen.getByText('Desk lamp unlocked')).toBeTruthy()
  })

  it('does not show a lamp before a completed focus star', () => {
    render(<StudyCorner stars={0} />)
    expect(screen.queryByText('Desk lamp unlocked')).toBeNull()
  })
})
