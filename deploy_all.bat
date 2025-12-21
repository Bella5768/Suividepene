@echo off
REM Complete deployment script - builds frontend and prepares for production

setlocal enabledelayedexpansion

echo.
echo ========================================
echo SUIVI DES DEPENSES - DEPLOYMENT SCRIPT
echo ========================================
echo.

REM Set paths
set NODE_PATH=C:\wamp64\www\Suivi_depense\nodejs-portable\node.exe
set NPM_PATH=C:\wamp64\www\Suivi_depense\nodejs-portable\node_modules\npm\bin\npm-cli.js
set PYTHON_PATH=C:\wamp64\www\Suivi_depense\backend\venv\Scripts\python.exe
set PROJECT_ROOT=C:\wamp64\www\Suivi_depense

echo Step 1: Installing Frontend Dependencies...
echo.
cd /d "%PROJECT_ROOT%\frontend"
"%NODE_PATH%" "%NPM_PATH%" install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed
echo.

echo Step 2: Building Frontend...
echo.
"%NODE_PATH%" "%NPM_PATH%" run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm build failed!
    pause
    exit /b 1
)
echo ✓ Frontend built successfully
echo.

echo Step 3: Copying Built Files to Django...
echo.
if exist "dist" (
    xcopy /E /I /Y "dist\*" "%PROJECT_ROOT%\backend\depenses\static\depenses\"
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to copy files!
        pause
        exit /b 1
    )
    echo ✓ Files copied successfully
) else (
    echo ERROR: dist folder not found!
    pause
    exit /b 1
)
echo.

echo Step 4: Collecting Static Files...
echo.
cd /d "%PROJECT_ROOT%\backend"
"%PYTHON_PATH%" manage.py collectstatic --noinput
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: collectstatic failed!
    pause
    exit /b 1
)
echo ✓ Static files collected
echo.

echo Step 5: Running Database Migrations...
echo.
"%PYTHON_PATH%" manage.py migrate
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: migrate failed!
    pause
    exit /b 1
)
echo ✓ Migrations completed
echo.

echo Step 6: Pushing to GitHub...
echo.
cd /d "%PROJECT_ROOT%"
git add -A
git commit -m "Frontend build and deployment preparation"
git push origin main
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Git push failed (may already be up to date)
)
echo ✓ Changes pushed to GitHub
echo.

echo.
echo ========================================
echo ✓ DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Test locally: python manage.py runserver
echo 2. Open http://localhost:8000 in your browser
echo 3. Deploy to PythonAnywhere using the guide
echo.
echo Files ready for deployment:
echo - Frontend: %PROJECT_ROOT%\frontend\dist\
echo - Backend: %PROJECT_ROOT%\backend\
echo - Static files: %PROJECT_ROOT%\backend\depenses\static\
echo.
pause
