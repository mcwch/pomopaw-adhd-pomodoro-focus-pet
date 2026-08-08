import { useEffect } from 'react'
import RecoveryNotice from './components/RecoveryNotice'
import StudyDesk from './components/StudyDesk'
import { useStudyStore } from './store'
import './styles/study-desk.css'

export default function WebApp(): React.JSX.Element {
  const store = useStudyStore(); useEffect(() => { void store.hydrate() }, [])
  if (!store.hydrated) return <main className="web-loading">Opening your study desk…</main>
  if (store.recovery) return <main className="web-loading"><RecoveryNotice elapsedSeconds={store.recovery.elapsedSeconds} onRecord={() => void store.resolveRecovery('record_partial')} onDiscard={() => void store.resolveRecovery('discard')} /></main>
  return <StudyDesk snapshot={store.snapshot} stars={store.stars} onStart={(title) => void store.start(title)} onPause={() => void store.pause()} onResume={() => void store.resume()} onEndEarly={() => void store.endEarly()} />
}
