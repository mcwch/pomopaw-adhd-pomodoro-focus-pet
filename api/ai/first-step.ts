import { handleMistralVercelRequest } from '../../src/server/mistral-proxy'

export default async function handler(request: { method?: string; body?: unknown }, response: { status: (code: number) => { json: (body: unknown) => unknown }; json?: (body: unknown) => unknown }): Promise<void> {
  await handleMistralVercelRequest(request, response as Parameters<typeof handleMistralVercelRequest>[1])
}
