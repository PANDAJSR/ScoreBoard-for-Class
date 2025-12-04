/**
 * Electron UTF-8 启动脚本
 * 专门解决 npm start 时的中文乱码问题
 */

const { spawn } = require('child_process');
const os = require('os');

/**
 * 设置UTF-8编码环境变量
 */
function setupUTF8Environment() {
  // 设置Windows控制台编码
  if (process.platform === 'win32') {
    try {
      const { execSync } = require('child_process');
      execSync('chcp 65001', { stdio: 'ignore' });
    } catch (error) {
      // 忽略编码设置错误
    }
  }

  // 设置环境变量
  process.env.CHCP = '65001';
  process.env.NODE_ENCODING = 'utf8';
  process.env.POWERSHELL_CLI_ENCODING = 'utf8';
  process.env.PSREADLINE_OUTPUT_ENCODING = 'utf8';

  // 确保标准流使用UTF-8
  if (process.stdout && process.stdout.setEncoding) {
    process.stdout.setEncoding('utf8');
  }
  if (process.stderr && process.stderr.setEncoding) {
    process.stderr.setEncoding('utf8');
  }
}

/**
 * 启动Electron应用
 */
function startElectron() {
  // 设置UTF-8环境
  setupUTF8Environment();

  console.log('正在启动Electron应用（UTF-8编码）...');

  // 启动Electron
  const electron = spawn('electron', ['.'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      CHCP: '65001',
      NODE_ENCODING: 'utf8',
      POWERSHELL_CLI_ENCODING: 'utf8',
      PSREADLINE_OUTPUT_ENCODING: 'utf8',
      FORCE_COLOR: '1'
    }
  });

  electron.on('error', (error) => {
    console.error('启动Electron失败:', error);
    process.exit(1);
  });

  electron.on('exit', (code) => {
    process.exit(code);
  });
}

/**
 * 检查Electron是否安装
 */
function checkElectron() {
  try {
    require.resolve('electron');
    return true;
  } catch (error) {
    return false;
  }
}

// 主程序
if (require.main === module) {
  if (!checkElectron()) {
    console.error('错误: Electron 未安装，请先运行 npm install');
    process.exit(1);
  }

  startElectron();
}

module.exports = { startElectron, setupUTF8Environment };