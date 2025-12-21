@echo off
REM Script to build frontend and prepare for deployment

echo.
echo ========================================
echo Building Frontend for Production
echo ========================================
echo.

cd /d "C:\wamp64\www\Suivi_depense\frontend"

REM Install dependencies
echo Installing npm dependencies...
call npm install

REM Build for production
echo Building frontend...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Copying Built Files to Django
echo ========================================
echo.

REM Copy dist files to Django static folder
echo Copying files...
xcopy /E /I /Y "dist\*" "..\backend\depenses\static\depenses\"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to copy files!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Collecting Static Files
echo ========================================
echo.

cd /d "C:\wamp64\www\Suivi_depense\backend"

REM Collect static files
call venv\Scripts\python.exe manage.py collectstatic --noinput

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: collectstatic failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Test locally: python manage.py runserver
echo 2. Push to GitHub: git add -A ^&^& git commit -m "Frontend build" ^&^& git push
echo 3. Deploy to PythonAnywhere
echo.
pause
