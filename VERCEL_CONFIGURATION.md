# 🔧 Configuration Vercel pour le Projet Suivi des Dépenses

## Problème : Erreur de connexion après déploiement

Si vous voyez une erreur "Erreur de connexion" après avoir déployé sur Vercel, c'est que la variable d'environnement `VITE_API_URL` n'est pas configurée.

## ✅ Solution : Configurer la variable d'environnement

### Étape 1 : Accéder aux paramètres Vercel

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous
2. Sélectionnez votre projet `Suividepene`
3. Allez dans **Settings** (Paramètres)
4. Cliquez sur **Environment Variables** (Variables d'environnement)

### Étape 2 : Ajouter la variable d'environnement

Ajoutez la variable suivante :

- **Name (Nom)** : `VITE_API_URL`
- **Value (Valeur)** : L'URL de votre backend Django
  - Si vous utilisez PythonAnywhere : `https://bella5768.pythonanywhere.com`
  - Si vous utilisez un autre hébergeur : `https://votre-domaine.com`
  - ⚠️ **IMPORTANT** : Ne mettez PAS `/api` à la fin, juste l'URL de base

**Exemple :**
```
VITE_API_URL = https://bella5768.pythonanywhere.com
```

### Étape 3 : Sélectionner les environnements

Assurez-vous que la variable est activée pour :
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development** (optionnel)

### Étape 4 : Redéployer

1. Après avoir ajouté la variable, allez dans l'onglet **Deployments**
2. Cliquez sur les **3 points** (⋯) du dernier déploiement
3. Sélectionnez **Redeploy**
4. Ou faites un nouveau push vers GitHub pour déclencher un nouveau déploiement

## 🔍 Vérification

Après le redéploiement, l'application devrait se connecter correctement au backend.

Pour vérifier que la variable est bien chargée :
1. Ouvrez la console du navigateur (F12)
2. Vous devriez voir un log : `🔧 Configuration API:` avec l'URL de votre backend

## 📝 Notes importantes

- La variable doit commencer par `VITE_` pour être accessible dans le code Vite
- L'URL ne doit pas se terminer par `/api` car le code ajoute automatiquement `/api/` aux endpoints
- Si vous changez l'URL du backend, mettez à jour cette variable et redéployez

## 🚨 Si ça ne fonctionne toujours pas

1. Vérifiez que votre backend Django est accessible publiquement
2. Vérifiez que CORS est configuré sur le backend pour accepter les requêtes depuis Vercel
3. Vérifiez les logs de déploiement Vercel pour voir s'il y a des erreurs
4. Vérifiez la console du navigateur pour voir les erreurs exactes

## 🔗 URLs utiles

- Dashboard Vercel : https://vercel.com/dashboard
- Documentation Vercel : https://vercel.com/docs
- Votre projet : https://suividepenecsig.vercel.app

