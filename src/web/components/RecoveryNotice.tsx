export default function RecoveryNotice({ elapsedSeconds, onRecord, onDiscard }: { elapsedSeconds: number; onRecord: () => void; onDiscard: () => void }): React.JSX.Element {
  return <section role="dialog" aria-label="Recovered focus session"><h1>Your timer finished while the app was closed.</h1><p>{Math.floor(elapsedSeconds / 60)} minutes can be recorded without a star.</p><button onClick={onRecord}>Record elapsed time only</button><button onClick={onDiscard}>Discard this session</button></section>
}
