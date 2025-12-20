# Comment React et Django fonctionnent ensemble

## 🎯 Architecture Unifiée

### En Développement

**Les deux serveurs tournent simultanément :**

1. **Django (port 8000)** :
   - Sert le template HTML (`depenses/templates/depenses/index.html`)
   - Fournit l'API REST (`/api/`)
   - Gère l'authentification Django (`/admin/`)

2. **React/Vite (port 3000)** :
   - Serveur de développement avec hot-reload
   - Le template Django charge React depuis `localhost:3000`
   - React communique avec l'API Django via `/api/`

### 🔄 Flux de Données

```
Navigateur (localhost:8000)
    ↓
Django sert index.html
    ↓
HTML charge React depuis localhost:3000
    ↓
React fait des appels API vers localhost:8000/api/
    ↓
Django répond avec les données JSON
```

## 📍 URLs

- **http://localhost:8000** → Template Django qui charge React
- **http://localhost:8000/admin** → Admin Django classique
- **http://localhost:8000/api/** → API REST Django
- **http://localhost:3000** → Serveur Vite (utilisé en arrière-plan)

## ✅ Avantages

- ✅ Une seule URL principale : `localhost:8000`
- ✅ Admin Django accessible sur `/admin`
- ✅ Application React intégrée
- ✅ Hot-reload React en développement
- ✅ Authentification Django unifiée

## 🚀 Démarrage

**Les deux serveurs doivent être démarrés :**

```powershell
# Terminal 1 - Django
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver

# Terminal 2 - React
cd frontend
..\nodejs-portable\npm.cmd run dev
```

**Ou utilisez le script automatique :**
- Double-cliquer sur `start_unified.bat`

## 🔧 En Production

En production, on build React et Django sert les fichiers statiques :
- Plus besoin du serveur React sur le port 3000
- Tout est servi par Django sur le port 8000


