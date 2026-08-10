import type { CalendarMonth } from '../progress-history'

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function ProgressCalendar({ month, onPrevious, onNext, canGoPrevious, canGoNext }: { month: CalendarMonth; onPrevious: () => void; onNext: () => void; canGoPrevious: boolean; canGoNext: boolean }): React.JSX.Element {
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(month.year, month.month, 1))
  const leadingDays = new Date(month.year, month.month, 1).getDay()

  return <section className="progress-calendar" aria-labelledby="calendar-heading">
    <header className="progress-calendar__header">
      <button type="button" className="calendar-nav" aria-label="Previous month" onClick={onPrevious} disabled={!canGoPrevious}>‹</button>
      <h2 id="calendar-heading">{monthName}</h2>
      <button type="button" className="calendar-nav" aria-label="Next month" onClick={onNext} disabled={!canGoNext}>›</button>
    </header>
    <div className="calendar-weekdays" aria-hidden="true">{weekdayLabels.map((weekday) => <span key={weekday}>{weekday}</span>)}</div>
    <div className="calendar-grid" role="grid" aria-label={`${monthName} focus history`}>
      {Array.from({ length: leadingDays }, (_, index) => <span className="calendar-empty" aria-hidden="true" key={`empty-${index}`} />)}
      {month.days.map((day) => <div role="gridcell" key={day.dateKey}>
        <div className={`calendar-day${day.recordedMinutes > 0 ? ' calendar-day--focused' : ''}${day.isFuture ? ' calendar-day--future' : ''}`} aria-label={dayLabel(monthName, day.day, day.recordedMinutes, day.completedPomodoros)}>
          <span className="calendar-day__number">{day.day}</span>
          {day.hasFlame && <span className="calendar-day__flame" aria-hidden="true">🔥</span>}
          {day.recordedMinutes > 0 && <span className="calendar-day__minutes">{day.recordedMinutes}m</span>}
        </div>
      </div>)}
    </div>
    <p className="calendar-legend"><span aria-hidden="true">🔥</span> A flame means you completed one full focus block that day. Every recorded minute still counts.</p>
  </section>
}

function dayLabel(monthName: string, day: number, minutes: number, completedPomodoros: number): string {
  if (minutes === 0) return `${monthName.split(' ')[0]} ${day}: no focus recorded`
  const pomodoroLabel = completedPomodoros === 1 ? '1 completed Pomodoro' : `${completedPomodoros} completed Pomodoros`
  return completedPomodoros > 0 ? `${monthName.split(' ')[0]} ${day}: ${minutes} focused minutes, ${pomodoroLabel}` : `${monthName.split(' ')[0]} ${day}: ${minutes} focused minutes`
}
