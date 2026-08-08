import type { TimerSnapshot } from '../shared/timer'

export function isCompletedFocusTransition(previous: TimerSnapshot, next: TimerSnapshot): boolean {
  return previous.phase === 'focus' && (next.phase === 'short_break' || next.phase === 'long_break')
}
