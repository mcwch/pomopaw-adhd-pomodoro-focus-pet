import stitchStudyLion from '../assets/lion/stitch-study-desk.png'
import type { TimerPhase } from '../../shared/timer'

export default function StudyCorner({ phase, stars, celebrating = false }: { phase: TimerPhase; stars: number; celebrating?: boolean }): React.JSX.Element {
  const label = celebrating ? 'Blue-maned lion celebrating' : phase === 'focus' ? 'Blue-maned lion studying' : phase === 'paused' ? 'Blue-maned lion resting' : 'Blue-maned lion companion'
  const unlock = stars >= 3 ? 'The lamp brightened after your last focus.' : 'The lamp will brighten after your third full focus.'
  const asset = stitchStudyLion
  return <aside className="study-corner" aria-label="Study corner">
    <p className="study-corner__label">☆ Study corner · {stars} focus {stars === 1 ? 'star' : 'stars'}</p>
    <div className="study-corner__scene"><img className={celebrating ? 'lion-state lion-state--celebrating' : 'lion-state'} src={asset} alt={label} /><div className="study-corner__slots" aria-hidden="true"><span>♧</span><span>▤</span><span>♧</span></div></div>
    <div className="study-corner__message"><h2>Study corner</h2><p>{celebrating ? 'A full focus block — you earned a star.' : phase === 'focus' ? 'Studying beside you.' : 'Here when you are ready.'}</p><p>{unlock}</p><p className="quiet-copy">Days you came back this week</p></div>
  </aside>
}
