/**
 * IPC处理器模块
 * 负责处理所有的IPC通信
 */

const { ipcMain, BrowserWindow } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const DatabaseManager = require('./database.js');
const dataDirManager = require('./main-data-dir.js');

const dbManager = new DatabaseManager();

/**
 * 注册所有IPC处理器
 */
function registerIPCHandlers() {
  // 窗口控制IPC处理
  registerWindowHandlers();

  // 数据目录管理IPC处理
  registerDataDirectoryHandlers();

  // 学生数据管理IPC处理
  registerStudentDataHandlers();

  // 班级管理IPC处理
  registerClassManagementHandlers();

  // 平台信息IPC处理
  registerPlatformHandlers();

  // 班级信息事件处理
  registerClassEventHandlers();
}

/**
 * 窗口控制IPC处理器
 */
function registerWindowHandlers() {
  ipcMain.handle('window-minimize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.minimize();
    }
  });

  ipcMain.handle('window-close', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.close();
    }
  });
}

/**
 * 数据目录管理IPC处理器
 */
function registerDataDirectoryHandlers() {
  ipcMain.handle('getDataDirectory', async (event) => {
    try {
      const directory = dataDirManager.getDataDirectory();
      return { success: true, directory };
    } catch (error) {
      console.error('获取数据目录失败:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('selectDataDirectory', async (event) => {
    try {
      return await dataDirManager.selectDataDirectory();
    } catch (error) {
      console.error('选择数据目录失败:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('resetDataDirectory', async (event) => {
    try {
      return await dataDirManager.resetDataDirectory();
    } catch (error) {
      console.error('重置数据目录失败:', error);
      return { success: false, error: error.message };
    }
  });
}

/**
 * 学生数据管理IPC处理器
 */
function registerStudentDataHandlers() {
  ipcMain.handle('get-students', async (event) => {
    try {
      // 确保使用正确的数据库路径
      dbManager.dbPath = dataDirManager.getMainDatabasePath();
      const students = await dbManager.getAllStudents();
      return students;
    } catch (error) {
      console.error('获取学生数据失败:', error);
      return [];
    }
  });

  ipcMain.handle('save-students', async (event, students) => {
    try {
      // 确保使用正确的数据库路径
      dbManager.dbPath = dataDirManager.getMainDatabasePath();
      await dbManager.saveStudents(students);
      return { success: true };
    } catch (error) {
      console.error('保存学生数据失败:', error);
      return { success: false, error: error.message };
    }
  });
}

/**
 * 班级管理IPC处理器
 */
function registerClassManagementHandlers() {
  // 获取班级列表 - 使用数据目录
  ipcMain.handle('getClassList', async (event) => {
    try {
      const classListPath = dataDirManager.getClassListPath();
      try {
        await fs.access(classListPath);
        const data = await fs.readFile(classListPath, 'utf8');
        return JSON.parse(data);
      } catch {
        return [];
      }
    } catch (error) {
      console.error('获取班级列表失败:', error);
      return [];
    }
  });

  // 保存班级列表 - 使用数据目录
  ipcMain.handle('saveClassList', async (event, classes) => {
    try {
      const classListPath = dataDirManager.getClassListPath();
      await fs.writeFile(classListPath, JSON.stringify(classes, null, 2));
      return { success: true };
    } catch (error) {
      console.error('保存班级列表失败:', error);
      return { success: false, error: error.message };
    }
  });

  // 创建班级 - 使用数据目录
  ipcMain.handle('createClass', async (event, className) => {
    try {
      const classId = Date.now().toString();
      const dbFileName = `class_${classId}.db`;
      const classesDir = dataDirManager.getClassesDirectory();
      const dbPath = path.join(classesDir, dbFileName);

      // 确保classes目录存在
      await fs.mkdir(classesDir, { recursive: true });

      // 创建数据库
      const DatabaseManager = require('./database.js');
      const classDbManager = new DatabaseManager();
      classDbManager.dbPath = dbPath;

      await classDbManager.initDatabase();
      classDbManager.close();

      return {
        success: true,
        classData: {
          id: classId,
          name: className,
          studentCount: 0,
          filePath: dbFileName,
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('创建班级失败:', error);
      return { success: false, error: error.message };
    }
  });

  // 获取当前班级 - 使用数据目录
  ipcMain.handle('getCurrentClass', async (event) => {
    try {
      const configPath = dataDirManager.getConfigPath();
      try {
        const data = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(data);
        return config.currentClass || null;
      } catch {
        return null;
      }
    } catch (error) {
      console.error('获取当前班级失败:', error);
      return null;
    }
  });

  // 设置当前班级 - 使用数据目录
  ipcMain.handle('setCurrentClass', async (event, classId) => {
    try {
      const configPath = dataDirManager.getConfigPath();
      let config = {};

      try {
        const data = await fs.readFile(configPath, 'utf8');
        config = JSON.parse(data);
      } catch {
        // 文件不存在，使用空配置
      }

      config.currentClass = classId;
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      return { success: true };
    } catch (error) {
      console.error('设置当前班级失败:', error);
      return { success: false, error: error.message };
    }
  });

  // 获取班级学生 - 使用数据目录
  ipcMain.handle('getClassStudents', async (event, classId) => {
    let classDbManager = null;
    try {
      // 读取班级列表
      let classes = [];
      try {
        const classListPath = dataDirManager.getClassListPath();
        const data = await fs.readFile(classListPath, 'utf8');
        classes = JSON.parse(data);
      } catch {
        classes = [];
      }

      // 找到班级
      const classData = classes.find(c => c.id === classId);
      if (!classData) {
        return { success: false, error: '班级不存在' };
      }

      // 连接班级数据库
      const classesDir = dataDirManager.getClassesDirectory();
      const dbPath = path.join(classesDir, classData.filePath);
      const DatabaseManager = require('./database.js');
      classDbManager = new DatabaseManager();
      classDbManager.dbPath = dbPath;

      await classDbManager.initDatabase();
      const students = await classDbManager.getAllStudents();

      return { success: true, students };
    } catch (error) {
      console.error('获取班级学生失败:', error);
      return { success: false, error: error.message };
    } finally {
      if (classDbManager && classDbManager.close) {
        classDbManager.close();
      }
    }
  });

  // 保存班级学生 - 使用数据目录
  ipcMain.handle('saveClassStudents', async (event, classId, students) => {
    let classDbManager = null;
    try {
      // 读取班级列表
      let classes = [];
      try {
        const classListPath = dataDirManager.getClassListPath();
        const data = await fs.readFile(classListPath, 'utf8');
        classes = JSON.parse(data);
      } catch {
        classes = [];
      }

      // 找到班级
      const classData = classes.find(c => c.id === classId);
      if (!classData) {
        return { success: false, error: '班级不存在' };
      }

      // 连接班级数据库
      const classesDir = dataDirManager.getClassesDirectory();
      const dbPath = path.join(classesDir, classData.filePath);
      const DatabaseManager = require('./database.js');
      classDbManager = new DatabaseManager();
      classDbManager.dbPath = dbPath;

      await classDbManager.initDatabase();
      await classDbManager.saveStudents(students);

      // 更新班级学生数量
      classData.studentCount = students.length;
      await fs.writeFile(dataDirManager.getClassListPath(), JSON.stringify(classes, null, 2));

      return { success: true, studentCount: students.length };
    } catch (error) {
      console.error('保存班级学生失败:', error);
      return { success: false, error: error.message };
    } finally {
      if (classDbManager && classDbManager.close) {
        classDbManager.close();
      }
    }
  });

  // 编辑班级学生 - 使用数据目录
  ipcMain.handle('editClassStudents', async (event, classId) => {
    try {
      // 读取班级列表
      let classes = [];
      try {
        const classListPath = dataDirManager.getClassListPath();
        const data = await fs.readFile(classListPath, 'utf8');
        classes = JSON.parse(data);
      } catch {
        classes = [];
      }

      // 找到班级
      const classData = classes.find(c => c.id === classId);
      if (!classData) {
        return { success: false, error: '班级不存在' };
      }

      // 打开学生编辑窗口
      const windowManager = require('./window-manager.js');
      const mainWindow = BrowserWindow.getAllWindows()[0];
      windowManager.createStudentEditWindow(mainWindow, classId, classData.name);

      return { success: true };
    } catch (error) {
      console.error('编辑班级学生失败:', error);
      return { success: false, error: error.message };
    }
  });
}

/**
 * 平台信息IPC处理器
 */
function registerPlatformHandlers() {
  ipcMain.handle('get-platform-info', (event) => {
    return {
      isMac: process.platform === 'darwin',
      platform: process.platform
    };
  });
}

/**
 * 班级信息事件IPC处理器
 */
function registerClassEventHandlers() {
  // 班级信息事件
  ipcMain.on('class-info', (event, data) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.webContents.send('class-info', data);
    }
  });
}

module.exports = {
  registerIPCHandlers
};