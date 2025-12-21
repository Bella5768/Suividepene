# Déploiement sur PythonAnywhere

**Statut:** Guide complet pour déployer sur PythonAnywhere  
**Date:** 2025-12-21

---

## 🎯 Problème Actuel

Le backend Django fonctionne, mais le frontend React n'est pas construit et déployé. Vous voyez une page d'accueil Django au lieu de l'application React.

---

## 📋 Étapes de Déploiement

### Étape 1: Construire le Frontend Localement

```powershell
cd C:\wamp64\www\Suivi_depense\frontend

# Installer les dépendances
npm install

# Construire pour la production
npm run build
```

**Résultat:** Un dossier `dist/` sera créé avec les fichiers optimisés.

### Étape 2: Copier les Fichiers Construits

Les fichiers construits doivent être copiés vers Django:

```powershell
# Copier le contenu de dist vers le dossier static de Django
Copy-Item -Path "C:\wamp64\www\Suivi_depense\frontend\dist\*" `
  -Destination "C:\wamp64\www\Suivi_depense\backend\depenses\static\depenses\" `
  -Recurse -Force
```

### Étape 3: Configurer Django pour Servir le Frontend

Vérifiez que `settings.py` a:

```python
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'depenses' / 'static'
```

### Étape 4: Collecter les Fichiers Statiques

```powershell
cd C:\wamp64\www\Suivi_depense\backend
python manage.py collectstatic --noinput
```

### Étape 5: Déployer sur PythonAnywhere

#### 5.1 Préparer le Code

```bash
# Sur PythonAnywhere, clonez ou mettez à jour le repo
cd /home/bella5768/Suividepene
git pull origin main
```

#### 5.2 Installer les Dépendances

```bash
# Activez l'environnement virtuel
source /home/bella5768/.virtualenvs/suividepene/bin/activate

# Installez les dépendances
pip install -r backend/requirements.txt
```

#### 5.3 Exécuter les Migrations

```bash
cd /home/bella5768/Suividepene/backend
python manage.py migrate
```

#### 5.4 Collecter les Fichiers Statiques

```bash
python manage.py collectstatic --noinput
```

#### 5.5 Recharger l'Application Web

1. Allez sur https://www.pythonanywhere.com/user/bella5768/webapps/
2. Cliquez sur votre application web
3. Cliquez sur le bouton **"Reload"** en haut

---

## 🔧 Configuration PythonAnywhere

### Web App Configuration

**URL:** https://bella5768.pythonanywhere.com

**WSGI Configuration:**
```python
import os
import sys

