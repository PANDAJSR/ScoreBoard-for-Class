/**
 * PowerShell专用编码修复工具
 * 针对PowerShell终端中文乱码问题
 */

const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * 检测PowerShell版本和编码设置
 */
function detectPowerShellInfo() {
  try {
    // 获取PowerShell版本
    const psVersion = execSync('powershell -Command "$PSVersionTable.PSVersion"', {
      encoding: 'utf8',
      windowsHide: true
    });

    // 获取当前输出编码
    const outputEncoding = execSync('powershell -Command "[console]::OutputEncoding"', {
      encoding: 'utf8',
      windowsHide: true
    });

    // 获取当前输入编码
    const inputEncoding = execSync('powershell -Command "[console]::InputEncoding"', {
      encoding: 'utf8',
      windowsHide: true
    });

    return {
      version: psVersion.trim(),
      outputEncoding: outputEncoding.trim(),
      inputEncoding: inputEncoding.trim()
    };
  } catch (error) {
    return {
      error: error.message,
      fallback: '无法检测PowerShell信息'
    };
  }
}

/**
 * 设置PowerShell编码为UTF-8
 */
function setPowerShellUTF8() {
  const commands = [
    // 设置控制台输出编码
    '[console]::OutputEncoding = [System.Text.Encoding]::UTF8',
    // 设置控制台输入编码
    '[console]::InputEncoding = [System.Text.Encoding]::UTF8',
    // 设置PowerShell输出编码
    '$OutputEncoding = [System.Text.Encoding]::UTF8',
    // 设置环境变量
    '[Environment]::SetEnvironmentVariable(\"POWERSHELL_CLI_ENCODING\", \"utf8\", \"Process\")',
    '[Environment]::SetEnvironmentVariable(\"PSREADLINE_OUTPUT_ENCODING\", \"utf8\", \"Process\")'
  ];

  try {
    commands.forEach(cmd => {
      execSync(`powershell -Command "${cmd}"`, {
        stdio: 'ignore',
        windowsHide: true
      });
    });
    return true;
  } catch (error) {
    console.warn('设置PowerShell UTF8编码失败:', error.message);
    return false;
  }
}

/**
 * 创建PowerShell配置文件
 */
function createPowerShellProfile() {
  try {
    // 获取PowerShell配置文件路径
    const profilePath = execSync('powershell -Command "$PROFILE"', {
      encoding: 'utf8',
      windowsHide: true
    }).trim();

    if (profilePath) {
      // UTF-8编码设置脚本
      const utf8Script = `
# 设置UTF-8编码
[console]::OutputEncoding = [System.Text.Encoding]::UTF8
[console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 设置Node.js编码
$env:NODE_ENCODING = "utf8"
$env:POWERSHELL_CLI_ENCODING = "utf8"
$env:PSREADLINE_OUTPUT_ENCODING = "utf8"
`;

      // 确保配置文件目录存在
      const profileDir = path.dirname(profilePath);
      if (!fs.existsSync(profileDir)) {
        fs.mkdirSync(profileDir, { recursive: true });
      }

      // 写入配置文件
      fs.writeFileSync(profilePath, utf8Script, 'utf8');
      return profilePath;
    }
  } catch (error) {
    console.warn('创建PowerShell配置文件失败:', error.message);
  }
  return null;
}

/**
 * 运行PowerShell中文测试
 */
function testPowerShellChinese() {
  const testScript = `
Write-Host "=== PowerShell中文测试 ==="
Write-Host "主进程初始化完成"
Write-Host "数据目录初始化成功"
Write-Host "数据库初始化完成"
Write-Host "添加学生成功：张三"
Write-Host "删除学生成功：李四"
Write-Host "Database connected successfully"
Write-Host "数据库连接失败：连接超时"
Write-Host "=== 测试完成 ==="
`;

  try {
    const result = execSync(`powershell -Command "${testScript}"`, {
      encoding: 'utf8',
      windowsHide: true
    });
    return result;
  } catch (error) {
    return `测试失败: ${error.message}`;
  }
}

/**
 * 创建PowerShell启动脚本
 */
function createPowerShellLauncher() {
  const launcherContent = `@echo off
:: PowerShell UTF-8编码启动器
:: 用于解决中文乱码问题

echo 正在设置PowerShell UTF-8编码...

:: 设置控制台编码
chcp 65001 > nul

:: 设置环境变量
set POWERSHELL_CLI_ENCODING=utf8
set PSREADLINE_OUTPUT_ENCODING=utf8
set NODE_ENCODING=utf8

:: 启动PowerShell并设置编码
start powershell -NoExit -Command "
[console]::OutputEncoding = [System.Text.Encoding]::UTF8;
[console]::InputEncoding = [System.Text.Encoding]::UTF8;
$OutputEncoding = [System.Text.Encoding]::UTF8;
Write-Host 'PowerShell UTF-8编码已设置完成' -ForegroundColor Green;
Write-Host '当前编码：$([console]::OutputEncoding.WebName)' -ForegroundColor Yellow;
node -e \"console.log('中文测试：主进程初始化完成'); console.log('添加学生成功：张三');\";
"
`;

  fs.writeFileSync('start-powershell-utf8.bat', launcherContent, 'utf8');
  return 'start-powershell-utf8.bat';
}

/**
 * 全面的PowerShell编码修复
 */
function fixPowerShellEncoding() {
  console.log('=== PowerShell编码修复工具 ===');

  // 1. 检测当前PowerShell信息
  console.log('1. 检测PowerShell信息...');
  const psInfo = detectPowerShellInfo();
  console.log('PowerShell信息:', psInfo);

  // 2. 设置UTF-8编码
  console.log('2. 设置PowerShell UTF-8编码...');
  const setResult = setPowerShellUTF8();
  console.log('编码设置结果:', setResult ? '成功' : '失败');

  // 3. 创建PowerShell配置文件
  console.log('3. 创建PowerShell配置文件...');
  const profilePath = createPowerShellProfile();
  console.log('配置文件路径:', profilePath || '创建失败');

  // 4. 创建启动脚本
  console.log('4. 创建PowerShell启动脚本...');
  const launcherPath = createPowerShellLauncher();
  console.log('启动脚本:', launcherPath);

  // 5. 测试中文输出
  console.log('5. 测试PowerShell中文输出...');
  const testResult = testPowerShellChinese();
  console.log('中文测试结果:');
  console.log(testResult);

  return {
    powerShellInfo: psInfo,
    encodingSet: setResult,
    profilePath: profilePath,
    launcherPath: launcherPath,
    testResult: testResult
  };
}

// 如果直接运行此模块，执行修复
if (require.main === module) {
  fixPowerShellEncoding();
}

module.exports = {
  detectPowerShellInfo,
  setPowerShellUTF8,
  createPowerShellProfile,
  testPowerShellChinese,
  createPowerShellLauncher,
  fixPowerShellEncoding
};