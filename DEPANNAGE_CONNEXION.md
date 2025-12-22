# 🔧 Dépannage - Problème de Connexion

## ✅ Vérifications à faire

### 1. Vérifier que les serveurs sont en cours d'exécution

**Backend Django (port 8000) :**
- Ouvrez une fenêtre de commande
- Allez dans `C:\wamp64\www\Suivi_depense\backend`
- Activez l'environnement virtuel : `venv\Scripts\activate.bat`
- Lancez le serveur : `python manage.py runserver`
- Vous devriez voir : "Starting development server at http://127.0.0.1:8000/"

**Frontend React (port 3001) :**
- Ouvrez une autre fenêtre de commande
- Allez dans `C:\wamp64\www\Suivi_depense\frontend`
- Lancez : `..\nodejs-portable\npm.cmd run dev`
- Ou utilisez : `start_dev.bat`
- Vous devriez voir : "Local: http://localhost:3001/"

### 2. Vérifier les ports

Ouvrez PowerShell et exécutez :
```powershell
netstat -ano | findstr ":8000 :3001"
```

Vous devriez voir :
- `0.0.0.0:8000` pour le backend
- `0.0.0.0:3001` pour le frontend

### 3. Tester la connexion au backend

Dans votre navigateur, ouvrez : http://localhost:8000/api/

Vous devriez voir une page avec les routes API disponibles.

### 4. Identifiants par défaut

- **Username** : `admin`
- **Password** : `admin123` (ou le mot de passe que vous avez défini)

### 5. Créer un superutilisateur si nécessaire

Si vous n'avez pas de compte, créez-en un :

```bash
cd backend
venv\Scripts\activate
python manage.py createsuperuser
```

## 🚀 Relancer les serveurs

### Option 1 : Utiliser le script batch

```bash
cd C:\wamp64\www\Suivi_depense
.\start_all.bat
```

### Option 2 : Manuellement

**Terminal 1 - Backend :**
```bash
cd C:\wamp64\www\Suivi_depense\backend
venv\Scripts\activate
python manage.py runserver
```

**Terminal 2 - Frontend :**
```bash
cd C:\wamp64\www\Suivi_depense\frontend
..\nodejs-portable\npm.cmd run dev
```

## 🔍 Erreurs courantes

### "Network Error" ou "Connection refused"
- Le backend Django n'est pas démarré
- Vérifiez la fenêtre de commande du backend pour les erreurs

### "401 Unauthorized"
- Votre token JWT a expiré
- Déconnectez-vous et reconnectez-vous

### "500 Internal Server Error"
- Vérifiez les logs dans la fenêtre de commande du backend
- Vérifiez que la base de données est accessible

### Le frontend charge mais ne peut pas se connecter
- Vérifiez que le proxy dans `vite.config.js` pointe vers `http://localhost:8000`
- Vérifiez que le backend répond sur le port 8000

## 📞 Test rapide

1. Ouvrez http://localhost:8000/api/ dans votre navigateur
2. Si vous voyez les routes API → Backend OK ✅
3. Ouvrez http://localhost:3001 dans votre navigateur
4. Si vous voyez la page de connexion → Frontend OK ✅
5. Connectez-vous avec `admin` / `admin123`


