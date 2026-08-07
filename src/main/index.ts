import { app, shell, BrowserWindow, ipcMain, Menu, Tray } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { appReadyRequestSchema, ollamaFirstStepRequestSchema } from '../shared/ipc'
import { createTrayController } from './tray'
import { detectLocalOllama, getFirstStepFromLocalOllama } from './ollama'

let tray: Tray | undefined

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
app.whenReady().then(() => {
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
    return { applicationName: 'Focus Companion' }
  })

  ipcMain.handle('ollama:status', () => detectLocalOllama())
  ipcMain.handle('ollama:first-step', (_event, request: unknown) => {
    const { task } = ollamaFirstStepRequestSchema.parse(request)
    return getFirstStepFromLocalOllama(task).then((suggestion) => ({ suggestion }))
  })

  createWindow()

  tray = new Tray(icon)
  tray.setToolTip('Focus Companion')
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show Focus Companion', click: () => BrowserWindow.getAllWindows()[0]?.show() },
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
