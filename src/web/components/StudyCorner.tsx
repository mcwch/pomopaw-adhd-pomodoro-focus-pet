import idleLion from '../assets/lion/idle.png'
import focusLion from '../assets/lion/focus.png'
import pausedLion from '../assets/lion/paused.png'
import breakLion from '../assets/lion/break.png'
import celebrateLion from '../assets/lion/celebrate.png'
import type { TimerPhase } from '../../shared/timer'

export default function StudyCorner({ phase, stars, celebrating = false }: { phase: TimerPhase; stars: number; celebrating?: boolean }): React.JSX.Element {
  const label = celebrating ? 'Blue-maned lion celebrating' : phase === 'focus' ? 'Blue-maned lion studying' : phase === 'paused' ? 'Blue-maned lion resting' : 'Blue-maned lion companion'
  const unlock = stars >= 3 ? 'Desk lamp unlocked' : 'Your first completed Pomodoro will light this corner.'
  const asset = celebrating ? celebrateLion : phase === 'focus' ? focusLion : phase === 'paused' ? pausedLion : phase === 'short_break' || phase === 'long_break' ? breakLion : idleLion
  return <aside className="study-corner" aria-label="Study corner"><img className={celebrating ? 'lion-state lion-state--celebrating' : 'lion-state'} src={asset} alt={label} /><div><h2>Study corner</h2><p>{celebrating ? 'A full focus block — you earned a star.' : phase === 'focus' ? 'Studying beside you.' : 'Here when you are ready.'}</p><p>{unlock}</p><p className="quiet-copy">Days you came back this week</p></div></aside>
}
