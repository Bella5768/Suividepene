# 📘 Guide de Migration : React → Vanilla JS

## ✅ Ce qui a été fait

### Structure de base
- ✅ `index.html` - Point d'entrée
- ✅ `js/router.js` - Système de routing
- ✅ `js/services/auth.js` - Authentification
- ✅ `js/services/api.js` - Service API
- ✅ `js/utils/toast.js` - Notifications
- ✅ `js/utils/currency.js` - Formatage monétaire
- ✅ `js/layout.js` - Layout avec header et sidebar
- ✅ `js/main.js` - Initialisation de l'application

### Pages complètes
- ✅ `js/pages/login.js` - Page de connexion
- ✅ `js/pages/dashboard.js` - Tableau de bord

### Pages à compléter
Les fichiers suivants sont des stubs (structure de base) à compléter :
- ⏳ `js/pages/operations.js`
- ⏳ `js/pages/previsions.js`
- ⏳ `js/pages/imputations.js`
- ⏳ `js/pages/rapports.js`
- ⏳ `js/pages/categories.js`
- ⏳ `js/pages/utilisateurs.js`
- ⏳ `js/pages/audit.js`
- ⏳ `js/pages/restauration-plats.js`
- ⏳ `js/pages/restauration-menus.js`
- ⏳ `js/pages/restauration-commandes.js`
- ⏳ `js/pages/extras-restauration.js`
- ⏳ `js/pages/tableau-bord-cantine.js`
- ⏳ `js/pages/commander-public.js`

## 🔄 Comment convertir une page React en Vanilla JS

### Étape 1 : Analyser la page React

Exemple avec `Operations.jsx` :
```jsx
import { useQuery } from 'react-query'
import axios from 'axios'
// ...
```

### Étape 2 : Créer la fonction de rendu

```javascript
// js/pages/operations.js
import { apiService } from '../services/api.js';
import { formatGNF } from '../utils/currency.js';
import { toast } from '../utils/toast.js';
import { getMainContent } from '../layout.js';

export async function renderOperations() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="operations">
      <h1>Opérations</h1>
      <div id="operations-content">
        <div class="loading">
          <div class="spinner"></div>
        </div>
      </div>
    </div>
  `;

  // Charger les données
  await loadOperations();
}
```

### Étape 3 : Remplacer React Query par des appels API directs

**React (avant) :**
```jsx
const { data, isLoading } = useQuery(
  ['operations'],
  async () => {
    const response = await axios.get('/api/operations/')
    return response.data
  }
)
```

**Vanilla JS (après) :**
```javascript
async function loadOperations() {
  try {
    const data = await apiService.get('/api/operations/');
    renderOperationsList(data);
  } catch (error) {
    toast.error('Erreur lors du chargement');
  }
}
```

### Étape 4 : Remplacer les hooks React

**useState :**
```jsx
const [count, setCount] = useState(0);
setCount(count + 1);
```

```javascript
let count = 0;
count = count + 1;
// Mettre à jour le DOM manuellement
```

**useEffect :**
```jsx
useEffect(() => {
  // Code
}, [dependencies]);
```

```javascript
// Appeler directement dans la fonction de rendu
async function renderPage() {
  // Code d'initialisation
  await loadData();
  attachEventListeners();
}
```

### Étape 5 : Gérer les événements

**React :**
```jsx
<button onClick={() => handleClick()}>Cliquer</button>
```

**Vanilla JS :**
```javascript
main.innerHTML = `<button id="my-btn">Cliquer</button>`;
document.getElementById('my-btn').addEventListener('click', handleClick);
```

### Étape 6 : Gérer les formulaires

**React :**
```jsx
const [formData, setFormData] = useState({});
<input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
```

**Vanilla JS :**
```javascript
const formData = {};
main.innerHTML = `<input id="name-input" />`;
document.getElementById('name-input').addEventListener('input', (e) => {
  formData.name = e.target.value;
});
```

## 📝 Template de page

```javascript
import { apiService } from '../services/api.js';
import { formatGNF } from '../utils/currency.js';
import { toast } from '../utils/toast.js';
import { getMainContent } from '../layout.js';

export async function renderPageName() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="page-name">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Nom de la page</span>
      </div>
      <div class="page-header">
        <h1>Nom de la page</h1>
      </div>
      <div id="page-content">
        <div class="loading">
          <div class="spinner"></div>
        </div>
      </div>
    </div>
  `;

  await loadData();
  attachEventListeners();
}

async function loadData() {
  try {
    const data = await apiService.get('/api/endpoint/');
    renderContent(data);
  } catch (error) {
    toast.error('Erreur lors du chargement');
    document.getElementById('page-content').innerHTML = `
      <div class="card">
        <p>Erreur : ${error.message}</p>
      </div>
    `;
  }
}

function renderContent(data) {
  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = `
    <div class="card">
      <!-- Contenu ici -->
    </div>
  `;

  attachEventListeners();
}

function attachEventListeners() {
  // Attacher tous les événements ici
  const btn = document.getElementById('some-button');
  if (btn) {
    btn.addEventListener('click', handleClick);
  }
}

function handleClick() {
  // Logique
}
```

## 🎨 Conversion des styles

Les fichiers CSS React peuvent être réutilisés tels quels. Il suffit de :
1. Copier les fichiers CSS depuis `frontend/src/pages/` vers `frontend-vanilla/css/pages/`
2. Les inclure dans `index.html` si nécessaire
3. Ou les intégrer dans `css/styles.css`

## 🔧 Utilitaires disponibles

### API Service
```javascript
import { apiService } from '../services/api.js';

// GET
const data = await apiService.get('/api/endpoint/');

// POST
const result = await apiService.post('/api/endpoint/', { key: 'value' });

// PUT
const updated = await apiService.put('/api/endpoint/1/', { key: 'value' });

// DELETE
await apiService.delete('/api/endpoint/1/');
```

### Toast
```javascript
import { toast } from '../utils/toast.js';

toast.success('Succès !');
toast.error('Erreur !');
toast.info('Information');
toast.warning('Attention');
```

### Currency
```javascript
import { formatGNF } from '../utils/currency.js';

const formatted = formatGNF(1000000); // "1 000 000,00 GNF"
```

### Auth
```javascript
import { authService } from '../services/auth.js';

const isAuth = authService.isAuthenticated();
const user = authService.user;
const hasPerm = authService.hasPermission('operations', 'peut_voir');
```

### Router
```javascript
import { router } from '../router.js';

router.navigate('/dashboard');
```

## 📋 Checklist pour chaque page

- [ ] Créer la fonction `renderPageName()`
- [ ] Créer la fonction `loadData()`
- [ ] Créer la fonction `renderContent(data)`
- [ ] Créer la fonction `attachEventListeners()`
- [ ] Gérer les formulaires (création/édition)
- [ ] Gérer les suppressions
- [ ] Gérer la pagination (si nécessaire)
- [ ] Gérer les filtres (si nécessaire)
- [ ] Gérer les exports (PDF/Excel si nécessaire)
- [ ] Gérer les erreurs
- [ ] Tester toutes les fonctionnalités

## 🚀 Prochaines étapes

1. Compléter les pages stub par stub
2. Tester chaque page individuellement
3. Copier les assets (images, etc.)
4. Ajuster les chemins dans les fichiers
5. Tester l'application complète
6. Remplacer le frontend React par le frontend vanilla

## 📚 Ressources

- Fichiers React originaux : `frontend/src/pages/`
- Fichiers CSS originaux : `frontend/src/pages/` et `frontend/src/components/`
- Documentation API : Voir les fichiers React pour les endpoints utilisés

