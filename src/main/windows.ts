import type { TimerSnapshot } from '../shared/timer'

export function overlayWindowOptions() {
  return { width: 280, height: 160, alwaysOnTop: true, skipTaskbar: true, frame: false, transparent: true, resizable: false }
}

type OverlayWindow = { show(): void; hide(): void; isDestroyed(): boolean; webContents?: { send(channel: string, snapshot: TimerSnapshot): void } }

export function createOverlayController(createWindow: (task: string) => OverlayWindow) {
  let overlay: OverlayWindow | undefined

  return {
    show(task: string) {
      if (!overlay || overlay.isDestroyed()) overlay = createWindow(task)
      overlay.show()
    },
    hide() {
      if (overlay && !overlay.isDestroyed()) overlay.hide()
    },
    sync(snapshot: TimerSnapshot) {
      if (snapshot.phase !== 'focus') { if (overlay && !overlay.isDestroyed()) overlay.hide(); return }
      if (!overlay || overlay.isDestroyed()) overlay = createWindow(snapshot.task?.title ?? 'Focus')
      overlay.webContents?.send('timer:snapshot', snapshot)
      overlay.show()
    }
  }
}
