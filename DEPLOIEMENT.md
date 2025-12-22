# 🚀 Guide de Déploiement - Suivi des Dépenses CSIG

Ce guide vous explique comment mettre en ligne votre application Django + React.

## 📋 Table des matières

1. [Préparation du projet](#1-préparation-du-projet)
2. [Options de déploiement](#2-options-de-déploiement)
3. [Déploiement sur serveur VPS/Linux](#3-déploiement-sur-serveur-vpslinux)
4. [Déploiement sur Heroku](#4-déploiement-sur-heroku)
5. [Déploiement sur PythonAnywhere](#5-déploiement-sur-pythonanywhere)
6. [Configuration de production](#6-configuration-de-production)
7. [Sécurité](#7-sécurité)

---

## 1. Préparation du projet

### 1.1. Créer un fichier `.env` pour la production

Créez un fichier `backend/.env` avec les variables d'environnement :

```env
# Sécurité
SECRET_KEY=votre-cle-secrete-tres-longue-et-aleatoire-ici
DEBUG=False
ALLOWED_HOSTS=votre-domaine.com,www.votre-domaine.com,IP_DU_SERVEUR

# Base de données
DB_NAME=suivi_depense
DB_USER=votre_user_db
DB_PASSWORD=votre_mot_de_passe_db
DB_HOST=localhost
DB_PORT=3306

# Email (Outlook/Office 365)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=support@csig.edu.gn
EMAIL_HOST_PASSWORD=gnnthnprwdlklnfd
DEFAULT_FROM_EMAIL=support@csig.edu.gn
SERVER_EMAIL=support@csig.edu.gn

# CORS (ajoutez votre domaine)
CORS_ALLOWED_ORIGINS=https://votre-domaine.com,https://www.votre-domaine.com
```

### 1.2. Générer une SECRET_KEY sécurisée

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 1.3. Préparer le build du frontend

```bash
cd frontend
npm install
npm run build
```

Le build sera créé dans `backend/depenses/static/depenses/`

---

## 2. Options de déploiement

### Option A : Serveur VPS/Linux (Recommandé)
- **Avantages** : Contrôle total, meilleures performances, coût modéré
- **Fournisseurs** : DigitalOcean, Linode, OVH, AWS EC2, Azure
- **Coût** : ~5-20€/mois

### Option B : Heroku
- **Avantages** : Simple, gestion automatique
- **Inconvénients** : Coût plus élevé, limitations
- **Coût** : ~7-25$/mois

### Option C : PythonAnywhere
- **Avantages** : Gratuit pour débuter, simple
- **Inconvénients** : Limitations sur le plan gratuit
- **Coût** : Gratuit (limité) ou 5$/mois

---

## 3. Déploiement sur serveur VPS/Linux

### 3.1. Prérequis sur le serveur

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Python 3.10+
sudo apt install python3 python3-pip python3-venv -y

# Installer MySQL
sudo apt install mysql-server -y

# Installer Nginx
sudo apt install nginx -y

# Installer Node.js (pour le build frontend)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installer Git
sudo apt install git -y
```

### 3.2. Configuration de la base de données MySQL

```bash
sudo mysql -u root -p
```

Dans MySQL :
```sql
CREATE DATABASE suivi_depense CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'suivi_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON suivi_depense.* TO 'suivi_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3.3. Déployer le code

```bash
# Créer un utilisateur pour l'application
sudo adduser --disabled-password --gecos "" suivi_app
sudo su - suivi_app

# Cloner ou transférer le projet
cd ~
git clone https://github.com/votre-repo/suivi_depense.git
# OU transférer via SCP/SFTP

cd suivi_depense/backend

# Créer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Installer les dépendances
pip install --upgrade pip
pip install -r requirements.txt

# Installer gunicorn (serveur WSGI pour production)
pip install gunicorn

# Installer les dépendances système pour MySQL
sudo apt install python3-dev default-libmysqlclient-dev build-essential -y
pip install mysqlclient
```

### 3.4. Configuration Django pour production

Créez `backend/suivi_depense/settings_production.py` :

```python
from .settings import *
import os

# Sécurité
DEBUG = False
SECRET_KEY = os.environ.get('SECRET_KEY')
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# Base de données
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',
        },
    }
}

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Sécurité supplémentaire
SECURE_SSL_REDIRECT = True  # Si vous avez HTTPS
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'django.log'),
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'ERROR',
            'propagate': True,
        },
    },
}
```

### 3.5. Migrations et collectstatic

```bash
cd ~/suivi_depense/backend
source venv/bin/activate

# Créer le dossier logs
mkdir -p logs

# Migrations
python manage.py migrate

# Collecter les fichiers statiques
python manage.py collectstatic --noinput

# Créer un superutilisateur
python manage.py createsuperuser
```

### 3.6. Configuration Gunicorn

Créez `backend/gunicorn_config.py` :

```python
bind = "127.0.0.1:8000"
workers = 3
worker_class = "sync"
timeout = 120
keepalive = 5
user = "suivi_app"
group = "suivi_app"
logfile = "/home/suivi_app/suivi_depense/backend/logs/gunicorn.log"
loglevel = "info"
```

Créez un service systemd : `/etc/systemd/system/suivi_depense.service`

```ini
[Unit]
Description=Suivi Depense Gunicorn daemon
After=network.target

[Service]
User=suivi_app
Group=suivi_app
WorkingDirectory=/home/suivi_app/suivi_depense/backend
Environment="PATH=/home/suivi_app/suivi_depense/backend/venv/bin"
ExecStart=/home/suivi_app/suivi_depense/backend/venv/bin/gunicorn \
    --config /home/suivi_app/suivi_depense/backend/gunicorn_config.py \
    suivi_depense.wsgi:application

[Install]
WantedBy=multi-user.target
```

Activer le service :
```bash
sudo systemctl daemon-reload
sudo systemctl enable suivi_depense
sudo systemctl start suivi_depense
sudo systemctl status suivi_depense
```

### 3.7. Configuration Nginx

Créez `/etc/nginx/sites-available/suivi_depense` :

```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    # Redirection HTTPS (si vous avez un certificat SSL)
    # return 301 https://$server_name$request_uri;

    # Pour commencer sans HTTPS, utilisez cette configuration :
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /home/suivi_app/suivi_depense/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /home/suivi_app/suivi_depense/backend/media/;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

Activer le site :
```bash
sudo ln -s /etc/nginx/sites-available/suivi_depense /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3.8. Configuration SSL avec Let's Encrypt (Recommandé)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

---

## 4. Déploiement sur Heroku

### 4.1. Prérequis

```bash
# Installer Heroku CLI
# Télécharger depuis https://devcenter.heroku.com/articles/heroku-cli

# Se connecter
heroku login
```

### 4.2. Créer les fichiers nécessaires

**`Procfile`** (à la racine du projet) :
```
web: cd backend && gunicorn suivi_depense.wsgi:application --bind 0.0.0.0:$PORT
```

**`runtime.txt`** (dans `backend/`) :
```
python-3.11.0
```

**`requirements.txt`** (mettre à jour dans `backend/`) :
```
# Ajouter à la fin
gunicorn
psycopg2-binary  # Pour PostgreSQL (Heroku utilise PostgreSQL)
```

### 4.3. Déployer

```bash
# Créer l'app Heroku
heroku create suivi-depense-csig

# Ajouter le buildpack Python
heroku buildpacks:add heroku/python

# Configurer les variables d'environnement
heroku config:set SECRET_KEY="votre-secret-key"
heroku config:set DEBUG=False
heroku config:set ALLOWED_HOSTS="suivi-depense-csig.herokuapp.com"

# Ajouter la base de données PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Déployer
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a suivi-depense-csig
git push heroku main

# Migrations
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
heroku run python manage.py collectstatic --noinput
```

---

## 5. Déploiement sur PythonAnywhere

### 5.1. Créer un compte

1. Allez sur https://www.pythonanywhere.com
2. Créez un compte gratuit (ou payant)

### 5.2. Uploader le code

1. Ouvrez un Bash console
2. Clonez votre repo ou uploadez les fichiers

### 5.3. Configuration

1. **Web tab** → Créez une nouvelle web app
2. **Files tab** → Modifiez le fichier WSGI
3. **Tasks tab** → Créez une tâche planifiée si nécessaire

### 5.4. Configuration WSGI

Remplacez le contenu du fichier WSGI par :

```python
import sys
import os

path = '/home/votre_username/suivi_depense/backend'
if path not in sys.path:
    sys.path.insert(0, path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'suivi_depense.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

---

## 6. Configuration de production

### 6.1. Variables d'environnement critiques

- `SECRET_KEY` : Doit être unique et secret
- `DEBUG=False` : Toujours False en production
- `ALLOWED_HOSTS` : Liste des domaines autorisés
- `DATABASE_URL` : URL de connexion à la base de données

### 6.2. Sécurité Django

Dans `settings.py` ou `settings_production.py` :

```python
# Désactiver DEBUG
DEBUG = False

# HTTPS (si disponible)
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Headers de sécurité
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
```

### 6.3. Backup de la base de données

Créez un script de backup : `backend/scripts/backup.sh`

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/suivi_app/backups"
mkdir -p $BACKUP_DIR

mysqldump -u suivi_user -p'votre_mot_de_passe' suivi_depense > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# Garder seulement les 30 derniers backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

Ajoutez au crontab :
```bash
0 2 * * * /home/suivi_app/suivi_depense/backend/scripts/backup.sh
```

---

## 7. Sécurité

### ✅ Checklist de sécurité

- [ ] `DEBUG=False` en production
- [ ] `SECRET_KEY` unique et secret
- [ ] HTTPS activé (certificat SSL)
- [ ] `ALLOWED_HOSTS` correctement configuré
- [ ] Mots de passe de base de données forts
- [ ] Firewall configuré (ports 80, 443 uniquement)
- [ ] Mises à jour système régulières
- [ ] Backups automatiques
- [ ] Logs surveillés

### 🔒 Recommandations supplémentaires

1. **Changer les mots de passe par défaut**
2. **Utiliser des clés SSH** au lieu de mots de passe
3. **Configurer un pare-feu** (UFW sur Ubuntu)
4. **Surveiller les logs** régulièrement
5. **Mettre à jour Django** et les dépendances

---

## 📞 Support

En cas de problème :
1. Vérifiez les logs : `sudo journalctl -u suivi_depense -f`
2. Vérifiez les logs Nginx : `sudo tail -f /var/log/nginx/error.log`
3. Vérifiez les logs Django : `tail -f ~/suivi_depense/backend/logs/django.log`

---

## 🎯 Prochaines étapes

1. Choisir votre option de déploiement
2. Configurer le domaine DNS
3. Obtenir un certificat SSL (Let's Encrypt)
4. Configurer les backups automatiques
5. Mettre en place la surveillance

Bon déploiement ! 🚀


