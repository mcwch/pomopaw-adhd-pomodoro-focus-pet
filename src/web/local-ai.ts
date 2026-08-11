export type LocalAiResult = { suggestion: string | null; available: boolean }

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

const OLLAMA_DIRECT = 'http://127.0.0.1:11434/api/generate'
const OLLAMA_PROXY = '/api/ollama/api/generate'
const LOCAL_AI_TIMEOUT_MS = 20_000

function finalAnswer(raw: string): string | null {
  const afterThinking = raw.replace(/^[\s\S]*?<\/think>\s*/i, '').replace(/<think>[\s\S]*?<\/think>\s*/gi, '').trim()
  return afterThinking || null
}

export async function getLocalFirstStep(task: string, fetchLike: FetchLike = fetch): Promise<LocalAiResult> {
  const cleanedTask = task.trim()
  if (!cleanedTask) return { suggestion: null, available: true }

  const endpoints = typeof window !== 'undefined' && window.location.protocol.startsWith('http') ? [OLLAMA_PROXY, OLLAMA_DIRECT] : [OLLAMA_DIRECT]
  try {
    for (const endpoint of endpoints) {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
      const timeout = setTimeout(() => controller?.abort(), LOCAL_AI_TIMEOUT_MS)
      try {
        const response = await fetchLike(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          signal: controller?.signal,
          body: JSON.stringify({
            model: 'qwen3:4b',
            stream: false,
            think: false,
            prompt: `Give one concrete first action for this task. Keep it under 20 words, kind and direct. Task: ${cleanedTask}`,
          }),
        })
        if (!response.ok) continue
        const body = await response.json() as { response?: string }
        const suggestion = finalAnswer(body.response ?? '')
        return { suggestion, available: true }
      } catch {
        // Try the direct local endpoint after a dev proxy is unavailable.
      } finally {
        clearTimeout(timeout)
      }
    }
    return { suggestion: null, available: false }
  } catch {
    return { suggestion: null, available: false }
  }
}
