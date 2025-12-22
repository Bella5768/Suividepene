@echo off
REM Script de configuration pour Windows

echo Configuration de l'application Suivi des Depenses...

REM Créer l'environnement virtuel
echo Creation de l'environnement virtuel...
python -m venv venv

REM Activer l'environnement virtuel
call venv\Scripts\activate.bat

REM Installer les dépendances
echo Installation des dependances...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Copier le fichier .env.example vers .env
if not exist .env (
    echo Creation du fichier .env...
    copy .env.example .env
    echo ⚠️  Veuillez configurer le fichier .env avec vos parametres de base de donnees
)

REM Créer les migrations
echo Creation des migrations...
python manage.py makemigrations

REM Appliquer les migrations
echo Application des migrations...
python manage.py migrate

REM Créer un superutilisateur
echo Creation du superutilisateur...
echo Vous serez invite a saisir un nom d'utilisateur, email et mot de passe
python manage.py createsuperuser

echo ✅ Configuration terminee!
echo Pour demarrer le serveur: python manage.py runserver

pause




