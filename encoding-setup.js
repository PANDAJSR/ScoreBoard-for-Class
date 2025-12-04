/**
 * 编码设置模块
 * 用于解决中文控制台乱码问题
 */

const { exec } = require('child_process');
const os = require('os');

/**
 * 设置控制台编码为UTF-8
 * 解决Windows系统下中文乱码问题
 */
function setupConsoleEncoding() {
  // 只在Windows系统下需要设置
  if (process.platform === 'win32') {
    try {
      // 同步执行编码设置，确保立即生效
      const { execSync } = require('child_process');
      execSync('chcp 65001', { stdio: 'ignore' });
      console.log('控制台编码已设置为UTF-8');
    } catch (error) {
      console.warn('设置控制台编码失败:', error.message);
    }
  }

  // 设置环境变量，确保子进程也使用UTF-8
  process.env.CHCP = '65001';
  process.env.NODE_ENCODING = 'utf8';
}

/**
 * 设置标准输出流的编码
 */
function setupStreamEncoding() {
  // 确保标准输入输出使用UTF-8编码
  if (process.stdout && process.stdout.setEncoding) {
    process.stdout.setEncoding('utf8');
  }
  if (process.stderr && process.stderr.setEncoding) {
    process.stderr.setEncoding('utf8');
  }
  if (process.stdin && process.stdin.setEncoding) {
    process.stdin.setEncoding('utf8');
  }
}

/**
 * 初始化所有编码设置
 */
function initEncoding() {
  setupConsoleEncoding();
  setupStreamEncoding();
}

module.exports = {
  setupConsoleEncoding,
  setupStreamEncoding,
  initEncoding
};