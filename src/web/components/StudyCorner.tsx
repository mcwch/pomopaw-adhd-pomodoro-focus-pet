import lion from '../../renderer/src/assets/lion/blue-maned-study-lion.png'
import type { TimerPhase } from '../../shared/timer'

export default function StudyCorner({ phase, stars }: { phase: TimerPhase; stars: number }): React.JSX.Element {
  const label = phase === 'focus' ? 'Blue-maned lion studying' : phase === 'paused' ? 'Blue-maned lion resting' : 'Blue-maned lion companion'
  const unlock = stars >= 3 ? 'Desk lamp unlocked' : 'Your first completed Pomodoro will light this corner.'
  return <aside className="study-corner" aria-label="Study corner"><img src={lion} alt={label} /><div><h2>Study corner</h2><p>{phase === 'focus' ? 'Studying beside you.' : 'Here when you are ready.'}</p><p>{unlock}</p><p className="quiet-copy">Days you came back this week</p></div></aside>
}
