# 🚀 Configuration pour PythonAnywhere

## 📋 Fichiers .env à créer

### 1. Créer `frontend/.env.production`

Créez ce fichier dans le dossier `frontend/` :

```env
# Configuration pour la production (PythonAnywhere)
# Les variables d'environnement Vite doivent commencer par VITE_
VITE_API_URL=https://yourusername.pythonanywhere.com
```

**Important :** Remplacez `yourusername` par votre nom d'utilisateur PythonAnywhere.

### 2. Créer `frontend/.env.local` (optionnel, pour développement)

```env
# Configuration pour le développement local
# Ce fichier est ignoré par Git
# En développement, laisser vide pour utiliser le proxy Vite (localhost:8000)
VITE_API_URL=
```

### 3. Créer `frontend/.env.example` (template)

```env
# Template des variables d'environnement
# Copiez ce fichier en .env.local pour le développement local
# ou .env.production pour la production

# URL de l'API backend
# En développement : laisser vide (utilise le proxy Vite)
# En production : URL complète de votre backend
VITE_API_URL=

# Exemples :
# Développement local (proxy Vite) : VITE_API_URL=
# PythonAnywhere : VITE_API_URL=https://yourusername.pythonanywhere.com
# Railway : VITE_API_URL=https://your-app.railway.app
# Render : VITE_API_URL=https://your-app.onrender.com
```

## ⚠️ Note Importante : VITE_ vs REACT_APP_

**Votre projet utilise Vite, pas Create React App !**

- ✅ **Correct** : `VITE_API_URL` (pour Vite)
- ❌ **Incorrect** : `REACT_APP_API_URL` (pour Create React App)

Vite ne charge que les variables qui commencent par `VITE_`.

## 🔧 Configuration PythonAnywhere

### Étape 1 : Déployer le Backend Django

