/**
 * 直接编码修复方案
 * 针对GB2312 -> UTF-8转换
 */

const { execSync } = require('child_process');
const fs = require('fs');

/**
 * 最直接的编码修复方法
 */
function directEncodingFix() {
  if (process.platform !== 'win32') {
    return { success: true, message: '非Windows系统，无需修复' };
  }

  try {
    // 方法1: 直接执行chcp命令
    console.log('正在设置控制台编码为UTF-8...');
    execSync('cmd /c "chcp 65001"', { stdio: 'inherit' });

    // 方法2: 设置Node.js进程编码
    process.stdout.setDefaultEncoding('utf8');
    process.stderr.setDefaultEncoding('utf8');

    // 方法3: 设置环境变量
    process.env.CHCP = '65001';
    process.env.NODE_OPTIONS = '--enable-unicode';

    return { success: true, message: '编码修复完成' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * 创建Windows注册表文件
 * 永久修复PowerShell编码
 */
function createRegistryFix() {
  const registryContent = `Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\Console]
"CodePage"=dword:0000fde9
"FaceName"="Consolas"
"FontFamily"=dword:00000036
"FontSize"=dword:00000014
"HistoryNoDup"=dword:00000000
"QuickEdit"=dword:00000001
"WindowSize"=dword:00190059

[HKEY_CURRENT_USER\Console\%SystemRoot%_system32_WindowsPowerShell_v1.0_powershell.exe]
"CodePage"=dword:0000fde9
"FaceName"="Consolas"
"FontFamily"=dword:00000036
"FontSize"=dword:00000014
"HistoryNoDup"=dword:00000000
"QuickEdit"=dword:00000001
"WindowSize"=dword:00190059

[HKEY_CURRENT_USER\Console\%SystemRoot%_System32_WindowsPowerShell_v1.0_powershell.exe]
"CodePage"=dword:0000fde9
"FaceName"="Consolas"
"FontFamily"=dword:00000036
"FontSize"=dword:00000014
"HistoryNoDup"=dword:00000000
"QuickEdit"=dword:00000001
"WindowSize"=dword:00190059`;

  fs.writeFileSync('fix-encoding.reg', registryContent, 'utf8');
  return 'fix-encoding.reg';
}

/**
 * 创建简单的PowerShell UTF-8启动器
 */
function createSimpleLauncher() {
  const launcherContent = `@echo off
:: 简单的PowerShell UTF-8启动器
echo 正在启动UTF-8编码的PowerShell...

:: 设置控制台编码
chcp 65001

:: 启动Node.js程序
node %*

pause`;

  fs.writeFileSync('node-utf8.bat', launcherContent, 'utf8');
  return 'node-utf8.bat';
}

/**
 * 测试各种中文输出方式
 */
function testChineseOutputs() {
  const messages = [
    '=== 中文编码测试 ===',
    '主进程初始化完成',
    '数据目录初始化成功 D:\\Code代码\\ScoreBoard-for-Class\\data',
    '数据库初始化完成',
    '班级管理窗口已创建：无边框，无菜单栏',
    '班级管理窗口关闭',
    '添加学生成功：张三',
    '删除学生成功：李四',
    'Database connected successfully',
    '数据库连接失败：连接超时'
  ];

  console.log('\n=== 开始中文输出测试 ===');

  // 测试1: 直接console.log
  console.log('\n--- 方法1: console.log ---');
  messages.forEach(msg => {
    try {
      console.log(msg);
    } catch (e) {
      process.stdout.write(msg + '\n');
    }
  });

  // 测试2: process.stdout.write
  console.log('\n--- 方法2: process.stdout.write ---');
  messages.forEach(msg => {
    try {
      process.stdout.write(msg + '\n');
    } catch (e) {
      console.log(msg);
    }
  });

  // 测试3: Buffer输出
  console.log('\n--- 方法3: Buffer输出 ---');
  messages.forEach(msg => {
    try {
      const buffer = Buffer.from(msg + '\n', 'utf8');
      process.stdout.write(buffer);
    } catch (e) {
      console.log(msg);
    }
  });

  console.log('\n=== 中文测试完成 ===');
}

/**
 * 运行完整修复流程
 */
function runCompleteFix() {
  console.log('=== 直接编码修复方案 ===\n');

  // 1. 直接修复
  console.log('1. 应用直接编码修复...');
  const fixResult = directEncodingFix();
  console.log('修复结果:', fixResult.message);

  // 2. 创建注册表文件
  console.log('\n2. 创建注册表修复文件...');
  const regFile = createRegistryFix();
  console.log('注册表文件:', regFile);
  console.log('使用方法: 双击', regFile, '导入注册表');

  // 3. 创建启动器
  console.log('\n3. 创建UTF-8启动器...');
  const launcher = createSimpleLauncher();
  console.log('启动器:', launcher);
  console.log('使用方法: node-utf8.bat your-script.js');

  // 4. 测试中文输出
  console.log('\n4. 测试中文输出...');
  testChineseOutputs();

  return {
    fixResult,
    regFile,
    launcher,
    recommendations: [
      '方案1: 直接运行 node your-script.js (已修复)',
      '方案2: 双击导入 ' + regFile + ' (永久修复)',
      '方案3: 使用 ' + launcher + ' your-script.js (隔离修复)'
    ]
  };
}

// 如果直接运行
if (require.main === module) {
  runCompleteFix();
}

module.exports = {
  directEncodingFix,
  createRegistryFix,
  createSimpleLauncher,
  testChineseOutputs,
  runCompleteFix
};