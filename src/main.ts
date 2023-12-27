import { app, ipcMain, Menu, BrowserWindow } from 'electron/main';
import * as path from 'path';
import * as io from './back/io';
import 'electron-reload';

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'back/preload.js'),
    }
  })

  win.loadURL(`file://${__dirname}/../data/index.html`)
};

// Uncomment when app is more stable
//Menu.setApplicationMenu(null);

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

ipcMain.handle('load', (_, name) => {
    return io.load(name);
});

ipcMain.handle('save', (_, data) => {
    return io.save(data);
});
