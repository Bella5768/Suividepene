# 🚀 Guide de Démarrage Rapide

## Démarrage en 1 Clic

**Double-cliquer sur : `start_all.bat`**

C'est tout ! Les deux serveurs (backend et frontend) démarreront automatiquement.

## 📋 Résumé de l'Installation

✅ **Base de données MySQL** : `suivi_depense` créée  
✅ **Backend Django** : Configuré et prêt  
✅ **Node.js** : Installé (version portable)  
✅ **Frontend React** : Dépendances installées  
✅ **Superutilisateur** : `admin` / `admin123`

## 🔗 Accès à l'Application

Une fois les serveurs démarrés :

- **Application Frontend** : http://localhost:3000
- **API Backend** : http://localhost:8000/api/
- **Admin Django** : http://localhost:8000/admin

## 🔐 Connexion

- **Username** : `admin`
- **Password** : `admin123`

## ⚠️ Prérequis

- WAMP doit être **démarré** (MySQL doit être actif)
- Les ports 3000 et 8000 doivent être **libres**

## 🛠️ Démarrage Manuel (si nécessaire)

### Terminal 1 - Backend
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

### Terminal 2 - Frontend
```powershell
cd frontend
..\nodejs-portable\npm.cmd run dev
```

## ✅ Vérification

1. Ouvrir http://localhost:8000/admin → Page de connexion Django
2. Ouvrir http://localhost:3000 → Page de connexion de l'application
3. Se connecter avec `admin` / `admin123`

## 🎉 C'est Prêt !

Votre application de suivi des dépenses est maintenant opérationnelle !



