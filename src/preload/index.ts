import { contextBridge, ipcRenderer } from 'electron'
import type { FocusAppApi } from '../shared/ipc'

// Custom APIs for renderer
const focusApp: FocusAppApi = {
  appReady: () => ipcRenderer.invoke('app:ready', {}),
  ollamaStatus: () => ipcRenderer.invoke('ollama:status'),
  ollamaFirstStep: (task) => ipcRenderer.invoke('ollama:first-step', { task })
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
