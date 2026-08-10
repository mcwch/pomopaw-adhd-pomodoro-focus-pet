import { useEffect, useState } from 'react'
import ProgressPage from './components/ProgressPage'
import RecoveryNotice from './components/RecoveryNotice'
import StudyDesk from './components/StudyDesk'
import { useStudyStore } from './store'
import './styles/study-desk.css'

export default function WebApp(): React.JSX.Element {
  const hydrated = useStudyStore((state) => state.hydrated)
  const snapshot = useStudyStore((state) => state.snapshot)
  const recovery = useStudyStore((state) => state.recovery)
  const stars = useStudyStore((state) => state.stars)
  const history = useStudyStore((state) => state.history)
  const hydrate = useStudyStore((state) => state.hydrate)
  const start = useStudyStore((state) => state.start)
  const pause = useStudyStore((state) => state.pause)
  const resume = useStudyStore((state) => state.resume)
  const endEarly = useStudyStore((state) => state.endEarly)
  const tick = useStudyStore((state) => state.tick)
  const resolveRecovery = useStudyStore((state) => state.resolveRecovery)

  useEffect(() => { void hydrate() }, [hydrate])
  useEffect(() => {
    if (!['focus', 'short_break', 'long_break'].includes(snapshot.phase)) return
    const interval = window.setInterval(() => void tick(), 1000)
    return () => window.clearInterval(interval)
  }, [snapshot.phase, tick])

  if (!hydrated) return <main className="web-loading">Opening your study desk...</main>
  if (recovery) return <main className="web-loading"><RecoveryNotice elapsedSeconds={recovery.elapsedSeconds} onRecord={() => void resolveRecovery('record_partial')} onDiscard={() => void resolveRecovery('discard')} /></main>
  return <AppViews snapshot={snapshot} stars={stars} history={history} onStart={(title) => void start(title)} onPause={() => void pause()} onResume={() => void resume()} onEndEarly={() => void endEarly()} />
}

function AppViews({ snapshot, stars, history, onStart, onPause, onResume, onEndEarly }: { snapshot: ReturnType<typeof useStudyStore.getState>['snapshot']; stars: number; history: ReturnType<typeof useStudyStore.getState>['history']; onStart: (title: string) => void; onPause: () => void; onResume: () => void; onEndEarly: () => void }): React.JSX.Element {
  const [view, setView] = useState<'focus' | 'progress'>('focus')
  return <div className="app-shell"><nav className="app-nav" aria-label="Main navigation"><span className="app-nav__brand">Focus Companion</span><div className="app-nav__links"><button className={view === 'focus' ? 'app-nav__tab app-nav__tab--active' : 'app-nav__tab'} type="button" onClick={() => setView('focus')}>Focus</button><button className={view === 'progress' ? 'app-nav__tab app-nav__tab--active' : 'app-nav__tab'} type="button" onClick={() => setView('progress')}>Progress</button><button className="app-nav__tab app-nav__tab--quiet" type="button" disabled title="Friends will arrive with accounts and cloud sync">Friends</button></div><div className="app-nav__meta"><span>2 days back this week</span><button type="button" aria-label="Settings" className="app-nav__settings" disabled>⚙</button></div></nav>{view === 'focus' ? <StudyDesk snapshot={snapshot} stars={stars} onStart={onStart} onPause={onPause} onResume={onResume} onEndEarly={onEndEarly} /> : <ProgressPage completedPomodoros={stars} sessions={history} onStartAnother={() => setView('focus')} />}</div>
}
