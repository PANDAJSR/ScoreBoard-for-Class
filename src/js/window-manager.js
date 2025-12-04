/**
 * 窗口管理模块
 * 负责创建和管理各种窗口
 */

const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let settingsWindow = null;
let classManagementWindow = null;

/**
 * 创建设置窗口
 */
function createSettingsWindow(mainWindow) {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  const isMac = process.platform === 'darwin';

  settingsWindow = new BrowserWindow({
    width: 500,
    height: 600,
    frame: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    parent: mainWindow,
    modal: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false,
      preload: path.join(__dirname, 'preload-simple.js')
    }
  });

  settingsWindow.loadFile('settings.html');

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });

  settingsWindow.webContents.once('dom-ready', () => {
    settingsWindow.webContents.send('platform-info', {
      isMac: isMac,
      platform: process.platform
    });
  });
}

/**
 * 创建班级管理窗口
 */
function createClassManagementWindow(mainWindow, options = {}) {
  if (classManagementWindow) {
    classManagementWindow.focus();
    return;
  }

  try {
    // 创建无边框窗口，移除系统标题栏和菜单栏
    classManagementWindow = new BrowserWindow({
      width: options.width || 500,
      height: options.height || 400,
      frame: false,                    // 移除系统标题栏
      titleBarStyle: 'hidden',         // 隐藏标题栏样式
      resizable: options.resizable !== undefined ? options.resizable : false,
      minimizable: options.minimizable !== undefined ? options.minimizable : false,
      maximizable: options.maximizable !== undefined ? options.maximizable : false,
      show: true,
      parent: mainWindow,
      modal: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false,
        webSecurity: false,
        preload: path.join(__dirname, 'preload-simple.js')
      }
    });

    // 隐藏菜单栏
    classManagementWindow.setMenuBarVisibility(false);

    // 如果存在菜单，则设置为null
    if (classManagementWindow.setMenu) {
      classManagementWindow.setMenu(null);
    }

    console.log('班级管理窗口已创建：无边框，无菜单栏');

    classManagementWindow.loadFile('class-management.html');

    classManagementWindow.on('closed', () => {
      console.log('班级管理窗口关闭');
      classManagementWindow = null;
    });
  } catch (error) {
    console.error('创建班级管理窗口失败:', error);
  }
}

/**
 * 创建学生编辑窗口
 */
function createStudentEditWindow(mainWindow, classId, className) {
  if (!mainWindow) return;

  const studentEditWindow = new BrowserWindow({
    width: 600,
    height: 500,
    frame: false,
    resizable: true,
    minimizable: true,
    maximizable: false,
    parent: mainWindow,
    modal: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false,
      preload: path.join(__dirname, 'preload-simple.js')
    }
  });

  studentEditWindow.loadFile('student-edit.html');

  // 传递班级信息
  studentEditWindow.webContents.once('dom-ready', () => {
    studentEditWindow.webContents.send('class-info', {
      classId: classId,
      className: className
    });
  });

  return studentEditWindow;
}

module.exports = {
  createSettingsWindow,
  createClassManagementWindow,
  createStudentEditWindow
};