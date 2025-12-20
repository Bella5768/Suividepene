# ⚡ Déploiement Rapide - Guide Express

## 🎯 Déploiement sur serveur Linux (Ubuntu/Debian)

### Étape 1 : Préparer le serveur (5 min)

```bash
# Mettre à jour
sudo apt update && sudo apt upgrade -y

# Installer les dépendances
sudo apt install -y python3 python3-pip python3-venv mysql-server nginx git nodejs npm

# Configurer MySQL
sudo mysql_secure_installation
```

### Étape 2 : Créer la base de données (2 min)

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE suivi_depense CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'suivi_user'@'localhost' IDENTIFIED BY 'VOTRE_MOT_DE_PASSE_SECURISE';
GRANT ALL PRIVILEGES ON suivi_depense.* TO 'suivi_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Étape 3 : Déployer le code (5 min)

```bash
# Créer l'utilisateur
sudo adduser --disabled-password --gecos "" suivi_app
sudo su - suivi_app

# Cloner ou transférer le projet
cd ~
# Option A: Git
git clone https://github.com/votre-repo/suivi_depense.git
# Option B: SCP depuis votre machine locale
# scp -r Suivi_depense suivi_app@VOTRE_SERVEUR:/home/suivi_app/

cd suivi_depense/backend

# Créer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Installer les dépendances
pip install --upgrade pip
pip install -r requirements.txt gunicorn mysqlclient
```

### Étape 4 : Configuration (3 min)

```bash
# Créer le fichier .env
nano .env
```

Contenu du `.env` :
```env
SECRET_KEY=votre-cle-secrete-generee
DEBUG=False
ALLOWED_HOSTS=votre-domaine.com,IP_DU_SERVEUR
DB_NAME=suivi_depense
DB_USER=suivi_user
DB_PASSWORD=VOTRE_MOT_DE_PASSE_DB
DB_HOST=localhost
DB_PORT=3306
EMAIL_HOST_USER=support@csig.edu.gn
EMAIL_HOST_PASSWORD=gnnthnprwdlklnfd
```

### Étape 5 : Build frontend (2 min)

```bash
cd ~/suivi_depense/frontend
npm install
npm run build
```

### Étape 6 : Configuration Django (3 min)

```bash
cd ~/suivi_depense/backend
source venv/bin/activate

# Créer les dossiers nécessaires
mkdir -p logs staticfiles media/factures

# Migrations
python manage.py migrate

# Collectstatic
python manage.py collectstatic --noinput

# Créer superutilisateur
python manage.py createsuperuser
```

### Étape 7 : Service Gunicorn (3 min)

```bash
sudo nano /etc/systemd/system/suivi_depense.service
```

Contenu :
```ini
[Unit]
Description=Suivi Depense Gunicorn
After=network.target

[Service]
User=suivi_app
Group=suivi_app
WorkingDirectory=/home/suivi_app/suivi_depense/backend
Environment="PATH=/home/suivi_app/suivi_depense/backend/venv/bin"
Environment="DJANGO_SETTINGS_MODULE=suivi_depense.settings_production"
ExecStart=/home/suivi_app/suivi_depense/backend/venv/bin/gunicorn \
    --config /home/suivi_app/suivi_depense/backend/gunicorn_config.py \
    suivi_depense.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable suivi_depense
sudo systemctl start suivi_depense
sudo systemctl status suivi_depense
```

### Étape 8 : Configuration Nginx (3 min)

```bash
sudo nano /etc/nginx/sites-available/suivi_depense
```

Contenu :
```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /home/suivi_app/suivi_depense/backend/staticfiles/;
    }

    location /media/ {
        alias /home/suivi_app/suivi_depense/backend/media/;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/suivi_depense /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Étape 9 : SSL (Optionnel mais recommandé) (5 min)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

## ✅ Vérification

1. Visitez `http://votre-domaine.com` ou `http://IP_DU_SERVEUR`
2. Vérifiez les logs : `sudo journalctl -u suivi_depense -f`
3. Testez la connexion : `http://votre-domaine.com/api/`

## 🔧 Commandes utiles

```bash
# Redémarrer le service
sudo systemctl restart suivi_depense

# Voir les logs
sudo journalctl -u suivi_depense -f

# Redémarrer Nginx
sudo systemctl restart nginx

# Mettre à jour le code
cd ~/suivi_depense
git pull  # ou transférer les nouveaux fichiers
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart suivi_depense
```

## 📝 Notes importantes

- Remplacez `votre-domaine.com` par votre vrai domaine
- Remplacez `VOTRE_MOT_DE_PASSE_SECURISE` par un mot de passe fort
- Générez une SECRET_KEY unique : `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
- Configurez votre DNS pour pointer vers l'IP du serveur

---

**Temps total estimé : ~30 minutes** ⏱️

