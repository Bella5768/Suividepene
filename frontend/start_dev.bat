@echo off
set NODE_DIR=%~dp0..\nodejs-portable
set PATH=%NODE_DIR%;%PATH%

echo Verification de Node.js...
"%NODE_DIR%\node.exe" --version

echo Demarrage du serveur de developpement...
call "%NODE_DIR%\npm.cmd" run dev

pause

