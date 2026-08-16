export type MistralFirstStepResult = { suggestion: string | null; available: boolean }

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

const MISTRAL_ENDPOINT = 'https://api.mistral.ai/v1/chat/completions'
const FIRST_STEP_SYSTEM_PROMPT = [
  'You are the task-start coach inside PomoPaw, an ADHD-friendly focus timer.',
  'Turn the user\'s situation into exactly one concrete first action that takes about 2 to 5 minutes.',
  'Use details from the user\'s message: name the actual object, app, document, person, or place when possible.',
  'Never invent details the user did not provide; use neutral wording when context is missing.',
  'If they name a task, start that task directly.',
  'Do not recommend breathing, meditation, motivation, or generic self-care unless they explicitly ask for emotional support.',
  'If they sound overwhelmed without naming a task, choose one tiny visible setup action that moves toward what they mentioned.',
  'Write one kind, direct sentence in imperative voice, under 20 words, with no preamble, bullets, or quotation marks.',
].join(' ')

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
        temperature: 0.45,
        messages: [
          { role: 'system', content: FIRST_STEP_SYSTEM_PROMPT },
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
