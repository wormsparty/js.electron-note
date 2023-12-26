const { app, ipcMain, Menu, BrowserWindow } = require('electron/main')
const path = require('path')
const electronReload = require('electron-reload')
const io = require('./back/io');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'back/preload.js'),
    }
  })

  win.loadURL(`file://${__dirname}/front/index.html`)
}

// Uncomment when app is more stable
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

ipcMain.handle('load', () => {
    return io.load();
});

ipcMain.handle('save', (_, data) => {
    return io.save(data);
});
