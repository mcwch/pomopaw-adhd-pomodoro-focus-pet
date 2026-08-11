import { describe, expect, it } from 'vitest'
import { requestMistralFirstStep } from '../../src/server/mistral'

describe('Mistral cloud task helper', () => {
  it('returns the concise assistant message and sends a bounded request', async () => {
    let request: RequestInit | undefined
    const result = await requestMistralFirstStep('  Read two pages  ', 'test-key', async (_url, init) => {
      request = init
      return new Response(JSON.stringify({ choices: [{ message: { content: 'Open the book to page one.' } }] }), { status: 200 })
    })

    expect(result).toEqual({ available: true, suggestion: 'Open the book to page one.' })
    expect(request?.headers).toMatchObject({ authorization: 'Bearer test-key', 'content-type': 'application/json' })
    expect(JSON.parse(String(request?.body))).toMatchObject({ model: 'mistral-small-latest', stream: false, max_tokens: 80 })
    expect(JSON.parse(String(request?.body)).messages[1].content).toContain('Read two pages')
  })

  it('does not call Mistral when the API key is missing', async () => {
    let called = false
    const result = await requestMistralFirstStep('Read two pages', '', async () => {
      called = true
      return new Response('{}', { status: 200 })
    })

    expect(result).toEqual({ available: false, suggestion: null })
    expect(called).toBe(false)
  })

  it('returns unavailable for an unsuccessful Mistral response', async () => {
    const result = await requestMistralFirstStep('Read two pages', 'test-key', async () => new Response('{}', { status: 401 }))

    expect(result).toEqual({ available: false, suggestion: null })
  })
})
