// 班级管理IPC处理
const fs = require('fs');
const path = require('path');

// 班级列表存储路径
const classListPath = path.join(__dirname, 'classes.json');

// 获取班级列表
ipcMain.handle('getClassList', async (event) => {
  try {
    if (fs.existsSync(classListPath)) {
      const data = fs.readFileSync(classListPath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('获取班级列表失败:', error);
    return [];
  }
});

// 保存班级列表
ipcMain.handle('saveClassList', async (event, classes) => {
  try {
    fs.writeFileSync(classListPath, JSON.stringify(classes, null, 2));
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
    if (!fs.existsSync(classesDir)) {
      fs.mkdirSync(classesDir, { recursive: true });
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
    if (fs.existsSync(classListPath)) {
      const data = fs.readFileSync(classListPath, 'utf8');
      classes = JSON.parse(data);
    }

    // 找到要删除的班级
    const classData = classes.find(c => c.id === classId);
    if (!classData) {
      return { success: false, error: '班级不存在' };
    }

    // 删除数据库文件
    const dbPath = path.join(__dirname, 'classes', classData.filePath);
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
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
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(data);
      return config.currentClass || null;
    }
    return null;
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

    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      config = JSON.parse(data);
    }

    config.currentClass = classId;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    return { success: true };
  } catch (error) {
    console.error('设置当前班级失败:', error);
    return { success: false, error: error.message };
  }
});

// 获取班级学生列表
ipcMain.handle('getClassStudents', async (event, classId) => {
  try {
    // 读取班级列表
    let classes = [];
    if (fs.existsSync(classListPath)) {
      const data = fs.readFileSync(classListPath, 'utf8');
      classes = JSON.parse(data);
    }

    // 找到班级
    const classData = classes.find(c => c.id === classId);
    if (!classData) {
      return { success: false, error: '班级不存在' };
    }

    // 连接班级数据库
    const dbPath = path.join(__dirname, 'classes', classData.filePath);
    const DatabaseManager = require('./database.js');
    const classDbManager = new DatabaseManager();
    classDbManager.dbPath = dbPath;

    await classDbManager.initDatabase();
    const students = await classDbManager.getAllStudents();
    classDbManager.close();

    return { success: true, students };
  } catch (error) {
    console.error('获取班级学生失败:', error);
    return { success: false, error: error.message };
  }
});

// 保存班级学生列表
ipcMain.handle('saveClassStudents', async (event, classId, students) => {
  try {
    // 读取班级列表
    let classes = [];
    if (fs.existsSync(classListPath)) {
      const data = fs.readFileSync(classListPath, 'utf8');
      classes = JSON.parse(data);
    }

    // 找到班级
    const classData = classes.find(c => c.id === classId);
    if (!classData) {
      return { success: false, error: '班级不存在' };
    }

    // 连接班级数据库
    const dbPath = path.join(__dirname, 'classes', classData.filePath);
    const DatabaseManager = require('./database.js');
    const classDbManager = new DatabaseManager();
    classDbManager.dbPath = dbPath;

    await classDbManager.initDatabase();
    await classDbManager.saveStudents(students);
    classDbManager.close();

    // 更新班级学生数量
    classData.studentCount = students.length;
    fs.writeFileSync(classListPath, JSON.stringify(classes, null, 2));

    return { success: true, studentCount: students.length };
  } catch (error) {
    console.error('保存班级学生失败:', error);
    return { success: false, error: error.message };
  }
});