path = '/home/bella5768/Suividepene/backend'
if path not in sys.path:
    sys.path.append(path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'suivi_depense.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

### Static Files Configuration

| URL | Directory |
|-----|-----------|
| `/static/` | `/home/bella5768/Suividepene/backend/depenses/static/` |
| `/media/` | `/home/bella5768/Suividepene/backend/media/` |

### Environment Variables

Configurez dans PythonAnywhere:

```
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=bella5768.pythonanywhere.com
CORS_ALLOWED_ORIGINS=https://bella5768.pythonanywhere.com
DB_ENGINE=sqlite3
DB_NAME=/home/bella5768/Suividepene/backend/db.sqlite3
```

---

## 🚀 Processus Complet de Déploiement

### Localement (sur votre ordinateur)

```powershell
# 1. Construire le frontend
cd frontend
npm install
npm run build

# 2. Copier vers Django
Copy-Item -Path "dist\*" -Destination "..\backend\depenses\static\depenses\" -Recurse -Force

# 3. Collecter les statiques
cd ..\backend
python manage.py collectstatic --noinput

# 4. Tester localement
python manage.py runserver

# 5. Pousser vers GitHub
git add -A
git commit -m "Frontend build for production"
git push origin main
```

### Sur PythonAnywhere (via Bash Console)

```bash
# 1. Mettre à jour le code
cd /home/bella5768/Suividepene
git pull origin main

# 2. Installer les dépendances
source /home/bella5768/.virtualenvs/suividepene/bin/activate
pip install -r backend/requirements.txt

# 3. Exécuter les migrations
cd backend
python manage.py migrate

# 4. Collecter les statiques
python manage.py collectstatic --noinput

# 5. Recharger l'application web
# (Allez sur le Dashboard et cliquez "Reload")
```

---

## ✅ Vérification du Déploiement

### Vérifier que le Frontend est Servi

```bash
# Sur PythonAnywhere
curl https://bella5768.pythonanywhere.com/
# Devrait retourner le HTML du frontend React
```

### Vérifier que l'API Fonctionne

```bash
curl https://bella5768.pythonanywhere.com/api/
# Devrait retourner du JSON
```

### Vérifier les Fichiers Statiques

```bash
curl https://bella5768.pythonanywhere.com/static/depenses/index.html
# Devrait retourner le fichier HTML
```

---

## 🐛 Dépannage

### Erreur: "Module not found"

```bash
# Réinstallez les dépendances
pip install --upgrade -r backend/requirements.txt
```

### Erreur: "Static files not found"

```bash
# Recollectez les fichiers statiques
python manage.py collectstatic --noinput --clear
```

### Erreur: "Database locked"

```bash
# Supprimez et recréez la base de données SQLite
rm backend/db.sqlite3
python manage.py migrate
```

### Erreur: "CORS error"

Vérifiez dans `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'https://bella5768.pythonanywhere.com',
    'http://bella5768.pythonanywhere.com',
]
```

---

## 📊 Structure des Fichiers sur PythonAnywhere

```
/home/bella5768/Suividepene/
├── backend/
│   ├── manage.py
│   ├── db.sqlite3
│   ├── requirements.txt
│   ├── suivi_depense/
│   │   ├── settings.py
│   │   ├── wsgi.py
│   │   └── urls.py
│   └── depenses/
│       ├── static/
│       │   └── depenses/
│       │       ├── index.html
│       │       ├── js/
│       │       └── css/
│       └── media/
├── frontend/
│   ├── src/
│   ├── dist/
│   └── package.json
└── .git/
```

---

## 🔐 Variables d'Environnement PythonAnywhere

Créez un fichier `.env` dans `/home/bella5768/Suividepene/backend/`:

```
DEBUG=False
SECRET_KEY=your-very-secure-secret-key-here
ALLOWED_HOSTS=bella5768.pythonanywhere.com,www.bella5768.pythonanywhere.com
CORS_ALLOWED_ORIGINS=https://bella5768.pythonanywhere.com
USE_SQLITE=True
```

Puis chargez-le dans `settings.py`:
```python
from decouple import config
DEBUG = config('DEBUG', default=False, cast=bool)
```

---

## 📝 Checklist de Déploiement

- [ ] Frontend construit localement (`npm run build`)
- [ ] Fichiers statiques copiés vers Django
- [ ] Fichiers statiques collectés (`collectstatic`)
- [ ] Code poussé vers GitHub
- [ ] Code mis à jour sur PythonAnywhere (`git pull`)
- [ ] Dépendances installées sur PythonAnywhere
- [ ] Migrations exécutées
- [ ] Fichiers statiques collectés sur PythonAnywhere
- [ ] Application web rechargée
- [ ] Frontend accessible à https://bella5768.pythonanywhere.com/
- [ ] API accessible à https://bella5768.pythonanywhere.com/api/

---

## 🎯 Prochaines Étapes

1. **Construire le frontend** localement
2. **Copier les fichiers** vers Django
3. **Tester localement** que tout fonctionne
4. **Pousser vers GitHub**
5. **Déployer sur PythonAnywhere**
6. **Vérifier que tout fonctionne**

---

## 📞 Support

Si vous avez des problèmes:
1. Vérifiez les logs PythonAnywhere (onglet "Log files")
2. Vérifiez la console d'erreur du navigateur (F12)
3. Vérifiez que les fichiers statiques sont présents
4. Vérifiez que l'API répond correctement

---

**Bon déploiement!** 🚀
