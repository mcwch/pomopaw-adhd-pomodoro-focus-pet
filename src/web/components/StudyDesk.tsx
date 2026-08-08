import type { TimerSnapshot } from '../../shared/timer'
import FocusCanvas from './FocusCanvas'
import StudyCorner from './StudyCorner'
import TodayRail from './TodayRail'

export default function StudyDesk({ snapshot, stars, onStart, onPause, onResume, onEndEarly }: { snapshot: TimerSnapshot; stars: number; onStart: (title: string) => void; onPause: () => void; onResume: () => void; onEndEarly: () => void }): React.JSX.Element {
  return <main className="study-desk"><TodayRail tasks={['Outline report', 'Reply to one email', 'Read two pages']} onChoose={onStart} /><FocusCanvas snapshot={snapshot} onStart={onStart} onPause={onPause} onResume={onResume} onEndEarly={onEndEarly} /><StudyCorner phase={snapshot.phase} stars={stars} /></main>
}
