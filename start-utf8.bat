@echo off
:: Electron UTF-8编码启动脚本
:: 解决npm start时的中文乱码问题

echo 正在设置UTF-8编码环境...

:: 设置控制台编码为UTF-8
chcp 65001 > nul

:: 设置环境变量
set NODE_ENCODING=utf8
set POWERSHELL_CLI_ENCODING=utf8
set PSREADLINE_OUTPUT_ENCODING=utf8
set FORCE_COLOR=1

echo UTF-8编码环境设置完成
echo.

:: 启动Electron应用
echo 正在启动Electron应用...
electron .

:: 暂停查看错误
if errorlevel 1 (
    echo.
    echo 启动失败，按任意键退出...
    pause
)