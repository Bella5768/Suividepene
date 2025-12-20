@echo off
REM Start Django Development Server
cd /d "%~dp0backend"
call venv\Scripts\activate.bat
python manage.py runserver 0.0.0.0:8000
pause
