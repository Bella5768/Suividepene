@echo off
REM Start Django Development Server with full paths
cd /d "C:\wamp64\www\Suivi_depense\backend"
call venv\Scripts\activate.bat
python manage.py runserver 0.0.0.0:8000
