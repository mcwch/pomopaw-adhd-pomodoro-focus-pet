import idleLion from '../assets/lion/idle.png'
import { nextDecoration, unlockedDecorations } from '../progress-unlocks'

export default function StudyCornerScene({ completedPomodoros }: { completedPomodoros: number }): React.JSX.Element {
  const unlocked = unlockedDecorations(completedPomodoros)
  const next = nextDecoration(completedPomodoros)
  return <section className="corner-scene" aria-labelledby="corner-scene-heading">
    <div className="corner-scene__copy"><p className="eyebrow">Your study corner</p><h2 id="corner-scene-heading">A room that grows with every full focus block.</h2><p>{next ? `${next.unlockAt - completedPomodoros} more completed focus ${next.unlockAt - completedPomodoros === 1 ? 'block' : 'blocks'} unlocks the ${next.label.toLowerCase()}.` : 'Your cozy corner is complete. Keep building gentle momentum.'}</p></div>
    <div className="corner-scene__room" aria-label={`${unlocked.length} study corner decorations unlocked`}>
      <img className="corner-scene__lion" src={idleLion} alt="Blue-maned lion companion" />
      {unlocked.map((decoration) => <img className={`corner-scene__asset corner-scene__asset--${decoration.id}`} src={decoration.asset} alt={decoration.label} key={decoration.id} />)}
    </div>
    <p className="corner-scene__count">{completedPomodoros} completed focus {completedPomodoros === 1 ? 'block' : 'blocks'} · {unlocked.length}/4 room details discovered</p>
  </section>
}
