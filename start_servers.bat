@echo off
echo ========================================
echo   DEMARRAGE DES SERVEURS
echo ========================================
echo.

REM Demarrer le serveur Django
echo [1/2] Demarrage du serveur Django...
start "Django Server" cmd /k "cd backend && venv\Scripts\python.exe manage.py runserver"
timeout /t 3 /nobreak >nul

REM Demarrer le serveur React
echo [2/2] Demarrage du serveur React...
cd frontend
start "React Server" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo   SERVEURS DEMARRES
echo ========================================
echo.
echo Django: http://localhost:8000
echo React:  http://localhost:3000
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause >nul

