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

interface AppViewsProps {
  readonly snapshot: ReturnType<typeof useStudyStore.getState>['snapshot']
  readonly stars: number
  readonly history: ReturnType<typeof useStudyStore.getState>['history']
  readonly onStart: (title: string) => void
  readonly onPause: () => void
  readonly onResume: () => void
  readonly onEndEarly: () => void
}

function AppViews({ snapshot, stars, history, onStart, onPause, onResume, onEndEarly }: AppViewsProps): React.JSX.Element {
  const [view, setView] = useState<'focus' | 'progress'>('focus')
  const [darkMode, setDarkMode] = useState(() => window.localStorage.getItem('focus-companion:theme') === 'dark')

  useEffect(() => {
    window.localStorage.setItem('focus-companion:theme', darkMode ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return <div className={darkMode ? 'app-shell app-shell--dark' : 'app-shell'}>
    <nav className="app-nav" aria-label="Main navigation">
      <button type="button" className="app-nav__brand" onClick={() => setView('focus')}>Focus Companion</button>
      <div className="app-nav__links"><button className={view === 'focus' ? 'app-nav__tab app-nav__tab--active' : 'app-nav__tab'} type="button" onClick={() => setView('focus')}>Focus</button><button className={view === 'progress' ? 'app-nav__tab app-nav__tab--active' : 'app-nav__tab'} type="button" onClick={() => setView('progress')}>Progress</button><button className="app-nav__tab app-nav__tab--quiet" type="button" disabled title="Friends will arrive with accounts and cloud sync">Friends</button></div>
      <div className="app-nav__meta"><span>2 days back this week</span><button type="button" aria-label={darkMode ? 'Use light mode' : 'Use dark mode'} aria-pressed={darkMode} className="app-nav__settings" onClick={() => setDarkMode((value) => !value)}>{darkMode ? '☀' : '☾'}</button></div>
    </nav>
    {view === 'focus' ? <StudyDesk snapshot={snapshot} stars={stars} onStart={onStart} onPause={onPause} onResume={onResume} onEndEarly={onEndEarly} /> : <ProgressPage completedPomodoros={stars} sessions={history} onStartAnother={() => setView('focus')} />}
  </div>
}
