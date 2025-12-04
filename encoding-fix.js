/**
 * 完整的编码修复模块
 * 专门解决PowerShell终端中文乱码问题
 */

const { exec, execSync } = require('child_process');
const os = require('os');

/**
 * 检测当前控制台编码
 */
function detectConsoleEncoding() {
  try {
    if (process.platform === 'win32') {
      // 尝试获取当前代码页
      const result = execSync('chcp', { encoding: 'utf8' });
      const match = result.match(/(\d+)/);
      return match ? match[1] : 'unknown';
    }
    return 'utf8';
  } catch (error) {
    return 'unknown';
  }
}

/**
 * 强制设置控制台编码为UTF-8
 * 包含多种方法确保编码设置成功
 */
function forceSetUTF8Encoding() {
  if (process.platform !== 'win32') {
    return;
  }

  try {
    // 方法1: 直接设置chcp
    execSync('chcp 65001', { stdio: 'ignore' });

    // 方法2: 设置PowerShell输出编码
    process.env.POWERSHELL_CLI_ENCODING = 'utf8';
    process.env.PSREADLINE_OUTPUT_ENCODING = 'utf8';

    // 方法3: 设置Node.js相关环境变量
    process.env.NODE_OPTIONS = '--enable-source-maps';
    process.env.FORCE_COLOR = '1';

    // 方法4: 设置Windows控制台缓冲区编码
    try {
      execSync('cmd /c "chcp 65001 > nul"', { stdio: 'ignore' });
    } catch (e) {
      // 忽略cmd执行错误
    }

  } catch (error) {
    console.warn('设置控制台编码失败:', error.message);
  }
}

/**
 * 设置Node.js流编码
 */
function setupNodeStreams() {
  // 确保所有标准流使用UTF-8编码
  const streams = [process.stdout, process.stderr, process.stdin];

  streams.forEach(stream => {
    if (stream && stream.setEncoding) {
      stream.setEncoding('utf8');
    }
  });

  // 设置Node.js内部编码
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_DEBUG = 'utf8';
  }
}

/**
 * 创建编码安全的console对象
 */
function createSafeConsole() {
  const originalConsole = console;

  // 创建新的console实例，确保使用UTF-8编码
  const safeConsole = {};

  ['log', 'error', 'warn', 'info', 'debug'].forEach(method => {
    safeConsole[method] = function(...args) {
      try {
        // 将所有参数转换为字符串并确保UTF-8编码
        const safeArgs = args.map(arg => {
          if (typeof arg === 'string') {
            return arg;
          } else if (arg instanceof Error) {
            return arg.toString();
          } else {
            return JSON.stringify(arg);
          }
        });

        // 使用原始console方法输出
        originalConsole[method](...safeArgs);
      } catch (error) {
        // 如果出错，使用最基础的输出方式
        originalConsole.log(...args);
      }
    };
  });

  return safeConsole;
}

/**
 * 初始化所有编码设置
 */
function initPowerShellEncoding() {
  // 检测当前编码
  const currentEncoding = detectConsoleEncoding();

  if (process.platform === 'win32') {
    // 强制设置UTF-8编码
    forceSetUTF8Encoding();

    // 设置Node.js流编码
    setupNodeStreams();

    // 设置环境变量
    process.env.CHCP = '65001';
    process.env.NODE_ENCODING = 'utf8';
    process.env.POWERSHELL_CLI_ENCODING = 'utf8';

    // 创建安全的console对象
    const safeConsole = createSafeConsole();

    // 覆盖全局console（可选）
    if (typeof global !== 'undefined') {
      global.console = safeConsole;
    }

    return {
      originalEncoding: currentEncoding,
      currentEncoding: '65001 (UTF-8)',
      fixed: true
    };
  }

  return {
    originalEncoding: currentEncoding,
    currentEncoding: 'utf8',
    fixed: false
  };
}

/**
 * 测试中文输出
 */
function testChineseOutput() {
  const testMessages = [
    '=== 中文编码测试 ===',
    '主进程初始化完成',
    '数据目录初始化成功',
    '数据库初始化完成',
    '班级管理窗口已创建：无边框，无菜单栏',
    '添加学生成功：张三',
    '删除学生成功：李四',
    'Database connected successfully',
    '数据库连接失败：连接超时'
  ];

  console.log('正在测试中文输出...');
  testMessages.forEach(msg => {
    try {
      console.log(msg);
    } catch (error) {
      process.stdout.write(msg + '\n');
    }
  });
}

/**
 * 获取编码修复的批处理脚本内容
 */
function getEncodingFixScript() {
  return `@echo off
:: PowerShell中文乱码修复脚本
echo 正在修复PowerShell中文编码问题...

:: 设置控制台编码为UTF-8
chcp 65001 > nul

:: 设置PowerShell编码
set POWERSHELL_CLI_ENCODING=utf8
set PSREADLINE_OUTPUT_ENCODING=utf8

:: 设置Node.js编码
set NODE_ENCODING=utf8
set FORCE_COLOR=1

echo 编码设置完成！
echo 当前代码页：
chcp

:: 暂停查看结果
pause`;
}

module.exports = {
  detectConsoleEncoding,
  forceSetUTF8Encoding,
  setupNodeStreams,
  createSafeConsole,
  initPowerShellEncoding,
  testChineseOutput,
  getEncodingFixScript
};