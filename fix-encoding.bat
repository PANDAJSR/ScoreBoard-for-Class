@echo off
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

:: 运行测试
echo.
echo 测试中文输出：
node -e "console.log('主进程初始化完成'); console.log('数据目录初始化成功'); console.log('数据库初始化完成'); console.log('添加学生成功：张三'); console.log('删除学生成功：李四');"

echo.
echo 如果以上中文显示正常，说明编码修复成功！
pause