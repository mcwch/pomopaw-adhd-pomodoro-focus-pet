import { describe, expect, it } from 'vitest'
import { getLocalFirstStep } from '../../src/web/local-ai'

describe('web local AI helper', () => {
  it('tries the cloud first-step proxy before local Ollama', async () => {
    const urls: string[] = []
    const result = await getLocalFirstStep('Write my literature review', async (url, init) => {
      urls.push(url)
      expect(JSON.parse(String(init?.body))).toEqual({ task: 'Write my literature review' })
      return new Response(JSON.stringify({ available: true, suggestion: 'Open the document and write one heading.' }), { status: 200 })
    })

    expect(result).toEqual({ available: true, suggestion: 'Open the document and write one heading.' })
    expect(urls[0]).toBe('/api/ai/first-step')
  })

  it('requests one concise first step from the local Qwen model', async () => {
    let request: RequestInit | undefined
    const result = await getLocalFirstStep('Write my literature review', async (_url, init) => {
      request = init
      return new Response(JSON.stringify({ response: '<think>private</think>Open a document and list three papers.' }), { status: 200 })
    })

    expect(result).toEqual({ available: true, suggestion: 'Open a document and list three papers.' })
    expect(JSON.parse(String(request?.body))).toMatchObject({ model: 'qwen3:4b', stream: false, think: false })
  })

  it('keeps only the final answer when Qwen mixes a closing think marker into response', async () => {
    const result = await getLocalFirstStep('Read two pages', async () => new Response(JSON.stringify({ response: 'private reasoning... </think>\n\nOpen the book to page one.' }), { status: 200 }))

    expect(result).toEqual({ available: true, suggestion: 'Open the book to page one.' })
  })

  it('fails softly when Ollama is not running', async () => {
    const result = await getLocalFirstStep('Review notes', async () => { throw new Error('connection refused') })
    expect(result).toEqual({ available: false, suggestion: null })
  })
})
