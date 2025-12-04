/**
 * 数据目录管理模块
 * 提供数据目录的获取、设置和管理功能
 */

const fs = require('fs').promises;
const path = require('path');
const { app, dialog } = require('electron');

// 默认数据目录
const DEFAULT_DATA_DIR = 'data';

// 配置文件路径
const CONFIG_FILE = 'data-directory.json';

// 当前数据目录
let currentDataDir = DEFAULT_DATA_DIR;

/**
 * 初始化数据目录
 */
async function initDataDirectory() {
  try {
    // 尝试读取配置文件
    const configPath = path.join(__dirname, CONFIG_FILE);
    try {
      const configData = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);
      currentDataDir = config.dataDirectory || DEFAULT_DATA_DIR;
    } catch {
      // 配置文件不存在，使用默认值
      currentDataDir = DEFAULT_DATA_DIR;
    }

    // 确保数据目录存在
    await ensureDataDirectoryExists();

    console.log('数据目录初始化完成:', getDataDirectory());
    return { success: true, directory: getDataDirectory() };
  } catch (error) {
    console.error('初始化数据目录失败:', error);
    currentDataDir = DEFAULT_DATA_DIR;
    return { success: false, error: error.message };
  }
}

/**
 * 获取完整的数据目录路径
 */
function getDataDirectory() {
  if (path.isAbsolute(currentDataDir)) {
    return currentDataDir;
  } else {
    return path.join(__dirname, currentDataDir);
  }
}

/**
 * 获取班级列表文件路径
 */
function getClassListPath() {
  return path.join(getDataDirectory(), 'classes.json');
}

/**
 * 获取配置文件路径
 */
function getConfigPath() {
  return path.join(getDataDirectory(), 'config.json');
}

/**
 * 获取班级数据库目录路径
 */
function getClassesDirectory() {
  return path.join(getDataDirectory(), 'classes');
}

/**
 * 获取主数据库文件路径
 */
function getMainDatabasePath() {
  return path.join(getDataDirectory(), 'data.db');
}

/**
 * 确保数据目录存在
 */
async function ensureDataDirectoryExists() {
  const dataDir = getDataDirectory();
  try {
    await fs.mkdir(dataDir, { recursive: true });

    // 确保子目录也存在
    const classesDir = getClassesDirectory();
    await fs.mkdir(classesDir, { recursive: true });

    return { success: true };
  } catch (error) {
    console.error('创建数据目录失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 选择数据目录
 */
async function selectDataDirectory() {
  try {
    const result = await dialog.showOpenDialog({
      title: '选择数据存储目录',
      properties: ['openDirectory'],
      defaultPath: getDataDirectory()
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return { success: false, error: '用户取消了选择' };
    }

    const selectedDir = result.filePaths[0];

    // 验证目录是否可写
    try {
      await fs.access(selectedDir, fs.constants.W_OK);
    } catch {
      return { success: false, error: '选择的目录没有写入权限' };
    }

    // 更新当前数据目录
    const oldDataDir = currentDataDir;
    currentDataDir = selectedDir;

    // 确保新目录存在
    const ensureResult = await ensureDataDirectoryExists();
    if (!ensureResult.success) {
      currentDataDir = oldDataDir; // 恢复原来的目录
      return { success: false, error: ensureResult.error };
    }

    // 保存配置
    const saveResult = await saveDataDirectoryConfig();
    if (!saveResult.success) {
      currentDataDir = oldDataDir; // 恢复原来的目录
      return { success: false, error: saveResult.error };
    }

    console.log('数据目录已更新为:', getDataDirectory());
    return { success: true, directory: getDataDirectory() };
  } catch (error) {
    console.error('选择数据目录失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 重置为默认数据目录
 */
async function resetDataDirectory() {
  try {
    currentDataDir = DEFAULT_DATA_DIR;

    // 确保默认目录存在
    const ensureResult = await ensureDataDirectoryExists();
    if (!ensureResult.success) {
      return { success: false, error: ensureResult.error };
    }

    // 保存配置
    const saveResult = await saveDataDirectoryConfig();
    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }

    console.log('数据目录已重置为默认:', getDataDirectory());
    return { success: true, directory: getDataDirectory() };
  } catch (error) {
    console.error('重置数据目录失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 保存数据目录配置
 */
async function saveDataDirectoryConfig() {
  try {
    const configPath = path.join(__dirname, CONFIG_FILE);
    const config = {
      dataDirectory: currentDataDir,
      lastUpdated: new Date().toISOString()
    };

    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    return { success: true };
  } catch (error) {
    console.error('保存数据目录配置失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 迁移数据到新目录
 */
async function migrateDataToNewDirectory(oldDir, newDir) {
  try {
    console.log('开始数据迁移:', oldDir, '->', newDir);

    // 检查旧目录是否存在
    try {
      await fs.access(oldDir);
    } catch {
      console.log('旧目录不存在，跳过迁移');
      return { success: true };
    }

    // 获取旧目录中的所有文件和子目录
    const items = await fs.readdir(oldDir, { withFileTypes: true });

    for (const item of items) {
      const srcPath = path.join(oldDir, item.name);
      const destPath = path.join(newDir, item.name);

      if (item.isDirectory()) {
        // 递归复制目录
        await copyDirectory(srcPath, destPath);
      } else {
        // 复制文件
        await fs.copyFile(srcPath, destPath);
      }
    }

    console.log('数据迁移完成');
    return { success: true };
  } catch (error) {
    console.error('数据迁移失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 复制目录（递归）
 */
async function copyDirectory(src, dest) {
  try {
    await fs.mkdir(dest, { recursive: true });
    const items = await fs.readdir(src, { withFileTypes: true });

    for (const item of items) {
      const srcPath = path.join(src, item.name);
      const destPath = path.join(dest, item.name);

      if (item.isDirectory()) {
        await copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  } catch (error) {
    console.error('复制目录失败:', error);
    throw error;
  }
}

module.exports = {
  initDataDirectory,
  getDataDirectory,
  getClassListPath,
  getConfigPath,
  getClassesDirectory,
  getMainDatabasePath,
  selectDataDirectory,
  resetDataDirectory,
  ensureDataDirectoryExists
};