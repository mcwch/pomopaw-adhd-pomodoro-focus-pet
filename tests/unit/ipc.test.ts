import { describe, expect, it } from 'vitest'
import { appReadyRequestSchema } from '../../src/shared/ipc'
describe('app-ready IPC request', () => { it('rejects renderer data outside the empty request contract', () => { expect(appReadyRequestSchema.safeParse({}).success).toBe(true); expect(appReadyRequestSchema.safeParse({ unexpected: true }).success).toBe(false) }) })
