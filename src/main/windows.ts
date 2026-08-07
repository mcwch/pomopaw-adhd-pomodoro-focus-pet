export function overlayWindowOptions() {
  return { width: 280, height: 160, alwaysOnTop: true, skipTaskbar: true, frame: false, transparent: true, resizable: false }
}

type OverlayWindow = { show(): void; hide(): void; isDestroyed(): boolean }

export function createOverlayController(createWindow: (task: string) => OverlayWindow) {
  let overlay: OverlayWindow | undefined

  return {
    show(task: string) {
      if (!overlay || overlay.isDestroyed()) overlay = createWindow(task)
      overlay.show()
    },
    hide() {
      if (overlay && !overlay.isDestroyed()) overlay.hide()
    }
  }
}
