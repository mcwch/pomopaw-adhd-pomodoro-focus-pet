import { describe, expect, it } from 'vitest'
import { handleMistralProxyRequest } from '../../src/server/mistral-proxy'

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
})
