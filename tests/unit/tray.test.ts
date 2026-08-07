import { describe, expect, it, vi } from 'vitest'
import { createTrayController } from '../../src/main/tray'

describe('tray controller', () => {
  it('hides a closed main window and quits only from the Quit command', () => {
    const window = { hide: vi.fn() }
    const app = { quit: vi.fn() }
    const controller = createTrayController(window, app)

    controller.onMainWindowClose({ preventDefault: vi.fn() })
    expect(window.hide).toHaveBeenCalledOnce()
    controller.quit()
    expect(app.quit).toHaveBeenCalledOnce()
  })
})
