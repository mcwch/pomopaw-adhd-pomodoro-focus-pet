import { useEffect, useState } from 'react'
import type { OllamaStatusResponse } from '../../../shared/ipc'

function LocalAiStatus(): React.JSX.Element {
  const [status, setStatus] = useState<OllamaStatusResponse | null>(null)

  useEffect(() => {
    window.focusApp?.ollamaStatus().then(setStatus).catch(() => setStatus({ available: false, models: [] }))
  }, [])

  if (!status) return <p className="local-ai-status">Checking optional local AI…</p>
  if (status.available) return <aside className="local-ai-status"><strong>Local AI ready: {status.models.join(', ') || 'Ollama'}</strong><span>Task context stays on this computer.</span></aside>

  return <aside className="local-ai-status"><strong>Optional local AI is not set up yet.</strong><span>Focus Companion works without it. To add private task help later, install Ollama and run <code>ollama run qwen2.5:3b</code>.</span></aside>
}

export default LocalAiStatus
