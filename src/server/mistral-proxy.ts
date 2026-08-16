import type { IncomingMessage, ServerResponse } from 'node:http'
import { requestMistralFirstStep, type MistralFirstStepResult } from './mistral'

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>
type ProxyBody = { available: boolean; suggestion: string | null }
type VercelRequestLike = { method?: string; body?: unknown }
type VercelResponseLike = { status: (code: number) => VercelResponseLike; json: (body: ProxyBody) => VercelResponseLike }

export async function handleMistralProxyRequest(input: { method?: string; task?: unknown }, apiKey: string | undefined, fetchLike: FetchLike = fetch): Promise<{ status: number; body: ProxyBody }> {
  if (input.method !== 'POST') return { status: 405, body: { available: false, suggestion: null } }
  if (typeof input.task !== 'string' || !input.task.trim() || input.task.trim().length > 500) return { status: 400, body: { available: false, suggestion: null } }
  if (!apiKey?.trim()) return { status: 503, body: { available: false, suggestion: null } }

  const result: MistralFirstStepResult = await requestMistralFirstStep(input.task, apiKey, fetchLike)
  return { status: result.available ? 200 : 502, body: result }
}

export async function handleMistralVercelRequest(request: VercelRequestLike, response: VercelResponseLike, apiKey: string | undefined = process.env.ADHD_APP_MISTRAL_API_KEY, fetchLike: FetchLike = fetch): Promise<void> {
  let body: { task?: unknown } = {}
  if (typeof request.body === 'string') {
    try {
      body = JSON.parse(request.body) as { task?: unknown }
    } catch {
      body = {}
    }
  } else if (request.body && typeof request.body === 'object') {
    body = request.body as { task?: unknown }
  }

  const result = await handleMistralProxyRequest({ method: request.method, task: body.task }, apiKey, fetchLike)
  response.status(result.status).json(result.body)
}

function writeJson(response: ServerResponse, status: number, body: ProxyBody): void {
  response.statusCode = status
  response.setHeader('content-type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(body))
}

export function createMistralProxyMiddleware(apiKey: string | undefined, fetchLike: FetchLike = fetch) {
  return (request: IncomingMessage, response: ServerResponse, next: () => void): void => {
    if ((request.url ?? '').split('?')[0] !== '/api/ai/first-step') {
      next()
      return
    }
    if (request.method !== 'POST') {
      writeJson(response, 405, { available: false, suggestion: null })
      return
    }

    let raw = ''
    let tooLarge = false
    request.setEncoding('utf8')
    request.on('data', (chunk: string) => {
      raw += chunk
      if (raw.length > 16_000) tooLarge = true
    })
    request.on('end', () => {
      if (tooLarge) {
        writeJson(response, 413, { available: false, suggestion: null })
        return
      }
      let body: { task?: unknown }
      try {
        body = JSON.parse(raw) as { task?: unknown }
      } catch {
        writeJson(response, 400, { available: false, suggestion: null })
        return
      }
      void handleMistralProxyRequest({ method: request.method, task: body.task }, apiKey, fetchLike).then((result) => writeJson(response, result.status, result.body))
    })
  }
}
