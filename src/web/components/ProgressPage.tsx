import { useState } from 'react'
import type { SessionRecord } from '../../shared/timer'
import { buildCalendarMonth, firstHistoryMonth, shiftMonth, type YearMonth } from '../progress-history'
import ProgressCalendar from './ProgressCalendar'
import StudyCornerScene from './StudyCornerScene'

export default function ProgressPage({ completedPomodoros, sessions, now = new Date() }: { completedPomodoros: number; sessions: SessionRecord[]; now?: Date }): React.JSX.Element {
  const current: YearMonth = { year: now.getFullYear(), month: now.getMonth() }
  const [visibleMonth, setVisibleMonth] = useState<YearMonth>(() => firstHistoryMonth(sessions) ?? current)
  const earliest = firstHistoryMonth(sessions)
  const canGoPrevious = earliest ? visibleMonth.year > earliest.year || (visibleMonth.year === earliest.year && visibleMonth.month > earliest.month) : false
  const canGoNext = visibleMonth.year < current.year || (visibleMonth.year === current.year && visibleMonth.month < current.month)
  const calendarMonth = buildCalendarMonth(sessions, visibleMonth.year, visibleMonth.month, now)

  return <main className="progress-page">
    <header className="progress-page__intro"><p className="eyebrow">Your progress</p><h1>Your time is real — even when it is not perfect.</h1><p>Browse the days you showed up. Flames celebrate full focus blocks; every recorded minute still has a place here.</p></header>
    <ProgressCalendar month={calendarMonth} canGoPrevious={canGoPrevious} canGoNext={canGoNext} onPrevious={() => setVisibleMonth((month) => shiftMonth(month, -1))} onNext={() => setVisibleMonth((month) => shiftMonth(month, 1))} />
    <StudyCornerScene completedPomodoros={completedPomodoros} />
  </main>
}
