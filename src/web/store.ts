import { create } from 'zustand'
import { idleTimer, type SessionRecord, type TimerSnapshot } from '../shared/timer'
import { createBrowserRepository } from './storage'
import { createTimerService } from './timer-service'

const service = createTimerService({ repository: createBrowserRepository(), now: () => new Date().toISOString(), makeId: crypto.randomUUID })
let unsubscribe: (() => void) | null = null
type Store = { hydrated: boolean; snapshot: TimerSnapshot; recovery: SessionRecord | null; stars: number; hydrate(): Promise<void>; start(title: string): Promise<void>; pause(): Promise<void>; resume(): Promise<void>; endEarly(): Promise<void>; tick(): Promise<void>; resolveRecovery(action: 'record_partial' | 'discard'): Promise<void> }
export const useStudyStore = create<Store>((set) => ({ hydrated: false, snapshot: idleTimer(), recovery: null, stars: 0,
  async hydrate() {
    const result = await service.hydrate(); const state = await service.getState()
    set({ hydrated: true, snapshot: result.snapshot, recovery: result.recovery, stars: state.rewards.stars })
    if (!unsubscribe) unsubscribe = service.subscribe((snapshot, nextState) => set({ snapshot, stars: nextState.rewards.stars }))
  },
  async start(title) { set({ snapshot: await service.start({ id: crypto.randomUUID(), title }) }) },
  async pause() { set({ snapshot: await service.pause() }) }, async resume() { set({ snapshot: await service.resume() }) }, async endEarly() { set({ snapshot: await service.endEarly() }) }, async tick() { set({ snapshot: await service.tick() }) },
  async resolveRecovery(action) { set({ snapshot: action === 'record_partial' ? await service.recordRecoveredPartial() : await service.discardRecoveredSession(), recovery: null }) }
}))
