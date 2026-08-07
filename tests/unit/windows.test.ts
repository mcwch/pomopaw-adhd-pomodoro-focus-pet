import { describe, expect, it } from 'vitest'
import { overlayWindowOptions } from '../../src/main/windows'

describe('focus overlay window', () => {
  it('uses a small always-on-top window that stays out of the taskbar', () => {
    expect(overlayWindowOptions()).toMatchObject({ width: 280, height: 160, alwaysOnTop: true, skipTaskbar: true, frame: false, transparent: true })
  })
})
