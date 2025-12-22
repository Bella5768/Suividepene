@echo off
echo ========================================
echo   Creation de la migration pour ExtraRestauration
echo ========================================
echo.

cd /d %~dp0
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
    python manage.py makemigrations depenses
    echo.
    echo Migration creee avec succes!
    echo.
    echo Pour appliquer la migration, executez:
    echo python manage.py migrate depenses
) else (
    echo Environnement virtuel non trouve!
    echo Veuillez creer l'environnement virtuel d'abord.
)

pause


