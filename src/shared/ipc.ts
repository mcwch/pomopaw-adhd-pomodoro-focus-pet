import { z } from 'zod'
export const appReadyRequestSchema = z.object({}).strict()
export const appReadyResponseSchema = z.object({ applicationName: z.literal('Focus Companion') })
export type AppReadyResponse = z.infer<typeof appReadyResponseSchema>
export const ollamaStatusResponseSchema = z.object({
  available: z.boolean(),
  models: z.array(z.string())
})
export type OllamaStatusResponse = z.infer<typeof ollamaStatusResponseSchema>
export interface FocusAppApi {
  appReady(): Promise<AppReadyResponse>
  ollamaStatus(): Promise<OllamaStatusResponse>
}
