@echo off
REM Start Django development server

echo.
echo ========================================
echo Starting Django Development Server
echo ========================================
echo.

cd /d "C:\wamp64\www\Suivi_depense\backend"

echo Server will run on: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.

C:\wamp64\www\Suivi_depense\backend\venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
