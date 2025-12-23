@echo off
cd /d "%~dp0frontend"
set NODE_DIR=%~dp0nodejs-portable
set PATH=%NODE_DIR%;%PATH%

echo Demarrage du serveur de developpement frontend...
call "%NODE_DIR%\npm.cmd" run dev

pause


