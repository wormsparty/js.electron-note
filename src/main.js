const { app, ipcMain, Menu, BrowserWindow } = require('electron/main')
const path = require('path')
const electronReload = require('electron-reload')
const io = require('./back/io');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'back/preload.js'),
    }
  })

  win.loadURL(`file://${__dirname}/front/index.html`)
}

//Menu.setApplicationMenu(null)

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('getFiles', () => {
    return io.getFiles();
});
