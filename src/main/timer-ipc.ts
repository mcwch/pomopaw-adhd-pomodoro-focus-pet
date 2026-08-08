import { timerActionRequestSchema, timerStartRequestSchema } from '../shared/ipc'
import type { TimerController } from './timer-controller'

type IpcMainLike = { handle(channel: string, listener: (event: unknown, request: unknown) => unknown): void }

export function registerTimerIpc({ handle, controller }: { handle: IpcMainLike['handle']; controller: Pick<TimerController, 'getSnapshot' | 'startFocus' | 'pause' | 'resume' | 'endFocusEarly'> }): void {
  handle('timer:state', (_event, request) => { timerActionRequestSchema.parse(request); return controller.getSnapshot() })
  handle('timer:start', (_event, request) => controller.startFocus(timerStartRequestSchema.parse(request).task))
  handle('timer:pause', (_event, request) => { timerActionRequestSchema.parse(request); return controller.pause() })
  handle('timer:resume', (_event, request) => { timerActionRequestSchema.parse(request); return controller.resume() })
  handle('timer:end-early', (_event, request) => { timerActionRequestSchema.parse(request); return controller.endFocusEarly() })
}
