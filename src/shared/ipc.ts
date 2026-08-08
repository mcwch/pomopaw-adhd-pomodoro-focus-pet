import { z } from 'zod'
import type { TimerSnapshot } from './timer'
export const appReadyRequestSchema = z.object({}).strict()
export const timerStartRequestSchema = z.object({ task: z.object({ id: z.string().min(1), title: z.string().trim().min(1).max(200) }).strict() }).strict()
export const timerActionRequestSchema = z.object({}).strict()
export const recoveryActionRequestSchema = z.object({ action: z.enum(['record_partial', 'discard']) }).strict()
export const appReadyResponseSchema = z.object({ applicationName: z.literal('Focus Companion') })
export type AppReadyResponse = z.infer<typeof appReadyResponseSchema>
export const ollamaStatusResponseSchema = z.object({
  available: z.boolean(),
  models: z.array(z.string())
})
export type OllamaStatusResponse = z.infer<typeof ollamaStatusResponseSchema>
export const ollamaFirstStepRequestSchema = z.object({ task: z.string().trim().min(1).max(500) }).strict()
export const ollamaFirstStepResponseSchema = z.object({ suggestion: z.string().nullable() })
export type OllamaFirstStepResponse = z.infer<typeof ollamaFirstStepResponseSchema>
export const overlayVisibilityRequestSchema = z.discriminatedUnion('visible', [
  z.object({ visible: z.literal(true), task: z.string().trim().min(1).max(200) }).strict(),
  z.object({ visible: z.literal(false) }).strict()
])
export interface FocusAppApi {
  appReady(): Promise<AppReadyResponse>
  ollamaStatus(): Promise<OllamaStatusResponse>
  ollamaFirstStep(task: string): Promise<OllamaFirstStepResponse>
  setOverlayVisible(request: z.infer<typeof overlayVisibilityRequestSchema>): Promise<void>
  timerState(): Promise<TimerSnapshot>
  timerStart(task: { id: string; title: string }): Promise<TimerSnapshot>
  timerPause(): Promise<TimerSnapshot>
  timerResume(): Promise<TimerSnapshot>
  timerEndEarly(): Promise<TimerSnapshot>
  onTimerSnapshot(listener: (snapshot: TimerSnapshot) => void): () => void
}
