/**
 * 修复后的IPC处理代码
 * 主要修复同步文件操作和未定义变量问题
 */

// 班级管理IPC处理
const fs = require('fs').promises;

// 班级列表存储路径
const classListPath = path.join(__dirname, 'classes.json');

// 获取班级列表
ipcMain.handle('getClassList', async (event) => {
  try {
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

// 保存班级列表
ipcMain.handle('saveClassList', async (event, classes) => {
  try {
    await fs.writeFile(classListPath, JSON.stringify(classes, null, 2));
    return { success: true };
  } catch (error) {
    console.error('保存班级列表失败:', error);
    return { success: false, error: error.message };
  }
});

// 创建班级
ipcMain.handle('createClass', async (event, className) => {
  try {
    // 生成班级ID和文件名
    const classId = Date.now().toString();
    const dbFileName = `class_${classId}.db`;
    const dbPath = path.join(__dirname, 'classes', dbFileName);

    // 确保classes目录存在
    const classesDir = path.join(__dirname, 'classes');
    try {
      await fs.mkdir(classesDir, { recursive: true });
    } catch (err) {
      // 目录已存在或其他错误，继续执行
    }

    // 创建新的数据库文件
    const DatabaseManager = require('./database.js');
    const classDbManager = new DatabaseManager();
    classDbManager.dbPath = dbPath;

    await classDbManager.initDatabase();
    classDbManager.close();

    // 创建班级数据
    const classData = {
      id: classId,
      name: className,
      studentCount: 0,
      filePath: dbFileName,
      createdAt: new Date().toISOString()
    };

    return { success: true, classData };
  } catch (error) {
    console.error('创建班级失败:', error);
    return { success: false, error: error.message };
  }
});

// 删除班级
ipcMain.handle('deleteClass', async (event, classId) => {
  try {
    // 读取班级列表
    let classes = [];
    try {
      const data = await fs.readFile(classListPath, 'utf8');
      classes = JSON.parse(data);
    } catch {
      classes = [];
    }

    // 找到要删除的班级
    const classData = classes.find(c => c.id === classId);
    if (!classData) {
      return { success: false, error: '班级不存在' };
    }

    // 删除数据库文件
    const dbPath = path.join(__dirname, 'classes', classData.filePath);
    try {
      await fs.unlink(dbPath);
    } catch (err) {
      console.log('删除数据库文件失败:', err);
    }

    return { success: true };
  } catch (error) {
    console.error('删除班级失败:', error);
    return { success: false, error: error.message };
  }
});

// 获取当前班级
ipcMain.handle('getCurrentClass', async (event) => {
  try {
    const configPath = path.join(__dirname, 'config.json');
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

// 设置当前班级
ipcMain.handle('setCurrentClass', async (event, classId) => {
  try {
    const configPath = path.join(__dirname, 'config.json');
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

// 获取班级学生列表
ipcMain.handle('getClassStudents', async (event, classId) => {
  let classDbManager = null;
  try {
    // 读取班级列表
    let classes = [];
    try {
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
    const dbPath = path.join(__dirname, 'classes', classData.filePath);
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
    // 确保数据库连接被关闭
    if (classDbManager && classDbManager.close) {
      classDbManager.close();
    }
  }
});

// 保存班级学生列表
ipcMain.handle('saveClassStudents', async (event, classId, students) => {
  let classDbManager = null;
  try {
    // 读取班级列表
    let classes = [];
    try {
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
    const dbPath = path.join(__dirname, 'classes', classData.filePath);
    const DatabaseManager = require('./database.js');
    classDbManager = new DatabaseManager();
    classDbManager.dbPath = dbPath;

    await classDbManager.initDatabase();
    await classDbManager.saveStudents(students);

    // 更新班级学生数量
    classData.studentCount = students.length;
    await fs.writeFile(classListPath, JSON.stringify(classes, null, 2));

    return { success: true, studentCount: students.length };
  } catch (error) {
    console.error('保存班级学生失败:', error);
    return { success: false, error: error.message };
  } finally {
    // 确保数据库连接被关闭
    if (classDbManager && classDbManager.close) {
      classDbManager.close();
    }
  }
});

// 创建学生编辑窗口
let studentEditWindow = null;

function createStudentEditWindow(classId, className) {
  if (studentEditWindow) {
    studentEditWindow.focus();
    return;
  }

  // 获取主窗口作为父窗口
  const mainWindow = BrowserWindow.getAllWindows()[0];
  const parentWindow = mainWindow || undefined;

  studentEditWindow = new BrowserWindow({
    width: 600,
    height: 500,
    frame: false,
    resizable: true,
    minimizable: true,
    maximizable: false,
    parent: parentWindow,
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

  studentEditWindow.on('closed', () => {
    studentEditWindow = null;
  });
}

// 编辑班级学生名单
ipcMain.handle('editClassStudents', async (event, classId) => {
  try {
    // 读取班级列表
    let classes = [];
    try {
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
    createStudentEditWindow(classId, classData.name);

    return { success: true };
  } catch (error) {
    console.error('编辑班级学生失败:', error);
    return { success: false, error: error.message };
  }
});

// 添加class-info事件监听
ipcMain.on('class-info', (event, data) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    window.webContents.send('class-info', data);
  }
});