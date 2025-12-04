@echo off
:: 简单的PowerShell UTF-8启动器
echo 正在启动UTF-8编码的PowerShell...

:: 设置控制台编码
chcp 65001

:: 启动Node.js程序
node %*

pause