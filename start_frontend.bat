@echo off
cd /d "%~dp0frontend"
"%~dp0nodejs-portable\node.exe" "%~dp0frontend\node_modules\vite\bin\vite.js"
pause
