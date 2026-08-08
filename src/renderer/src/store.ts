import { create } from 'zustand'
import { idleTimer, type SessionRecord, type TimerSnapshot } from '../../shared/timer'

type FocusStore = {
  hydrated: boolean
  snapshot: TimerSnapshot
  recovery: SessionRecord | null
  hydrate(): Promise<void>
  start(task: { id: string; title: string }): Promise<void>
  pause(): Promise<void>
  resume(): Promise<void>
  endEarly(): Promise<void>
  resolveRecovery(action: 'record_partial' | 'discard'): Promise<void>
}

export const useFocusStore = create<FocusStore>((set) => ({
  hydrated: false,
  snapshot: idleTimer(),
  recovery: null,
  async hydrate() {
    const result = await window.focusApp.timerHydrate()
    set({ hydrated: true, snapshot: result.snapshot, recovery: result.recovery })
    window.focusApp.onTimerSnapshot((snapshot) => set({ snapshot }))
  },
  async start(task) { set({ snapshot: await window.focusApp.timerStart(task) }) },
  async pause() { set({ snapshot: await window.focusApp.timerPause() }) },
  async resume() { set({ snapshot: await window.focusApp.timerResume() }) },
  async endEarly() { set({ snapshot: await window.focusApp.timerEndEarly() }) },
  async resolveRecovery(action) { set({ snapshot: await window.focusApp.resolveTimerRecovery(action), recovery: null }) }
}))
