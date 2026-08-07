import { describe, expect, it } from 'vitest'
import { detectLocalOllama } from '../../src/main/ollama'

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
