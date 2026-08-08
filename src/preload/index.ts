import { contextBridge, ipcRenderer } from 'electron'
import type { FocusAppApi } from '../shared/ipc'

// Custom APIs for renderer
const focusApp: FocusAppApi = {
  appReady: () => ipcRenderer.invoke('app:ready', {}),
  ollamaStatus: () => ipcRenderer.invoke('ollama:status'),
  ollamaFirstStep: (task) => ipcRenderer.invoke('ollama:first-step', { task }),
  setOverlayVisible: (request) => ipcRenderer.invoke('overlay:visibility', request),
  timerState: () => ipcRenderer.invoke('timer:state', {}),
  timerStart: (task) => ipcRenderer.invoke('timer:start', { task }),
  timerPause: () => ipcRenderer.invoke('timer:pause', {}),
  timerResume: () => ipcRenderer.invoke('timer:resume', {}),
  timerEndEarly: () => ipcRenderer.invoke('timer:end-early', {}),
  onTimerSnapshot: (listener) => {
    const callback = (_event: Electron.IpcRendererEvent, snapshot: Parameters<typeof listener>[0]) => listener(snapshot)
    ipcRenderer.on('timer:snapshot', callback)
    return () => ipcRenderer.removeListener('timer:snapshot', callback)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('focusApp', focusApp)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.focusApp = focusApp
}
