@echo off
REM Script pour assigner la permission de validation des commandes à un utilisateur
echo Assignation de la permission de validation des commandes...
echo.

cd /d %~dp0
call venv\Scripts\activate.bat
python manage.py shell < assign_validation_permission.py

pause

