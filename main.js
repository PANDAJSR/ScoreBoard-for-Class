const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const os = require('os');

function createWindow() {
  const isMac = process.platform === 'darwin';

  const mainWindow = new BrowserWindow({
    width: 450,
    height: 800,
    frame: isMac ? true : false,
    titleBarStyle: isMac ? 'hiddenInset' : 'hidden',
    resizable: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.openDevTools();

  mainWindow.webContents.once('dom-ready', () => {
    mainWindow.webContents.send('platform-info', {
      isMac: isMac,
      platform: process.platform
    });
  });

  mainWindow.on('close', (event) => {
    event.preventDefault();

    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      buttons: ['取消', '退出'],
      defaultId: 0,
      title: '确认退出',
      message: '是否退出程序？',
      detail: '点击退出将关闭应用程序。'
    });

    if (choice === 1) {
      mainWindow.destroy();
      app.quit();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  app.quit();
});

ipcMain.handle('window-minimize', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window.minimize();
});

ipcMain.handle('window-close', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window.close();
});