import { describe, expect, it, vi } from 'vitest'
import { createOverlayController, overlayWindowOptions } from '../../src/main/windows'
import { startFocus } from '../../src/shared/timer'

describe('focus overlay window', () => {
  it('uses a small always-on-top window that stays out of the taskbar', () => {
    expect(overlayWindowOptions()).toMatchObject({ width: 280, height: 160, alwaysOnTop: true, skipTaskbar: true, frame: false, transparent: true })
  })
})

describe('overlay controller', () => {
  it('creates the companion window once, then shows and hides it for focus', () => {
    const overlay = { show: vi.fn(), hide: vi.fn(), isDestroyed: vi.fn(() => false) }
    const createWindow = vi.fn(() => overlay)
    const controller = createOverlayController(createWindow)

    controller.show('Outline my report')
    controller.show('Outline my report')
    controller.hide()

    expect(createWindow).toHaveBeenCalledTimes(1)
    expect(createWindow).toHaveBeenCalledWith('Outline my report')
    expect(overlay.show).toHaveBeenCalledTimes(2)
    expect(overlay.hide).toHaveBeenCalledOnce()
  })

  it('shows focus snapshots in one overlay and hides it for breaks', () => {
    const overlay = { show: vi.fn(), hide: vi.fn(), isDestroyed: vi.fn(() => false), webContents: { send: vi.fn() } }
    const createWindow = vi.fn(() => overlay)
    const controller = createOverlayController(createWindow)
    const focus = startFocus({ task: { id: 'report', title: 'Outline report' }, completedFocusCount: 0 }, '2026-08-08T09:00:00.000Z', 'session-1')

    controller.sync(focus)
    controller.sync({ ...focus, phase: 'short_break', task: null })

    expect(createWindow).toHaveBeenCalledTimes(1)
    expect(overlay.webContents.send).toHaveBeenCalledWith('timer:snapshot', focus)
    expect(overlay.hide).toHaveBeenCalledOnce()
  })
})