1. **Créer un compte** sur [pythonanywhere.com](https://www.pythonanywhere.com)

2. **Uploader votre code** :
   - Via Git (recommandé) : `git clone https://github.com/votre-repo.git`
   - Ou via l'interface Files

3. **Configurer la Web App** :
   - Allez dans **Web** tab
   - Cliquez sur **Add a new web app**
   - Choisissez **Django**
   - Sélectionnez la version Python (3.10+)
   - Spécifiez le chemin : `/home/yourusername/suivi_depense/backend`

4. **Configurer WSGI** :
   - Allez dans **Web** → **WSGI configuration file**
   - Remplacez le contenu par :

```python
import sys
import os

# Ajouter le chemin du projet
path = '/home/yourusername/suivi_depense/backend'
if path not in sys.path:
    sys.path.insert(0, path)

# Configuration Django
os.environ['DJANGO_SETTINGS_MODULE'] = 'suivi_depense.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

5. **Configurer les variables d'environnement** :
   - Créez un fichier `/home/yourusername/.env` ou configurez dans WSGI :

```python
import os
os.environ['SECRET_KEY'] = 'votre-secret-key'
os.environ['DEBUG'] = 'False'
os.environ['ALLOWED_HOSTS'] = 'yourusername.pythonanywhere.com'
os.environ['DB_NAME'] = 'yourusername$suivi_depense'
os.environ['DB_USER'] = 'yourusername'
os.environ['DB_PASSWORD'] = 'votre-mot-de-passe'
os.environ['DB_HOST'] = 'yourusername.mysql.pythonanywhere-services.com'
```

6. **Configurer la base de données MySQL** :
   - Allez dans **Databases** tab
   - Créez une base de données MySQL
   - Notez le nom (format : `yourusername$suivi_depense`)

7. **Installer les dépendances** :
   - Ouvrez une **Bash console**
   - `cd ~/suivi_depense/backend`
   - `pip3.10 install --user -r requirements.txt`

8. **Appliquer les migrations** :
   ```bash
   python3.10 manage.py migrate
   python3.10 manage.py collectstatic --noinput
   python3.10 manage.py createsuperuser
   ```

9. **Configurer CORS** :
   Dans `backend/suivi_depense/settings.py` :

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3001",
    "http://localhost:3000",
    "https://yourusername.pythonanywhere.com",  # Votre backend
    "https://votre-frontend.vercel.app",  # Si vous déployez le frontend sur Vercel
]
```

10. **Reload la Web App** :
    - Cliquez sur le bouton **Reload** dans l'onglet Web

### Étape 2 : Déployer le Frontend React

#### Option A : Sur Vercel (Recommandé)

1. **Créer le fichier `.env.production`** dans `frontend/` :
   ```env
   VITE_API_URL=https://yourusername.pythonanywhere.com
   ```

2. **Build le frontend** :
   ```bash
   cd frontend
   npm install
   npm run build
   ```

3. **Déployer sur Vercel** :
   - Connectez votre repo GitHub à Vercel
   - Root Directory : `frontend`
   - Build Command : `npm run build`
   - Output Directory : `dist`
   - Environment Variables :
     - `VITE_API_URL` = `https://yourusername.pythonanywhere.com`

#### Option B : Sur PythonAnywhere (Frontend statique)

1. **Build le frontend** :
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Uploader les fichiers** :
   - Copiez le contenu de `frontend/dist/` vers `/home/yourusername/mysite/static/`

3. **Configurer Nginx** (si nécessaire) :
   - PythonAnywhere sert automatiquement les fichiers statiques

## 🔍 Vérification

### Tester le Backend

1. Accédez à : `https://yourusername.pythonanywhere.com/admin/`
2. Vous devriez voir l'interface Django Admin

### Tester l'API

1. Accédez à : `https://yourusername.pythonanywhere.com/api/`
2. Vous devriez voir la réponse de l'API

### Tester le Frontend

1. Si sur Vercel : `https://votre-app.vercel.app`
2. Si sur PythonAnywhere : `https://yourusername.pythonanywhere.com`
3. Vérifiez la console du navigateur pour les erreurs

## 🐛 Dépannage

### Erreur : "Module not found"
- Vérifiez que vous avez installé les dépendances : `pip3.10 install --user -r requirements.txt`

### Erreur : "Database connection failed"
- Vérifiez les credentials de la base de données
- Le nom de la DB doit être : `yourusername$suivi_depense`

### Erreur CORS
- Vérifiez que l'URL du frontend est dans `CORS_ALLOWED_ORIGINS`
- Vérifiez que CORS est installé : `pip3.10 install --user django-cors-headers`

### Frontend ne charge pas l'API
- Vérifiez que `VITE_API_URL` est bien configuré
- Vérifiez la console du navigateur pour les erreurs
- Vérifiez que le backend est accessible publiquement

## 📝 Checklist

- [ ] Compte PythonAnywhere créé
- [ ] Code uploadé sur PythonAnywhere
- [ ] Web App Django configurée
- [ ] WSGI configuré correctement
- [ ] Base de données MySQL créée
- [ ] Variables d'environnement configurées
- [ ] Dépendances installées
- [ ] Migrations appliquées
- [ ] Superutilisateur créé
- [ ] CORS configuré
- [ ] Backend accessible : `https://yourusername.pythonanywhere.com`
- [ ] Frontend `.env.production` créé avec `VITE_API_URL`
- [ ] Frontend déployé (Vercel ou PythonAnywhere)
- [ ] Application fonctionnelle

## 🔗 Ressources

- [Documentation PythonAnywhere](https://help.pythonanywhere.com/)
- [Déployer Django sur PythonAnywhere](https://help.pythonanywhere.com/pages/DeployExistingDjangoProject/)
- [Variables d'environnement Vite](https://vitejs.dev/guide/env-and-mode.html)

---

**Note :** N'oubliez pas de remplacer `yourusername` par votre vrai nom d'utilisateur PythonAnywhere partout dans la configuration !

