import { describe, expect, it } from 'vitest'
import { appReadyRequestSchema, ollamaFirstStepRequestSchema, ollamaFirstStepResponseSchema, ollamaStatusResponseSchema } from '../../src/shared/ipc'
describe('app-ready IPC request', () => { it('rejects renderer data outside the empty request contract', () => { expect(appReadyRequestSchema.safeParse({}).success).toBe(true); expect(appReadyRequestSchema.safeParse({ unexpected: true }).success).toBe(false) }) })

describe('local AI IPC response', () => {
  it('only accepts a simple availability and model list response', () => {
    expect(ollamaStatusResponseSchema.safeParse({ available: true, models: ['qwen2.5:3b'] }).success).toBe(true)
    expect(ollamaStatusResponseSchema.safeParse({ available: true, models: [3] }).success).toBe(false)
  })
})

describe('local AI first-step IPC contract', () => {
  it('accepts a short task and a nullable response', () => {
    expect(ollamaFirstStepRequestSchema.safeParse({ task: 'Outline my report' }).success).toBe(true)
    expect(ollamaFirstStepRequestSchema.safeParse({ task: '' }).success).toBe(false)
    expect(ollamaFirstStepResponseSchema.safeParse({ suggestion: null }).success).toBe(true)
  })
})
