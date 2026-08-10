import { useState } from 'react'
import type { SessionRecord } from '../../shared/timer'
import { buildCalendarMonth, firstHistoryMonth, shiftMonth, type YearMonth } from '../progress-history'
import ProgressCalendar from './ProgressCalendar'
import StudyCornerScene from './StudyCornerScene'

export default function ProgressPage({ completedPomodoros, sessions, now = new Date(), onStartAnother }: { completedPomodoros: number; sessions: SessionRecord[]; now?: Date; onStartAnother?: () => void }): React.JSX.Element {
  const current: YearMonth = { year: now.getFullYear(), month: now.getMonth() }
  const [visibleMonth, setVisibleMonth] = useState<YearMonth>(() => firstHistoryMonth(sessions) ?? current)
  const earliest = firstHistoryMonth(sessions)
  const canGoPrevious = earliest ? visibleMonth.year > earliest.year || (visibleMonth.year === earliest.year && visibleMonth.month > earliest.month) : false
  const canGoNext = visibleMonth.year < current.year || (visibleMonth.year === current.year && visibleMonth.month < current.month)
  const calendarMonth = buildCalendarMonth(sessions, visibleMonth.year, visibleMonth.month, now)
  const recordedMinutes = sessions.filter((session) => session.outcome !== 'discarded').reduce((total, session) => total + Math.floor(session.elapsedSeconds / 60), 0)
  const taskCheckIns = sessions.filter((session) => session.outcome !== 'discarded' && session.taskId).length

  return <main className="progress-page">
    <header className="progress-page__intro"><p className="eyebrow">Your progress</p><h1>You came back.</h1><p>Small sessions add up. There&apos;s nothing to catch up on.</p></header>
    <div className="progress-page__columns">
      <div className="progress-page__main">
        <ProgressCalendar month={calendarMonth} canGoPrevious={canGoPrevious} canGoNext={canGoNext} onPrevious={() => setVisibleMonth((month) => shiftMonth(month, -1))} onNext={() => setVisibleMonth((month) => shiftMonth(month, 1))} />
        <p className="progress-page__note">Verified focus minutes reflect recorded time; only complete 25-minute sessions earn focus stars.</p>
        <div className="progress-stats" aria-label="Progress summary"><Stat value={recordedMinutes} label="verified focus minutes" /><Stat value={completedPomodoros} label="completed Pomodoros" /><Stat value={taskCheckIns} label="small tasks moved forward" /></div>
        <section className="milestones" aria-labelledby="milestones-heading"><h2 id="milestones-heading">Milestones</h2><div className="milestone-list"><span>🔥 First 25</span><span>● Three sessions</span><span>↗ Back this week</span><span className="milestone-list__muted">☆ Five focus stars</span></div><button className="primary-action" type="button" onClick={onStartAnother}>Start another 25 minutes</button></section>
      </div>
      <div className="progress-page__aside"><StudyCornerScene completedPomodoros={completedPomodoros} /><section className="friends-cta" aria-label="Friends preview"><button type="button" disabled>See weekly friends board <span aria-hidden="true">→</span></button><p>Friends features are opt-in and use recorded focus time.</p></section></div>
    </div>
  </main>
}

function Stat({ value, label }: { value: number; label: string }): React.JSX.Element { return <div className="progress-stat"><strong>{value}</strong><span>{label}</span></div> }
