# Application de Suivi des Dépenses - CSIG

Application web complète de gestion budgétaire et de suivi des dépenses avec module de restauration/cantine.

## 🚀 Technologies utilisées

- **Backend**: Django 4.2.7 + Django REST Framework
- **Frontend**: React + Vite
- **Base de données**: MySQL
- **Authentification**: JWT (JSON Web Tokens)

## 📋 Fonctionnalités principales

### Gestion budgétaire
- Suivi des opérations de dépenses
- Prévisions mensuelles par catégorie
- Imputations automatiques
- Rapports et exports (PDF, Excel)

### Restauration / Cantine
- Gestion des plats et menus
- Commandes en ligne
- Validation des commandes
- Factures journalières
- Gestion des extras (visiteurs, stagiaires, activités)

### Administration
- Gestion des utilisateurs et permissions
- Audit des actions
- Catégories et sous-catégories de dépenses

## 🛠️ Installation

### Prérequis
- Python 3.8+
- Node.js 16+
- MySQL 5.7+
- WAMP (pour Windows)

### Backend

1. **Créer l'environnement virtuel** :
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate
   ```

2. **Installer les dépendances** :
   ```bash
   pip install -r requirements.txt
   ```

3. **Configurer la base de données** :
   - Créer une base de données MySQL nommée `suivi_depense`
   - Configurer les paramètres dans `backend/suivi_depense/settings.py` ou `.env`

4. **Appliquer les migrations** :
   ```bash
   python manage.py migrate
   ```

5. **Créer un superutilisateur** :
   ```bash
   python manage.py createsuperuser
   ```

6. **Démarrer le serveur** :
   ```bash
   python manage.py runserver
   ```

### Frontend

1. **Installer les dépendances** :
   ```bash
   cd frontend
   npm install
   ```

2. **Démarrer le serveur de développement** :
   ```bash
   npm run dev
   ```

L'application sera accessible sur http://localhost:3001

## 📝 Configuration

### Variables d'environnement

Créer un fichier `.env` dans le dossier `backend` :

```env
SECRET_KEY=votre_secret_key
DEBUG=True
DATABASE_NAME=suivi_depense
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_HOST=localhost
DATABASE_PORT=3306

# Configuration email (Outlook)
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=support@csig.edu.gn
EMAIL_HOST_PASSWORD=votre_mot_de_passe
DEFAULT_FROM_EMAIL=support@csig.edu.gn
```

## 👤 Comptes par défaut

- **Superutilisateur**: `admin` / `admin123`

## 📦 Structure du projet

```
Suivi_depense/
├── backend/              # Application Django
│   ├── depenses/         # Application principale
│   ├── audit/            # Module d'audit
│   └── suivi_depense/    # Configuration Django
├── frontend/             # Application React
│   ├── src/
│   │   ├── components/   # Composants réutilisables
│   │   ├── pages/        # Pages de l'application
│   │   └── contexts/     # Contextes React
│   └── public/
└── nodejs-portable/      # Node.js portable (optionnel)
```

## 🔐 Permissions

L'application utilise un système de permissions personnalisé :
- `peut_voir` : Visualiser
- `peut_creer` : Créer
- `peut_modifier` : Modifier
- `peut_supprimer` : Supprimer

Les permissions sont assignées par fonctionnalité (opérations, prévisions, restauration, etc.)

## 📄 Licence

Propriétaire - CSIG

## 👥 Auteur

Développé pour le Centre de Services Informatiques de Guinée (CSIG)
