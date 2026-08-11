import { describe, expect, it } from 'vitest'
import { appReadyRequestSchema, timerStartRequestSchema, recoveryActionRequestSchema, overlayVisibilityRequestSchema, ollamaFirstStepRequestSchema, ollamaFirstStepResponseSchema, ollamaStatusResponseSchema, mistralFirstStepRequestSchema, mistralFirstStepResponseSchema } from '../../src/shared/ipc'
describe('app-ready IPC request', () => { it('rejects renderer data outside the empty request contract', () => { expect(appReadyRequestSchema.safeParse({}).success).toBe(true); expect(appReadyRequestSchema.safeParse({ unexpected: true }).success).toBe(false) }) })

describe('local AI IPC response', () => {
  it('only accepts a simple availability and model list response', () => {
    expect(ollamaStatusResponseSchema.safeParse({ available: true, models: ['qwen2.5:3b'] }).success).toBe(true)
    expect(ollamaStatusResponseSchema.safeParse({ available: true, models: [3] }).success).toBe(false)
  })
})

describe('timer IPC contract', () => {
  it('accepts a valid task start and only conservative recovery actions', () => {
    expect(timerStartRequestSchema.safeParse({ task: { id: 'report', title: 'Draft report' } }).success).toBe(true)
    expect(timerStartRequestSchema.safeParse({ task: { id: 'report', title: '' } }).success).toBe(false)
    expect(recoveryActionRequestSchema.safeParse({ action: 'record_partial' }).success).toBe(true)
    expect(recoveryActionRequestSchema.safeParse({ action: 'complete' }).success).toBe(false)
  })
})

describe('focus overlay IPC contract', () => {
  it('only accepts a user-initiated visibility change with a bounded task title', () => {
    expect(overlayVisibilityRequestSchema.safeParse({ visible: true, task: 'Draft report headings' }).success).toBe(true)
    expect(overlayVisibilityRequestSchema.safeParse({ visible: true, task: '' }).success).toBe(false)
    expect(overlayVisibilityRequestSchema.safeParse({ visible: false }).success).toBe(true)
  })
})

describe('local AI first-step IPC contract', () => {
  it('accepts a short task and a nullable response', () => {
    expect(ollamaFirstStepRequestSchema.safeParse({ task: 'Outline my report' }).success).toBe(true)
    expect(ollamaFirstStepRequestSchema.safeParse({ task: '' }).success).toBe(false)
    expect(ollamaFirstStepResponseSchema.safeParse({ suggestion: null }).success).toBe(true)
  })
})

describe('cloud AI first-step IPC contract', () => {
  it('accepts the same bounded task and nullable response shape', () => {
    expect(mistralFirstStepRequestSchema.safeParse({ task: 'Outline my report' }).success).toBe(true)
    expect(mistralFirstStepRequestSchema.safeParse({ task: '' }).success).toBe(false)
    expect(mistralFirstStepResponseSchema.safeParse({ suggestion: null }).success).toBe(true)
  })
})
