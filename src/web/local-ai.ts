export type LocalAiResult = { suggestion: string | null; available: boolean }

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

const OLLAMA_BASE = 'http://127.0.0.1:11434'

export async function getLocalFirstStep(task: string, fetchLike: FetchLike = fetch): Promise<LocalAiResult> {
  const cleanedTask = task.trim()
  if (!cleanedTask) return { suggestion: null, available: true }

  try {
    const response = await fetchLike(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3:4b',
        stream: false,
        think: false,
        prompt: `Give one concrete first action for this task. Keep it under 20 words, kind and direct. Task: ${cleanedTask}`,
      }),
    })
    if (!response.ok) return { suggestion: null, available: false }
    const body = await response.json() as { response?: string }
    const suggestion = body.response?.replace(/<think>[\s\S]*?<\/think>\s*/g, '').trim() || null
    return { suggestion, available: true }
  } catch {
    return { suggestion: null, available: false }
  }
}
