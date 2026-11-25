@echo off
chcp 65001 >nul
title Mijoz topish
cd /d "%~dp0"
start "" cmd /c "timeout /t 2 >nul & start http://localhost:3100"
node bot\index.js
pause
