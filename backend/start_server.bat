@echo off
echo Activation de l'environnement virtuel...
call venv\Scripts\activate.bat

echo Demarrage du serveur Django...
python manage.py runserver

pause




