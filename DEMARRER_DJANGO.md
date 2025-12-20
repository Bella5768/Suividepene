# 🚀 Comment Démarrer le Serveur Django

## Méthode 1 : Script Automatique (Recommandé)

Double-cliquez sur le fichier :
```
backend\start_server_simple.bat
```

Le serveur démarrera automatiquement sur **http://localhost:8000**

---

## Méthode 2 : Ligne de Commande PowerShell

### Étape 1 : Ouvrir PowerShell
Ouvrez PowerShell dans le dossier du projet : `C:\wamp64\www\Suivi_depense`

### Étape 2 : Aller dans le dossier backend
```powershell
cd backend
```

### Étape 3 : Activer l'environnement virtuel
```powershell
.\venv\Scripts\Activate.ps1
```

**OU** si vous avez une erreur de politique d'exécution :
```powershell
.\venv\Scripts\python.exe manage.py runserver
```

### Étape 4 : Démarrer le serveur
```powershell
python manage.py runserver
```

---

## Méthode 3 : Commande Directe (Sans Activation)

Depuis le dossier racine du projet :
```powershell
cd backend
.\venv\Scripts\python.exe manage.py runserver
```

---

## ✅ Vérification

Une fois le serveur démarré, vous devriez voir :
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

### Accès à l'application :
- **Application** : http://localhost:8000
- **Admin Django** : http://localhost:8000/admin
- **API** : http://localhost:8000/api/

### Identifiants par défaut :
- **Username** : `admin`
- **Password** : `admin123`

---

## ⚠️ Problèmes Courants

### Erreur : "python.exe n'est pas reconnu"
**Solution** : Utilisez le chemin complet :
```powershell
.\venv\Scripts\python.exe manage.py runserver
```

### Erreur : "Le port 8000 est déjà utilisé"
**Solution** : Utilisez un autre port :
```powershell
python manage.py runserver 8001
```

### Erreur : "ModuleNotFoundError"
**Solution** : Vérifiez que vous êtes dans le dossier `backend` et que le venv est activé.

### Erreur : "MySQL connection failed"
**Solution** : Vérifiez que WAMP est démarré et que MySQL est actif.

---

## 🛑 Arrêter le Serveur

Appuyez sur **Ctrl+C** dans le terminal où le serveur tourne.

---

## 📝 Note

Le serveur Django doit être démarré **avant** d'accéder à l'application. Si vous voyez une erreur "API non accessible" dans l'interface, c'est que le serveur Django n'est pas démarré.


