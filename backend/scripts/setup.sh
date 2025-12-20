#!/bin/bash
# Script de configuration pour Linux/Mac

echo "Configuration de l'application Suivi des Dépenses..."

# Créer l'environnement virtuel
echo "Création de l'environnement virtuel..."
python3 -m venv venv

# Activer l'environnement virtuel
source venv/bin/activate

# Installer les dépendances
echo "Installation des dépendances..."
pip install --upgrade pip
pip install -r requirements.txt

# Copier le fichier .env.example vers .env
if [ ! -f .env ]; then
    echo "Création du fichier .env..."
    cp .env.example .env
    echo "⚠️  Veuillez configurer le fichier .env avec vos paramètres de base de données"
fi

# Créer les migrations
echo "Création des migrations..."
python manage.py makemigrations

# Appliquer les migrations
echo "Application des migrations..."
python manage.py migrate

# Créer un superutilisateur
echo "Création du superutilisateur..."
echo "Vous serez invité à saisir un nom d'utilisateur, email et mot de passe"
python manage.py createsuperuser

echo "✅ Configuration terminée!"
echo "Pour démarrer le serveur: python manage.py runserver"



