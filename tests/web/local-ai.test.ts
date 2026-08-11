import { describe, expect, it } from 'vitest'
import { getLocalFirstStep } from '../../src/web/local-ai'

describe('web AI helper', () => {
  it('requests one concise first step from Mistral', async () => {
    let request: RequestInit | undefined
    const result = await getLocalFirstStep('  Write my literature review  ', async (url, init) => {
      expect(url).toBe('/api/ai/first-step')
      request = init
      return new Response(JSON.stringify({ available: true, suggestion: 'Open the document and write one heading.' }), { status: 200 })
    })

    expect(result).toEqual({ available: true, suggestion: 'Open the document and write one heading.' })
    expect(JSON.parse(String(request?.body))).toEqual({ task: 'Write my literature review' })
  })

  it('fails softly when the cloud helper is unavailable', async () => {
    const result = await getLocalFirstStep('Review notes', async () => new Response('{}', { status: 503 }))
    expect(result).toEqual({ available: false, suggestion: null })
  })

  it('does not call the cloud helper for an empty task', async () => {
    let called = false
    const result = await getLocalFirstStep('   ', async () => {
      called = true
      return new Response('{}', { status: 200 })
    })
    expect(result).toEqual({ available: true, suggestion: null })
    expect(called).toBe(false)
  })
})
