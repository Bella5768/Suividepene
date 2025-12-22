# 🚀 Fix Rapide : Erreur Vercel NOT_FOUND

## ✅ Ce qui a été fait

J'ai créé les fichiers de configuration nécessaires pour résoudre l'erreur NOT_FOUND :

1. ✅ **`vercel.json`** - Configuration principale Vercel
2. ✅ **`frontend/vercel.json`** - Configuration spécifique frontend
3. ✅ **`frontend/src/config/api.js`** - Configuration API pour production
4. ✅ **`VERCEL_DEPLOYMENT_GUIDE.md`** - Guide complet

## 🎯 Solution en 3 Étapes

### Étape 1 : Déployer le Backend Django

**Option A : Railway (Recommandé - Simple)**
1. Créer un compte sur [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Sélectionner votre repo
4. Railway détectera automatiquement Django
5. Configurer les variables d'environnement :
   - `SECRET_KEY`
   - `DEBUG=False`
   - `ALLOWED_HOSTS=votre-app.railway.app`
   - `DB_NAME`, `DB_USER`, `DB_PASSWORD` (Railway crée une DB automatiquement)

**Option B : Render**
1. Créer un compte sur [render.com](https://render.com)
2. New → Web Service
3. Connecter GitHub repo
4. Build Command : `cd backend && pip install -r requirements.txt`
5. Start Command : `cd backend && gunicorn suivi_depense.wsgi:application`

### Étape 2 : Configurer CORS sur le Backend

Dans `backend/suivi_depense/settings.py`, ajouter l'URL Vercel :

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3001",
    "http://localhost:3000",
    "https://votre-app.vercel.app",  # ← Ajouter votre URL Vercel
]
```

### Étape 3 : Déployer le Frontend sur Vercel

1. **Installer Vercel CLI** (si pas déjà fait) :
   ```bash
   npm install -g vercel
   ```

2. **Se connecter à Vercel** :
   ```bash
   vercel login
   ```

3. **Configurer les variables d'environnement** :
   ```bash
   vercel env add VITE_API_URL
   # Entrer : https://votre-backend.railway.app (ou votre URL Render)
   ```

4. **Déployer** :
   ```bash
   cd frontend
   vercel --prod
   ```

   OU via l'interface Vercel :
   - Importer le projet depuis GitHub
   - Root Directory : `frontend`
   - Build Command : `npm run build`
   - Output Directory : `dist`
   - Environment Variables : `VITE_API_URL=https://votre-backend-url.com`

## 🔍 Vérification

Après le déploiement :
1. ✅ Vérifier que le frontend charge sur Vercel
2. ✅ Vérifier que les appels API fonctionnent (ouvrir la console navigateur)
3. ✅ Tester la connexion utilisateur

## ⚠️ Important

- **Le backend Django DOIT être déployé AVANT le frontend**
- **L'URL du backend doit être accessible publiquement**
- **CORS doit être configuré pour accepter Vercel**

## 🆘 Si ça ne marche toujours pas

1. **Vérifier les logs Vercel** : Dashboard → Deployments → Logs
2. **Vérifier les variables d'environnement** : Settings → Environment Variables
3. **Tester le build local** : `cd frontend && npm run build`
4. **Vérifier la console navigateur** pour les erreurs CORS ou API

## 📚 Documentation Complète

Consultez **`VERCEL_DEPLOYMENT_GUIDE.md`** pour :
- Explication détaillée de l'erreur
- Alternatives de déploiement
- Concepts serverless vs. serveur persistant
- Configuration avancée

