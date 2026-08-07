export type LocalOllamaStatus = {
  available: boolean
  models: string[]
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

export async function detectLocalOllama(fetchLike: FetchLike = fetch): Promise<LocalOllamaStatus> {
  try {
    const response = await fetchLike('http://127.0.0.1:11434/api/tags')
    if (!response.ok) return { available: false, models: [] }

    const body = await response.json() as { models?: Array<{ name?: string }> }
    return { available: true, models: body.models?.flatMap((model) => model.name ? [model.name] : []) ?? [] }
  } catch {
    return { available: false, models: [] }
  }
}

export async function getFirstStepFromLocalOllama(task: string, fetchLike: FetchLike = fetch): Promise<string | null> {
  try {
    const response = await fetchLike('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3:4b',
        stream: false,
        think: false,
        prompt: `Give one concrete first action for this task. Keep it under 20 words, kind and direct. Task: ${task}`
      })
    })
    if (!response.ok) return null

    const body = await response.json() as { response?: string }
    const suggestion = body.response?.replace(/<think>[\s\S]*?<\/think>\s*/g, '').trim()
    return suggestion || null
  } catch {
    return null
  }
}
