# Déploiement sur PythonAnywhere

## Étapes de déploiement pour bella5768.pythonanywhere.com

### 1. Cloner le projet (Console Bash)

```bash
cd ~
git clone https://github.com/Bella5768/Suividepene.git
```

### 2. Créer le virtualenv

```bash
mkvirtualenv suividepene --python=/usr/bin/python3.12
```

### 3. Installer les dépendances

```bash
cd ~/Suividepene/backend
pip install -r requirements.txt
```

### 4. Configurer le fichier .env

```bash
cd ~/Suividepene/backend
nano .env
```

Contenu du fichier .env :
```
DEBUG=False
USE_SQLITE=True
SECRET_KEY=votre-cle-secrete-tres-longue-et-aleatoire-minimum-50-caracteres
ALLOWED_HOSTS=bella5768.pythonanywhere.com,localhost,127.0.0.1
```

### 5. Migrations et collectstatic

```bash
cd ~/Suividepene/backend
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### 6. Configurer le fichier WSGI

Aller dans **Web** > Cliquer sur le lien du fichier WSGI et remplacer le contenu par :

```python
import os
import sys

# Chemin vers le projet
path = '/home/bella5768/Suividepene/backend'
if path not in sys.path:
    sys.path.append(path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'suivi_depense.settings'
os.environ['DEBUG'] = 'False'
os.environ['USE_SQLITE'] = 'True'
os.environ['SECRET_KEY'] = 'votre-cle-secrete-tres-longue-et-aleatoire'
os.environ['ALLOWED_HOSTS'] = 'bella5768.pythonanywhere.com,localhost,127.0.0.1'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

### 7. Configuration Static Files (Web tab)

| URL | Directory |
|-----|-----------|
| /static/ | /home/bella5768/Suividepene/backend/staticfiles |
| /media/ | /home/bella5768/Suividepene/backend/media |

### 8. Virtualenv path

```
/home/bella5768/.virtualenvs/suividepene
```

### 9. Reload

Cliquer sur le bouton **Reload** en haut de la page Web.

---

## Mise à jour du code

```bash
cd ~/Suividepene
git pull origin main
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
```

Puis **Reload** dans l'onglet Web.

---

## Dépannage

### Voir les logs d'erreur
- Error log: `/var/log/bella5768.pythonanywhere.com.error.log`

### Commandes utiles
```bash
workon suividepene  # Activer le virtualenv
cd ~/Suividepene/backend
python manage.py shell  # Console Django
python manage.py check  # Vérifier la configuration
```
