@echo off
echo ========================================
echo   Test de Configuration Email
echo ========================================
echo.

cd /d %~dp0
call venv\Scripts\activate.bat
python manage.py shell < test_email.py

pause

