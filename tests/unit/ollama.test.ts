import { describe, expect, it } from 'vitest'
import { detectLocalOllama, getFirstStepFromLocalOllama } from '../../src/main/ollama'

describe('detectLocalOllama', () => {
  it('reports the locally installed models when Ollama is available', async () => {
    const status = await detectLocalOllama(async () => new Response(JSON.stringify({ models: [{ name: 'qwen2.5:3b' }] }), { status: 200 }))

    expect(status).toEqual({ available: true, models: ['qwen2.5:3b'] })
  })

  it('keeps the companion usable when Ollama is not running', async () => {
    const status = await detectLocalOllama(async () => { throw new Error('connection refused') })

    expect(status).toEqual({ available: false, models: [] })
  })
})

describe('getFirstStepFromLocalOllama', () => {
  it('returns the model’s concise first action for a task', async () => {
    const suggestion = await getFirstStepFromLocalOllama('Write my literature review', async () => new Response(JSON.stringify({ response: 'Open a document and list three papers to review.' }), { status: 200 }))

    expect(suggestion).toBe('Open a document and list three papers to review.')
  })

  it('returns no suggestion when the local model cannot answer', async () => {
    const suggestion = await getFirstStepFromLocalOllama('Write my literature review', async () => new Response('{}', { status: 500 }))

    expect(suggestion).toBeNull()
  })

  it('removes Qwen reasoning markup before showing the first action', async () => {
    const suggestion = await getFirstStepFromLocalOllama('Review lecture notes', async () => new Response(JSON.stringify({ response: '<think>private reasoning</think>Scan the headings and mark the three weakest sections.' }), { status: 200 }))

    expect(suggestion).toBe('Scan the headings and mark the three weakest sections.')
  })

  it('removes a Qwen closing think marker before showing the first action', async () => {
    const suggestion = await getFirstStepFromLocalOllama('Review lecture notes', async () => new Response(JSON.stringify({ response: 'private reasoning... </think>\n\nScan the headings and mark the three weakest sections.' }), { status: 200 }))

    expect(suggestion).toBe('Scan the headings and mark the three weakest sections.')
  })
})
