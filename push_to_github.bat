@echo off
echo ========================================
echo Push vers GitHub
echo ========================================
echo.

REM Vérifier si git est installé
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: Git n'est pas installe ou n'est pas dans le PATH.
    echo.
    echo Veuillez installer Git depuis: https://git-scm.com/download/win
    echo Ou ajouter Git au PATH de votre systeme.
    pause
    exit /b 1
)

cd /d "%~dp0"

REM Vérifier si .git existe
if not exist ".git" (
    echo Initialisation du depot Git...
    git init
    echo.
)

REM Vérifier si le remote existe
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Ajout du remote GitHub...
    git remote add origin https://github.com/Bella5768/Suividepene.git
    echo.
)

echo Verification du remote...
git remote -v
echo.

echo Ajout de tous les fichiers...
git add .
echo.

echo Creation du commit initial...
git commit -m "Initial commit: Application de suivi des depenses avec restauration"
echo.

echo Push vers GitHub...
echo ATTENTION: Vous devrez peut-etre entrer vos identifiants GitHub.
echo.
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Tentative avec la branche master...
    git push -u origin master
)

echo.
echo ========================================
echo Termine!
echo ========================================
pause

