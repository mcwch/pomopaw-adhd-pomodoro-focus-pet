export type MistralFirstStepResult = { suggestion: string | null; available: boolean }

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

const MISTRAL_ENDPOINT = 'https://api.mistral.ai/v1/chat/completions'

export async function requestMistralFirstStep(task: string, apiKey: string, fetchLike: FetchLike = fetch): Promise<MistralFirstStepResult> {
  const cleanedTask = task.trim()
  const cleanedKey = apiKey.trim()
  if (!cleanedTask || !cleanedKey) return { suggestion: null, available: false }

  try {
    const response = await fetchLike(MISTRAL_ENDPOINT, {
      method: 'POST',
      headers: { authorization: `Bearer ${cleanedKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        stream: false,
        max_tokens: 80,
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'You help an ADHD-friendly focus app. Give exactly one concrete first action, under 20 words, kind and direct. Return only that action.' },
          { role: 'user', content: `Task: ${cleanedTask}` },
        ],
      }),
    })
    if (!response.ok) return { suggestion: null, available: false }
    const body = await response.json() as { choices?: Array<{ message?: { content?: string | null } }> }
    const suggestion = body.choices?.[0]?.message?.content?.trim() || null
    return { suggestion, available: true }
  } catch {
    return { suggestion: null, available: false }
  }
}
