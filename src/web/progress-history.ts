import type { SessionRecord } from '../shared/timer'

export interface YearMonth { year: number; month: number }
export interface CalendarDay { dateKey: string; day: number; isFuture: boolean; recordedMinutes: number; completedPomodoros: number; hasFlame: boolean }
export interface CalendarMonth extends YearMonth { days: CalendarDay[] }

export function buildCalendarMonth(sessions: SessionRecord[], year: number, month: number, now: Date): CalendarMonth {
  const byDate = new Map<string, SessionRecord[]>()
  for (const session of sessions) {
    if (session.outcome === 'discarded') continue
    const key = localDateKey(session.startedAt)
    byDate.set(key, [...(byDate.get(key) ?? []), session])
  }
  const count = new Date(year, month + 1, 0).getDate()
  return { year, month, days: Array.from({ length: count }, (_, index) => makeDay(year, month, index + 1, byDate, now)) }
}

export function firstHistoryMonth(sessions: SessionRecord[]): YearMonth | null {
  const first = sessions.filter((session) => session.outcome !== 'discarded').sort((left, right) => Date.parse(left.startedAt) - Date.parse(right.startedAt))[0]
  if (!first) return null
  const date = new Date(first.startedAt)
  return { year: date.getFullYear(), month: date.getMonth() }
}

export function shiftMonth(month: YearMonth, offset: number): YearMonth {
  const date = new Date(month.year, month.month + offset, 1)
  return { year: date.getFullYear(), month: date.getMonth() }
}

function makeDay(year: number, month: number, day: number, byDate: Map<string, SessionRecord[]>, now: Date): CalendarDay {
  const date = new Date(year, month, day)
  const dateKey = calendarDateKey(year, month, day)
  const sessions = byDate.get(dateKey) ?? []
  const completedPomodoros = sessions.filter((session) => session.outcome === 'completed').length
  return { dateKey, day, isFuture: date > startOfDay(now), recordedMinutes: sessions.reduce((total, session) => total + Math.floor(session.elapsedSeconds / 60), 0), completedPomodoros, hasFlame: completedPomodoros > 0 }
}

function localDateKey(value: string): string {
  const date = new Date(value)
  return calendarDateKey(date.getFullYear(), date.getMonth(), date.getDate())
}

function calendarDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function startOfDay(value: Date): Date { return new Date(value.getFullYear(), value.getMonth(), value.getDate()) }
