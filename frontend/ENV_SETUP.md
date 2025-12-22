# 📝 Configuration des Variables d'Environnement

## ⚠️ Important : Vite utilise VITE_ (pas REACT_APP_)

Votre projet utilise **Vite**, donc toutes les variables d'environnement doivent commencer par `VITE_`.

- ✅ **Correct** : `VITE_API_URL`
- ❌ **Incorrect** : `REACT_APP_API_URL` (pour Create React App)

## 📁 Fichiers à créer

### 1. `frontend/.env.production`

Créez ce fichier pour la production :

```env
# Configuration pour la production
# Remplacez yourusername par votre nom d'utilisateur PythonAnywhere
VITE_API_URL=https://yourusername.pythonanywhere.com
```

**Exemples selon la plateforme :**

```env
# PythonAnywhere
VITE_API_URL=https://yourusername.pythonanywhere.com

# Railway
VITE_API_URL=https://your-app.railway.app

# Render
VITE_API_URL=https://your-app.onrender.com

# VPS avec domaine
VITE_API_URL=https://api.votre-domaine.com
```

### 2. `frontend/.env.local` (optionnel)

Pour le développement local, créez ce fichier :

```env
# Configuration pour le développement local
# Laisser vide pour utiliser le proxy Vite (localhost:8000)
VITE_API_URL=
```

Le proxy Vite est configuré dans `vite.config.js` et redirige `/api` vers `http://localhost:8000`.

### 3. `frontend/.env.example` (template)

Créez ce fichier comme template (peut être versionné dans Git) :

```env
# Template des variables d'environnement
# Copiez ce fichier en .env.local pour le développement
# ou .env.production pour la production

VITE_API_URL=
```

## 🔧 Comment ça fonctionne

### Ordre de priorité des fichiers .env

Vite charge les fichiers dans cet ordre (le dernier écrase les précédents) :

1. `.env` (tous les environnements)
2. `.env.local` (tous les environnements, ignoré par Git)
3. `.env.[mode]` (ex: `.env.production`)
4. `.env.[mode].local` (ex: `.env.production.local`, ignoré par Git)

### Utilisation dans le code

Le fichier `frontend/src/config/api.js` utilise automatiquement `VITE_API_URL` :

```javascript
// En production
if (import.meta.env.PROD) {
  return import.meta.env.VITE_API_URL || 'https://votre-backend-url.com';
}

// En développement
return ''; // Utilise le proxy Vite
```

## 🚀 Déploiement

### Sur Vercel

1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez : `VITE_API_URL` = `https://yourusername.pythonanywhere.com`
3. Déployez : `vercel --prod`

### Sur PythonAnywhere

1. Créez `frontend/.env.production` avec `VITE_API_URL`
2. Build : `npm run build`
3. Les variables sont injectées lors du build

### Build local pour tester

```bash
cd frontend
# Créer .env.production avec VITE_API_URL
npm run build
npm run preview  # Pour tester le build
```

## 🔍 Vérification

Pour vérifier que les variables sont bien chargées :

1. **En développement** : Ouvrez la console du navigateur, vous verrez :
   ```
   🔧 Configuration API: {
     mode: "development",
     apiBaseUrl: "(proxy Vite)",
     ...
   }
   ```

2. **En production** : Vérifiez dans les DevTools → Network que les requêtes API pointent vers la bonne URL.

## 🐛 Dépannage

### Les variables ne sont pas chargées

1. Vérifiez que le nom commence par `VITE_`
2. Vérifiez que le fichier est dans `frontend/`
3. Redémarrez le serveur de développement
4. Pour la production, rebuild : `npm run build`

### Les requêtes API échouent

1. Vérifiez que `VITE_API_URL` est correcte (sans `/api` à la fin)
2. Vérifiez que le backend est accessible
3. Vérifiez CORS sur le backend
4. Vérifiez la console du navigateur pour les erreurs

## 📚 Documentation

- [Variables d'environnement Vite](https://vitejs.dev/guide/env-and-mode.html)
- [Configuration API](frontend/src/config/api.js)

