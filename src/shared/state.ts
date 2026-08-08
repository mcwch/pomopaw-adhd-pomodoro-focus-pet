import { z } from 'zod'

const timerSchema = z.object({
  phase: z.enum(['idle', 'focus', 'short_break', 'long_break', 'paused']),
  pausedFrom: z.enum(['focus', 'short_break', 'long_break']).nullable(),
  task: z.object({ id: z.string(), title: z.string() }).nullable(),
  sessionId: z.string().nullable(), startedAt: z.string().nullable(), targetEndsAt: z.string().nullable(),
  remainingSeconds: z.number().int().nonnegative().nullable(), completedFocusCount: z.number().int().nonnegative()
})
const sessionSchema = z.object({ id: z.string(), taskId: z.string().nullable(), startedAt: z.string(), endedAt: z.string(), elapsedSeconds: z.number().int().nonnegative(), outcome: z.enum(['completed', 'partial', 'discarded']), awardedStars: z.number().int().nonnegative() })
export const AppStateSchema = z.object({ version: z.literal(2), timer: timerSchema, tasks: z.array(z.unknown()), rewards: z.object({ stars: z.number(), focusedMinutes: z.number() }), settings: z.object({ sound: z.string(), volume: z.number(), overlayMode: z.enum(['companion', 'timer_only', 'hidden']) }) })
export const FocusHistorySchema = z.object({ version: z.literal(1), sessions: z.array(sessionSchema) })
export type AppState = z.infer<typeof AppStateSchema>
export type FocusHistory = z.infer<typeof FocusHistorySchema>
export const freshAppState = (): AppState => ({ version: 2, timer: { phase: 'idle', pausedFrom: null, task: null, sessionId: null, startedAt: null, targetEndsAt: null, remainingSeconds: null, completedFocusCount: 0 }, tasks: [], rewards: { stars: 0, focusedMinutes: 0 }, settings: { sound: 'white_noise', volume: 50, overlayMode: 'companion' } })
export const freshFocusHistory = (): FocusHistory => ({ version: 1, sessions: [] })
