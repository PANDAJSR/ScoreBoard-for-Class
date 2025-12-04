@echo off
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
node -e "console.log('中文测试：主进程初始化完成'); console.log('添加学生成功：张三');";
"
