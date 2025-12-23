@echo off
echo ========================================
echo   Demarrage de l'application complete
echo ========================================
echo.

echo [1/2] Demarrage du Backend Django...
start "Backend Django" cmd /k "cd backend && venv\Scripts\activate.bat && python manage.py runserver"

timeout /t 3 /nobreak >nul

echo [2/2] Demarrage du Frontend React...
start "Frontend React" cmd /k "%~dp0start_frontend_wrapper.bat"

echo.
echo ========================================
echo   Les deux serveurs sont en cours de demarrage
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3001
echo Admin:    http://localhost:8000/admin
echo.
echo Identifiants: admin / admin123
echo.
pause





