# Guide d'Installation - Suivi des Dépenses CSI

## Prérequis

- **Python 3.10+** : [Télécharger Python](https://www.python.org/downloads/)
- **Node.js 18+** : [Télécharger Node.js](https://nodejs.org/)
- **MySQL 8.0+** : Inclus dans WAMP
- **WAMP** : [Télécharger WAMP](https://www.wampserver.com/)

## Installation étape par étape

### 1. Préparation de la base de données MySQL

1. Démarrer WAMP
2. Ouvrir phpMyAdmin (http://localhost/phpmyadmin)
3. Créer une nouvelle base de données nommée `suivi_depense`
   - Encodage : `utf8mb4_unicode_ci`
4. Ou exécuter le script SQL :
```sql
CREATE DATABASE IF NOT EXISTS suivi_depense CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configuration du Backend Django

1. Ouvrir un terminal dans le dossier du projet
2. Naviguer vers le dossier backend :
```bash
cd backend
```

3. Créer et activer un environnement virtuel Python :
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

4. Installer les dépendances :
```bash
pip install -r requirements.txt
```

5. Configurer les variables d'environnement :
   - Copier `backend/.env.example` vers `backend/.env`
   - Modifier les paramètres dans `.env` :
```
SECRET_KEY=votre-cle-secrete-ici
DEBUG=True
DB_NAME=suivi_depense
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
```

6. Créer les migrations :
```bash
python manage.py makemigrations
```

7. Appliquer les migrations :
```bash
python manage.py migrate
```

8. Créer un superutilisateur :
```bash
python manage.py createsuperuser
```
   - Saisir un nom d'utilisateur, email et mot de passe

9. Lancer le serveur de développement :
```bash
python manage.py runserver
```

Le backend sera accessible sur http://localhost:8000

### 3. Configuration du Frontend React

1. Ouvrir un nouveau terminal
2. Naviguer vers le dossier frontend :
```bash
cd frontend
```

3. Installer les dépendances :
```bash
npm install
```

4. Lancer le serveur de développement :
```bash
npm run dev
```

Le frontend sera accessible sur http://localhost:3000

## Utilisation

1. Accéder à l'application : http://localhost:3000
2. Se connecter avec les identifiants créés lors de la création du superutilisateur
3. Commencer à utiliser l'application :
   - Créer des catégories et sous-catégories
   - Créer des prévisions mensuelles
   - Saisir des opérations quotidiennes
   - Générer des rapports mensuels

## Scripts d'automatisation

### Windows
Exécuter `backend/scripts/setup.bat` pour automatiser la configuration du backend.

### Linux/Mac
Exécuter `backend/scripts/setup.sh` :
```bash
chmod +x backend/scripts/setup.sh
./backend/scripts/setup.sh
```

## Dépannage

### Erreur de connexion à MySQL
- Vérifier que WAMP est démarré
- Vérifier les paramètres dans `backend/.env`
- Vérifier que la base de données `suivi_depense` existe

### Erreur "Module not found"
- Vérifier que l'environnement virtuel est activé
- Réinstaller les dépendances : `pip install -r requirements.txt`

### Erreur CORS
- Vérifier que `CORS_ALLOWED_ORIGINS` dans `settings.py` inclut `http://localhost:3000`

### Erreur de migration
- Supprimer les fichiers de migration (sauf `__init__.py`) dans `depenses/migrations/`
- Exécuter `python manage.py makemigrations` puis `python manage.py migrate`

## Production

Pour déployer en production :

1. Configurer `DEBUG=False` dans `.env`
2. Configurer `ALLOWED_HOSTS` avec votre domaine
3. Configurer HTTPS/TLS
4. Configurer une base de données MySQL sécurisée
5. Configurer la sauvegarde automatique de la base de données
6. Utiliser un serveur web (Nginx + Gunicorn pour Django)
7. Configurer le build de production pour React :
```bash
cd frontend
npm run build
```

## Support

Pour toute question, consultez le README.md ou contactez l'équipe de développement.




