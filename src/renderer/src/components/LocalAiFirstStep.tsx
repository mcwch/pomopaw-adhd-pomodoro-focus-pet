import { useState } from 'react'

function LocalAiFirstStep({ task }: { task: string }): React.JSX.Element {
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function askForFirstStep(): Promise<void> {
    if (!task.trim()) return
    setLoading(true)
    const result = await window.focusApp.mistralFirstStep(task).catch(() => ({ suggestion: null }))
    setSuggestion(result.suggestion)
    setLoading(false)
  }

  return <section className="local-ai-first-step">
    <button className="quiet" disabled={!task.trim() || loading} onClick={askForFirstStep}>{loading ? 'Thinking…' : 'Help me choose a first step'}</button>
    {suggestion && <p><strong>Try this:</strong> {suggestion}</p>}
    {suggestion === null && !loading && <span>Optional: asks Mistral to turn the task into one clear first step.</span>}
  </section>
}

export default LocalAiFirstStep
