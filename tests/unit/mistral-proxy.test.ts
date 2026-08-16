import { describe, expect, it } from 'vitest'
import { handleMistralProxyRequest, handleMistralVercelRequest } from '../../src/server/mistral-proxy'

describe('Mistral proxy request handler', () => {
  it('returns the first-step suggestion from the cloud boundary', async () => {
    const result = await handleMistralProxyRequest({ method: 'POST', task: 'Read two pages' }, 'test-key', async () => new Response(JSON.stringify({ choices: [{ message: { content: 'Open the book.' } }] }), { status: 200 }))

    expect(result).toEqual({ status: 200, body: { available: true, suggestion: 'Open the book.' } })
  })

  it('returns service unavailable when the server key is missing', async () => {
    const result = await handleMistralProxyRequest({ method: 'POST', task: 'Read two pages' }, '', async () => new Response('{}', { status: 200 }))

    expect(result).toEqual({ status: 503, body: { available: false, suggestion: null } })
  })

  it('rejects unsupported methods and oversized tasks', async () => {
    const methodResult = await handleMistralProxyRequest({ method: 'GET', task: 'Read two pages' }, 'test-key')
    const sizeResult = await handleMistralProxyRequest({ method: 'POST', task: 'x'.repeat(501) }, 'test-key')

    expect(methodResult.status).toBe(405)
    expect(sizeResult.status).toBe(400)
  })

  it('adapts a Vercel request to the shared Mistral handler', async () => {
    const response = {
      statusCode: 0,
      payload: undefined as unknown,
      status(code: number) {
        this.statusCode = code
        return this
      },
      json(payload: unknown) {
        this.payload = payload
        return this
      },
    }

    await handleMistralVercelRequest(
      { method: 'POST', body: { task: 'Read two pages' } },
      response,
      'test-key',
      async () => new Response(JSON.stringify({ choices: [{ message: { content: 'Open the book.' } }] }), { status: 200 }),
    )

    expect(response.statusCode).toBe(200)
    expect(response.payload).toEqual({ available: true, suggestion: 'Open the book.' })
  })
})
