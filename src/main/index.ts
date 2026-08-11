import { app, shell, BrowserWindow, ipcMain, Menu, Tray } from 'electron'
import { join } from 'path'
import { randomUUID } from 'node:crypto'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { appReadyRequestSchema, mistralFirstStepRequestSchema, ollamaFirstStepRequestSchema, overlayVisibilityRequestSchema } from '../shared/ipc'
import { createTrayController } from './tray'
import { detectLocalOllama, getFirstStepFromLocalOllama } from './ollama'
import { requestMistralFirstStep } from '../server/mistral'
import { createOverlayController, overlayWindowOptions } from './windows'
import { StateRepository } from './persistence'
import { TimerController } from './timer-controller'
import { registerTimerIpc } from './timer-ipc'

let tray: Tray | undefined
let overlayController: ReturnType<typeof createOverlayController> | undefined
let timerController: TimerController | undefined

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  const controller = createTrayController(mainWindow, app)
  mainWindow.on('close', (event) => controller.onMainWindowClose(event))

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('app:ready', (_event, request: unknown) => {
    appReadyRequestSchema.parse(request)
    return { applicationName: 'PomoPaw' }
  })

  ipcMain.handle('ollama:status', () => detectLocalOllama())
  ipcMain.handle('ollama:first-step', (_event, request: unknown) => {
    const { task } = ollamaFirstStepRequestSchema.parse(request)
    return getFirstStepFromLocalOllama(task).then((suggestion) => ({ suggestion }))
  })
  ipcMain.handle('mistral:first-step', (_event, request: unknown) => {
    const { task } = mistralFirstStepRequestSchema.parse(request)
    return requestMistralFirstStep(task, process.env.ADHD_APP_MISTRAL_API_KEY ?? '').then(({ suggestion }) => ({ suggestion }))
  })

  ipcMain.handle('overlay:visibility', (_event, request: unknown) => {
    const visibility = overlayVisibilityRequestSchema.parse(request)
    if (visibility.visible) overlayController?.show(visibility.task)
    else overlayController?.hide()
  })

  timerController = new TimerController({
    repository: new StateRepository(app.getPath('userData')),
    now: () => new Date().toISOString(),
    makeId: randomUUID,
    publish: (snapshot) => {
      overlayController?.sync(snapshot)
      BrowserWindow.getAllWindows().forEach((window) => window.webContents.send('timer:snapshot', snapshot))
    }
  })
  await timerController.hydrate()
  registerTimerIpc({ handle: ipcMain.handle.bind(ipcMain), controller: timerController })
  setInterval(() => { void timerController?.tick().catch((error) => console.error('Timer tick failed', error)) }, 1000)

  createWindow()

  overlayController = createOverlayController((task) => {
    const overlayWindow = new BrowserWindow({
      ...overlayWindowOptions(),
      show: false,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
      }
    })
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      void overlayWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?overlay=1&task=${encodeURIComponent(task)}`)
    } else {
      void overlayWindow.loadFile(join(__dirname, '../renderer/index.html'), { query: { overlay: '1', task } })
    }
    return overlayWindow
  })
  void timerController.getSnapshot().then((snapshot) => overlayController?.sync(snapshot))

  tray = new Tray(icon)
  tray.setToolTip('PomoPaw')
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show PomoPaw', click: () => BrowserWindow.getAllWindows()[0]?.show() },
    { label: 'Hide pet', click: () => overlayController?.hide() },
    { label: 'Quit', click: () => app.quit() }
  ]))
  tray.on('click', () => BrowserWindow.getAllWindows()[0]?.show())

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // The tray owns lifetime on Windows; Quit is always explicit.
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
