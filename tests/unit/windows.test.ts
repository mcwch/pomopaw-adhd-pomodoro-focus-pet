import { describe, expect, it, vi } from 'vitest'
import { createOverlayController, overlayWindowOptions } from '../../src/main/windows'

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
})
