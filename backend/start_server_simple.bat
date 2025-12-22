@echo off
cd /d %~dp0
echo Demarrage du serveur Django...
echo.
echo Le serveur sera accessible sur: http://localhost:8000
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.
venv\Scripts\python.exe manage.py runserver
pause



