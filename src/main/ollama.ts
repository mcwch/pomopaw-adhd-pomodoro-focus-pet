export type LocalOllamaStatus = {
  available: boolean
  models: string[]
}

type FetchLike = (input: string) => Promise<Response>

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
