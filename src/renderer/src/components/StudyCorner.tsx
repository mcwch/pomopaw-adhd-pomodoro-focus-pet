export default function StudyCorner({ stars }: { stars: number }): React.JSX.Element {
  return <section className="study-corner"><p className="eyebrow">STUDY CORNER · {stars} focus stars</p>{stars >= 1 ? <p>Desk lamp unlocked</p> : <p>Your first completed Pomodoro will light this corner.</p>}</section>
}
