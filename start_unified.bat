@echo off
echo ========================================
echo   Demarrage Interface Unifiee
echo   Tout sur localhost:8000
echo ========================================
echo.

echo [1/2] Demarrage du Backend Django...
start "Backend Django" cmd /k "cd backend && venv\Scripts\activate.bat && python manage.py runserver"

timeout /t 3 /nobreak >nul

echo [2/2] Demarrage du Frontend React (dev server)...
start "Frontend React" cmd /k "cd frontend && ..\nodejs-portable\npm.cmd run dev"

echo.
echo ========================================
echo   Les deux serveurs sont en cours de demarrage
echo ========================================
echo.
echo Acces unifie sur: http://localhost:8000
echo Admin Django:     http://localhost:8000/admin
echo API:              http://localhost:8000/api/
echo.
echo Identifiants: admin / admin123
echo.
pause

