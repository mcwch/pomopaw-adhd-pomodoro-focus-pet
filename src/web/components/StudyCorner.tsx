import idleLion from '../assets/lion/idle.png'
import focusLion from '../assets/lion/focus.png'
import pausedLion from '../assets/lion/paused.png'
import breakLion from '../assets/lion/break.png'
import type { TimerPhase } from '../../shared/timer'

export default function StudyCorner({ phase, stars }: { phase: TimerPhase; stars: number }): React.JSX.Element {
  const label = phase === 'focus' ? 'Blue-maned lion studying' : phase === 'paused' ? 'Blue-maned lion resting' : 'Blue-maned lion companion'
  const unlock = stars >= 3 ? 'Desk lamp unlocked' : 'Your first completed Pomodoro will light this corner.'
  const asset = phase === 'focus' ? focusLion : phase === 'paused' ? pausedLion : phase === 'short_break' || phase === 'long_break' ? breakLion : idleLion
  return <aside className="study-corner" aria-label="Study corner"><img src={asset} alt={label} /><div><h2>Study corner</h2><p>{phase === 'focus' ? 'Studying beside you.' : 'Here when you are ready.'}</p><p>{unlock}</p><p className="quiet-copy">Days you came back this week</p></div></aside>
}
