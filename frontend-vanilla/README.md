# Frontend Vanilla JS - Application de Suivi des Dépenses

Version vanilla JavaScript (HTML/CSS/JS) de l'application, remplaçant React.

## 📁 Structure

```
frontend-vanilla/
├── index.html              # Point d'entrée
├── css/
│   ├── styles.css         # Styles globaux
│   ├── layout.css         # Styles du layout
│   └── login.css          # Styles de la page de login
├── js/
│   ├── main.js            # Initialisation
│   ├── router.js          # Système de routing
│   ├── layout.js          # Layout (header, sidebar)
│   ├── config/
│   │   └── api.js         # Configuration API
│   ├── services/
│   │   ├── auth.js       # Service d'authentification
│   │   └── api.js        # Service API générique
│   ├── utils/
│   │   ├── toast.js      # Notifications toast
│   │   └── currency.js   # Formatage monétaire
│   └── pages/
│       ├── login.js       # ✅ Page de connexion
│       ├── dashboard.js   # ✅ Tableau de bord
│       ├── operations.js  # ⏳ À compléter
│       ├── previsions.js  # ⏳ À compléter
│       └── ...            # Autres pages
└── assets/
    └── logocsig.png       # Logo CSIG
```

## 🚀 Utilisation

### Développement local

1. Servir les fichiers via un serveur web (Django, nginx, etc.)
2. Configurer l'URL de l'API dans `js/config/api.js` ou via `window.API_BASE_URL`

### Avec Django

1. Copier le contenu de `frontend-vanilla/` vers `backend/depenses/static/depenses/`
2. Modifier `backend/depenses/templates/depenses/index.html` pour pointer vers `index.html`
3. Les fichiers seront servis par Django

### Configuration API

Par défaut, l'application utilise des chemins relatifs (`/api/...`). Pour configurer une URL absolue :

```javascript
// Dans index.html ou avant le chargement
window.API_BASE_URL = 'https://your-backend-url.com';
```

## 📝 Pages disponibles

- ✅ **Login** - Connexion utilisateur
- ✅ **Dashboard** - Tableau de bord
- ⏳ **Operations** - Gestion des opérations (stub)
- ⏳ **Previsions** - Gestion des prévisions (stub)
- ⏳ **Rapports** - Rapports mensuels (stub)
- ⏳ **Categories** - Gestion des catégories (stub)
- ⏳ **Utilisateurs** - Gestion des utilisateurs (stub)
- ⏳ **Audit** - Journaux d'audit (stub)
- ⏳ **Restauration** - Pages restauration (stubs)

## 🔧 Fonctionnalités

- ✅ Routing vanilla JS
- ✅ Authentification JWT
- ✅ Gestion des permissions
- ✅ Notifications toast
- ✅ Formatage monétaire (GNF)
- ✅ Layout responsive
- ✅ Navigation avec sidebar

## 📚 Documentation

Voir `MIGRATION_GUIDE.md` pour :
- Comment convertir les pages React restantes
- Template de page
- Utilisation des services
- Checklist de migration

## ⚠️ Notes

- Les pages marquées "⏳ À compléter" sont des stubs de base
- Consulter les fichiers React originaux dans `frontend/src/pages/` pour la logique complète
- Les styles CSS peuvent être réutilisés depuis `frontend/src/`

