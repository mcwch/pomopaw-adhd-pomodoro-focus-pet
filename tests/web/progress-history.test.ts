import { describe, expect, it } from 'vitest'
import type { SessionRecord } from '../../src/shared/timer'
import { buildCalendarMonth, firstHistoryMonth } from '../../src/web/progress-history'

function session(outcome: SessionRecord['outcome'], startedAt: string, elapsedSeconds: number): SessionRecord {
  return { id: `${outcome}-${startedAt}`, taskId: 'task', startedAt, endedAt: startedAt, elapsedSeconds, outcome, awardedStars: outcome === 'completed' ? 1 : 0 }
}

function day(month: ReturnType<typeof buildCalendarMonth>, dateKey: string) {
  const result = month.days.find((item) => item.dateKey === dateKey)
  if (!result) throw new Error(`Missing ${dateKey}`)
  return result
}

describe('progress history', () => {
  it('keeps partial minutes but creates a flame only for completed focus', () => {
    const month = buildCalendarMonth([
      session('partial', '2026-08-03T09:00:00.000Z', 18 * 60),
      session('completed', '2026-08-04T09:00:00.000Z', 25 * 60),
    ], 2026, 7, new Date('2026-08-31T12:00:00.000Z'))

    expect(day(month, '2026-08-03')).toMatchObject({ recordedMinutes: 18, completedPomodoros: 0, hasFlame: false })
    expect(day(month, '2026-08-04')).toMatchObject({ recordedMinutes: 25, completedPomodoros: 1, hasFlame: true })
  })

  it('uses the first non-discarded session as the earliest month', () => {
    expect(firstHistoryMonth([
      session('discarded', '2026-05-01T09:00:00.000Z', 60),
      session('partial', '2026-06-15T09:00:00.000Z', 60),
    ])).toEqual({ year: 2026, month: 5 })
  })
})
