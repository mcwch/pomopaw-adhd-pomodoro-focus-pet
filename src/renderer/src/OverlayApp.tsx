import Companion from './components/Companion'

function OverlayApp({ task }: { task: string }): React.JSX.Element {
  return <main className="overlay-screen"><Companion state="focus" /><div><p className="eyebrow">FOCUS COMPANION</p><strong>{task}</strong></div></main>
}

export default OverlayApp
