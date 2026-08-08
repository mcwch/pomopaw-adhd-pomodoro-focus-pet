import { recoveryActionRequestSchema, timerActionRequestSchema, timerStartRequestSchema } from '../shared/ipc'
import type { TimerController } from './timer-controller'

type IpcMainLike = { handle(channel: string, listener: (event: unknown, request: unknown) => unknown): void }

export function registerTimerIpc({ handle, controller }: { handle: IpcMainLike['handle']; controller: Pick<TimerController, 'hydrate' | 'getSnapshot' | 'startFocus' | 'pause' | 'resume' | 'endFocusEarly' | 'recordRecoveredPartial' | 'discardRecoveredSession'> }): void {
  handle('timer:hydrate', (_event, request) => { timerActionRequestSchema.parse(request); return controller.hydrate() })
  handle('timer:state', (_event, request) => { timerActionRequestSchema.parse(request); return controller.getSnapshot() })
  handle('timer:start', (_event, request) => controller.startFocus(timerStartRequestSchema.parse(request).task))
  handle('timer:pause', (_event, request) => { timerActionRequestSchema.parse(request); return controller.pause() })
  handle('timer:resume', (_event, request) => { timerActionRequestSchema.parse(request); return controller.resume() })
  handle('timer:end-early', (_event, request) => { timerActionRequestSchema.parse(request); return controller.endFocusEarly() })
  handle('timer:resolve-recovery', (_event, request) => {
    const { action } = recoveryActionRequestSchema.parse(request)
    return action === 'record_partial' ? controller.recordRecoveredPartial() : controller.discardRecoveredSession()
  })
}
