import { useEffect } from 'react'
import RecoveryNotice from './components/RecoveryNotice'
import StudyDesk from './components/StudyDesk'
import { useStudyStore } from './store'
import './styles/study-desk.css'

export default function WebApp(): React.JSX.Element {
  const hydrated = useStudyStore((state) => state.hydrated)
  const snapshot = useStudyStore((state) => state.snapshot)
  const recovery = useStudyStore((state) => state.recovery)
  const stars = useStudyStore((state) => state.stars)
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
  return <StudyDesk snapshot={snapshot} stars={stars} onStart={(title) => void start(title)} onPause={() => void pause()} onResume={() => void resume()} onEndEarly={() => void endEarly()} />
}
