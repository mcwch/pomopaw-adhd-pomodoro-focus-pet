import { z } from 'zod'
export const appReadyRequestSchema = z.object({}).strict()
export const appReadyResponseSchema = z.object({ applicationName: z.literal('Focus Companion') })
export type AppReadyResponse = z.infer<typeof appReadyResponseSchema>
export interface FocusAppApi { appReady(): Promise<AppReadyResponse> }
