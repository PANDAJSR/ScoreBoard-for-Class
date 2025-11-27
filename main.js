/**
 * 主进程入口文件
 * 重构版本 - 将功能分散到各个模块
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const os = require('os');
const DatabaseManager = require('./database.js');
const dataDirManager = require('./main-data-dir.js');
const windowManager = require('./window-manager.js');
const { registerIPCHandlers } = require('./ipc-handlers.js');

let mainWindow = null;
const dbManager = new DatabaseManager();

/**
 * 创建主窗口
 */
function createWindow() {
  const isMac = process.platform === 'darwin';

  mainWindow = new BrowserWindow({
    width: 450,
    height: 800,
    frame: isMac ? true : false,
    titleBarStyle: isMac ? 'hiddenInset' : 'hidden',
    resizable: true,
    maximizable: true,
    minimizable: true,
    minWidth: 300,
    minHeight: 400,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false,
      preload: path.join(__dirname, 'preload-simple.js')
    }
  });

  mainWindow.loadFile('index-final.html');

  mainWindow.on('resize', () => {
    const [width, height] = mainWindow.getSize();
    if (width < 300 || height < 400) {
      const newWidth = Math.max(300, width);
      const newHeight = Math.max(400, height);
      mainWindow.setSize(newWidth, newHeight);
    }
  });

  mainWindow.webContents.once('dom-ready', () => {
    mainWindow.webContents.send('platform-info', {
      isMac: isMac,
      platform: process.platform
    });
  });

  setupWindowCloseHandler();
}

/**
 * 设置窗口关闭处理
 */
function setupWindowCloseHandler() {
  let isQuitting = false;

  mainWindow.on('close', (event) => {
    if (isQuitting) {
      return;
    }

    event.preventDefault();

    try {
      const choice = dialog.showMessageBoxSync(mainWindow, {
        type: 'question',
        buttons: ['取消', '退出'],
        defaultId: 0,
        title: '确认退出',
        message: '是否退出程序？',
        detail: '点击退出将关闭应用程序。',
        noLink: true,
        cancelId: 0
      });

      if (choice === 1) {
        isQuitting = true;
        mainWindow.destroy();
        app.quit();
      }
    } catch (error) {
      // 静默处理错误，避免用户看到技术错误信息
    }
  });
}

/**
 * 初始化应用程序
 */
async function initializeApp() {
  try {
    // 初始化数据目录
    const dataDirResult = await dataDirManager.initDataDirectory();
    if (dataDirResult.success) {
      console.log('数据目录初始化成功:', dataDirResult.directory);
      // 更新数据库管理器的数据库路径
      dbManager.dbPath = dataDirManager.getMainDatabasePath();
    } else {
      console.error('数据目录初始化失败:', dataDirResult.error);
    }

    // 初始化数据库
    await dbManager.initDatabase();
    console.log('数据库初始化完成');

  } catch (error) {
    console.error('应用程序初始化失败:', error);
  }
}

/**
 * 注册IPC处理器
 */
function setupIPCHandlers() {
  // 注册窗口管理相关的IPC处理器
  ipcMain.handle('open-settings', (event) => {
    try {
      windowManager.createSettingsWindow(mainWindow);
    } catch (error) {
      console.error('打开设置窗口失败:', error);
    }
  });

  ipcMain.handle('open-class-management', async (event, options = {}) => {
    try {
      windowManager.createClassManagementWindow(mainWindow, options);
      return { success: true, message: '班级管理窗口创建成功' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 删除重复的editClassStudents处理器，因为它已经在ipc-handlers.js中定义

  // 注册其他IPC处理器
  registerIPCHandlers();
}

/**
 * 应用程序启动
 */
app.whenReady().then(async () => {
  await initializeApp();
  createWindow();
  setupIPCHandlers();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  app.quit();
});

console.log('主进程初始化完成');

module.exports = {
  createWindow
};