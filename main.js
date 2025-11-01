const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const os = require('os');
const DatabaseManager = require('./database.js');

let settingsWindow = null; // 设置窗口实例
const dbManager = new DatabaseManager(); // 数据库管理器

// 创建设置窗口
function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  const isMac = process.platform === 'darwin'; // 定义isMac变量

  settingsWindow = new BrowserWindow({
    width: 450,
    height: 600,
    frame: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    parent: BrowserWindow.getAllWindows()[0], // 设置主窗口为父窗口
    modal: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload-settings.js')
    }
  });

  settingsWindow.loadFile('settings.html');

  // 设置窗口关闭时的处理
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });

  // 发送平台信息到设置窗口
  settingsWindow.webContents.once('dom-ready', () => {
    console.log('设置窗口 DOM ready, sending platform info:', { isMac: isMac, platform: process.platform });
    settingsWindow.webContents.send('platform-info', {
      isMac: isMac,
      platform: process.platform
    });
  });

  // 处理设置窗口的IPC请求
  ipcMain.handle('get-platform-info', (event) => {
    console.log('收到设置窗口的平台信息请求');
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window === settingsWindow) {
      window.webContents.send('platform-info', {
        isMac: isMac,
        platform: process.platform
      });
    }
  });

  // 可选：打开开发者工具
  // settingsWindow.webContents.openDevTools();
}

function createWindow() {
  const isMac = process.platform === 'darwin';

  const mainWindow = new BrowserWindow({
    width: 450,
    height: 800,
    frame: isMac ? true : false,
    titleBarStyle: isMac ? 'hiddenInset' : 'hidden',
    resizable: true,        // ✅ 启用窗口大小调整
    maximizable: true,      // ✅ 启用最大化
    minimizable: true,      // ✅ 启用最小化
    minWidth: 300,          // ✅ 设置最小宽度
    minHeight: 400,         // ✅ 设置最小高度
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  // 监听窗口大小变化事件
  mainWindow.on('resize', () => {
    const [width, height] = mainWindow.getSize();
    console.log(`窗口大小改变: ${width}x${height}`);

    // 确保窗口不会小于最小尺寸
    if (width < 300 || height < 400) {
      const newWidth = Math.max(300, width);
      const newHeight = Math.max(400, height);
      mainWindow.setSize(newWidth, newHeight);
    }

    // 可以在这里添加保存窗口大小的逻辑
  });

  mainWindow.webContents.openDevTools();

  mainWindow.webContents.once('dom-ready', () => {
    console.log('DOM ready, sending platform info:', { isMac: isMac, platform: process.platform });
    mainWindow.webContents.send('platform-info', {
      isMac: isMac,
      platform: process.platform
    });
  });

  // 添加一个标志来跟踪是否正在退出
  let isQuitting = false;

  mainWindow.on('close', (event) => {
    // 如果正在退出，不再显示确认对话框，直接允许关闭
    if (isQuitting) {
      console.log('Already quitting, allowing close');
      return;
    }

    console.log('Close event triggered, showing confirmation dialog');
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
        cancelId: 0  // 明确指定取消按钮的索引
      });

      console.log('Message box choice:', choice);
      console.log('Choice type:', typeof choice);

      // 只有当用户明确点击了"退出"按钮时才退出
      // choice === 1 表示点击了"退出"按钮
      // choice === undefined 可能表示对话框被意外关闭
      if (choice === 1) {
        isQuitting = true; // 设置退出标志
        console.log('User chose to quit, destroying window...');
        mainWindow.destroy();
        app.quit();
      } else {
        // 用户点击了取消、X按钮，或者按了ESC，都不退出
        console.log('User cancelled or closed the dialog, staying open');
        // 确保窗口状态正常
        if (mainWindow && !mainWindow.isDestroyed()) {
          console.log('Window remains open');
        }
      }
    } catch (error) {
      console.error('Error showing message box:', error);
      // 如果出错，默认不退出
      console.log('Error occurred, keeping window open');
    }
  });
}

app.whenReady().then(() => {
  // 初始化数据库
  dbManager.initDatabase().then(() => {
  }).catch(err => {
    console.error('Failed to initialize database:', err);
  });

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

// 处理打开设置窗口的请求
ipcMain.handle('open-settings', (event) => {
  console.log('Opening settings window...');
  try {
    createSettingsWindow();
    console.log('Settings window created successfully');
  } catch (error) {
    console.error('Error creating settings window:', error);
  }
});

// 学生数据管理IPC处理
ipcMain.handle('get-students', async (event) => {
  try {
    const students = await dbManager.getAllStudents();
    return students;
  } catch (error) {
    console.error('Failed to load students:', error);
    return [];
  }
});

ipcMain.handle('save-students', async (event, students) => {
  try {
    await dbManager.saveStudents(students);
    return { success: true };
  } catch (error) {
    console.error('Failed to save students:', error);
    return { success: false, error: error.message };
  }
});