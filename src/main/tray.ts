export interface HideableWindow { hide(): void }
export interface QuittableApp { quit(): void }
export interface CloseEvent { preventDefault(): void }

export function createTrayController(window: HideableWindow, app: QuittableApp) {
  return {
    onMainWindowClose(event: CloseEvent): void {
      event.preventDefault()
      window.hide()
    },
    quit(): void { app.quit() }
  }
}
