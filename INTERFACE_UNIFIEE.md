# Interface Unifiée - Tout sur localhost:8000

## ✅ Configuration Terminée

Maintenant, **tout est accessible sur un seul port : localhost:8000**

### 📍 URLs Unifiées

- **Application principale :** http://localhost:8000
- **Admin Django :** http://localhost:8000/admin
- **API REST :** http://localhost:8000/api/
- **Authentification :** http://localhost:8000/api/auth/

### 🚀 Démarrage

**1. Démarrer le Backend Django :**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

**2. Démarrer le Frontend React (en mode développement) :**
```powershell
cd frontend
..\nodejs-portable\npm.cmd run dev
```

**Important :** Les deux serveurs doivent tourner :
- Django sur le port 8000 (backend + template)
- React sur le port 3000 (pour le hot-reload en développement)

### 🔄 Comment ça fonctionne

1. **Django** sert le template HTML sur `localhost:8000`
2. Le template charge React depuis `localhost:3000` (en développement)
3. React communique avec l'API Django via `/api/`
4. Tout est accessible depuis `localhost:8000`

### 📝 Avantages

- ✅ Une seule URL principale : `localhost:8000`
- ✅ Admin Django accessible sur `/admin`
- ✅ Application React intégrée
- ✅ Hot-reload React en développement
- ✅ Authentification Django unifiée

### 🎯 Utilisation

1. Ouvrez http://localhost:8000
2. Si vous n'êtes pas connecté, vous serez redirigé vers la page de connexion
3. Une fois connecté, vous verrez l'interface React intégrée
4. L'admin Django reste accessible sur `/admin`

### 🔧 Production

Pour la production, build React et servez les fichiers statiques :
```powershell
cd frontend
..\nodejs-portable\npm.cmd run build
```

Les fichiers seront dans `backend/depenses/static/depenses/` et Django les servira automatiquement.



