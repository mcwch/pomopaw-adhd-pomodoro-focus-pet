import type { FocusAppApi } from '../shared/ipc'

declare global {
  interface Window {
    focusApp: FocusAppApi
  }
}
