import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Companion from '../../src/renderer/src/components/Companion'

describe('Companion', () => {
  it('describes a calm study state while the user focuses', () => {
    render(<Companion state="focus" />)
    expect(screen.getByText('Studying with you')).toBeTruthy()
  })
})
