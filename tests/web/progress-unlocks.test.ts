import { describe, expect, it } from 'vitest'
import { unlockedDecorations } from '../../src/web/progress-unlocks'

describe('unlockedDecorations', () => {
  it('adds reusable room objects at fixed completed-focus milestones', () => {
    expect(unlockedDecorations(0)).toEqual([])
    expect(unlockedDecorations(3).map((item) => item.id)).toEqual(['lamp'])
    expect(unlockedDecorations(8).map((item) => item.id)).toEqual(['lamp', 'books', 'plant', 'window'])
  })
})
