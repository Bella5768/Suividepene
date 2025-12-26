# 🔧 Dépannage : Erreur de connexion sur Vercel

## ❌ Erreur observée

L'erreur 405 "Méthode GET non autorisée" sur `/api/auth/token/` est **normale** si vous accédez directement à l'URL dans le navigateur. Cet endpoint nécessite une requête **POST** avec les credentials.

## ✅ Solutions

### 1. Configurer la variable d'environnement sur Vercel

**C'est la cause principale de l'erreur de connexion !**

1. Allez sur [vercel.com](https://vercel.com) → votre projet
2. **Settings** → **Environment Variables**
3. Ajoutez :
   ```
   Name: VITE_API_URL
   Value: https://bella5768.pythonanywhere.com
   ```
4. Cochez **Production** et **Preview**
5. **Redéployez** le projet

### 2. Vérifier que le backend est accessible

Testez dans votre navigateur :
- ✅ `https://bella5768.pythonanywhere.com/api/` → Devrait retourner une réponse JSON
- ❌ `https://bella5768.pythonanywhere.com/api/auth/token/` → Erreur 405 (normal, nécessite POST)

### 3. Vérifier CORS

Le backend doit autoriser les requêtes depuis Vercel. Vérifiez dans `backend/suivi_depense/settings.py` :

```python
CORS_ALLOWED_ORIGINS = [
    'https://suividepenecsig.vercel.app',  # Votre URL Vercel
    'https://bella5768.pythonanywhere.com',
    # ...
]
```

### 4. Tester l'authentification avec curl

Pour vérifier que l'endpoint fonctionne :

```bash
curl -X POST https://bella5768.pythonanywhere.com/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Cela devrait retourner :
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 5. Vérifier les logs Vercel

1. Allez dans **Deployments** sur Vercel
2. Cliquez sur le dernier déploiement
3. Vérifiez les **Build Logs** pour voir s'il y a des erreurs
4. Vérifiez les **Function Logs** pour voir les erreurs runtime

### 6. Vérifier la console du navigateur

1. Ouvrez votre site Vercel
2. Appuyez sur **F12** pour ouvrir les outils développeur
3. Allez dans l'onglet **Console**
4. Cherchez les erreurs de connexion
5. Allez dans l'onglet **Network** pour voir les requêtes échouées

## 🔍 Diagnostic

### Si vous voyez "Erreur de connexion" dans l'interface :

1. **Vérifiez la variable d'environnement** `VITE_API_URL` sur Vercel
2. **Vérifiez que le backend est en ligne** : `https://bella5768.pythonanywhere.com`
3. **Vérifiez CORS** dans les settings Django
4. **Redéployez** après avoir ajouté la variable

### Si l'authentification échoue :

1. Vérifiez que les credentials sont corrects
2. Vérifiez que l'utilisateur existe dans la base de données
3. Vérifiez les logs du backend Django

## 📝 Checklist

- [ ] Variable `VITE_API_URL` configurée sur Vercel
- [ ] Backend accessible publiquement
- [ ] CORS configuré pour autoriser Vercel
- [ ] Redéploiement effectué après configuration
- [ ] Console du navigateur vérifiée
- [ ] Logs Vercel vérifiés

## 🚨 Erreur 405 spécifique

L'erreur 405 sur `/api/auth/token/` quand vous accédez directement à l'URL est **normale**. Cet endpoint :
- ✅ Accepte **POST** avec `{"username": "...", "password": "..."}`
- ❌ N'accepte **PAS GET** (d'où l'erreur 405)

Le frontend React doit faire un POST, pas un GET.

## 📞 Support

Si le problème persiste :
1. Vérifiez les logs Vercel
2. Vérifiez les logs PythonAnywhere
3. Vérifiez la console du navigateur
4. Partagez les messages d'erreur exacts

