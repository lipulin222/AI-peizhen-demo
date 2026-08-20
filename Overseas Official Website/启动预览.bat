@echo off
chcp 65001 >nul
title 卓正医疗 - 本地预览服务器
color 0A

echo.
echo  ============================================
echo    卓正医疗 - 网页本地预览
echo  ============================================
echo.

REM 尝试优先用 Python
where python >nul 2>nul
if %errorlevel%==0 (
  echo  [√] 检测到 Python，使用 Python 启动...
  echo.
  echo  预览地址:  http://localhost:9123
  echo  关闭窗口即可停止服务
  echo.
  start "" http://localhost:9123
  cd /d "%~dp0"
  python -m http.server 9123
  goto :end
)

REM 退回 PowerShell 方案
echo  [*] 未检测到 Python，使用 PowerShell 内置服务器...
echo.
echo  预览地址:  http://localhost:9123
echo  关闭窗口即可停止服务
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1" -Port 9123
start "" http://localhost:9123

:end
pause
