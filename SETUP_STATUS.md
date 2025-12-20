# État de l'Installation

## ✅ Actions Complétées

### Backend Django
- ✅ Environnement virtuel Python créé (`backend/venv/`)
- ✅ Dépendances Python installées :
  - Django 4.2.7
  - Django REST Framework 3.14.0
  - PyMySQL 1.1.0 (alternative à mysqlclient pour Windows)
  - Toutes les autres dépendances principales
- ✅ Migrations créées pour `depenses` et `audit`
- ✅ Fichier `.env` à créer manuellement (voir ci-dessous)

### Frontend React
- ⚠️ Node.js/npm non détecté dans le PATH
- ⚠️ Installation des dépendances npm à faire manuellement

## 📋 Actions Restantes à Faire Manuellement

### 1. Créer la Base de Données MySQL

**Option A : Via phpMyAdmin (Recommandé)**
1. Ouvrir http://localhost/phpmyadmin
2. Cliquer sur "Nouvelle base de données"
3. Nom : `suivi_depense`
4. Interclassement : `utf8mb4_unicode_ci`
5. Cliquer sur "Créer"

**Option B : Via SQL**
Exécuter dans phpMyAdmin ou MySQL :
```sql
CREATE DATABASE IF NOT EXISTS suivi_depense CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configurer le fichier .env

Créer le fichier `backend/.env` avec le contenu suivant :
```
SECRET_KEY=django-insecure-change-me-in-production-12345
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=suivi_depense
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Note** : Si votre MySQL a un mot de passe, modifiez `DB_PASSWORD=` avec votre mot de passe.

### 3. Appliquer les Migrations

Dans le terminal, depuis le dossier `backend` :
```powershell
.\venv\Scripts\Activate.ps1
python manage.py migrate
```

### 4. Créer un Superutilisateur

```powershell
python manage.py createsuperuser
```
Saisir un nom d'utilisateur, email et mot de passe.

### 5. Installer Node.js (si pas déjà installé)

1. Télécharger Node.js depuis https://nodejs.org/
2. Installer Node.js (npm sera inclus)
3. Redémarrer le terminal

### 6. Installer les Dépendances Frontend

Dans un nouveau terminal, depuis le dossier `frontend` :
```powershell
npm install
```

### 7. Démarrer les Serveurs

**Terminal 1 - Backend :**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

**Terminal 2 - Frontend :**
```powershell
cd frontend
npm run dev
```

### 8. Accéder à l'Application

- Frontend : http://localhost:3000
- Backend API : http://localhost:8000
- Admin Django : http://localhost:8000/admin

## 🔧 Dépannage

### Erreur "Base 'suivi_depense' inconnue"
→ Créer la base de données MySQL (voir étape 1)

### Erreur de connexion MySQL
→ Vérifier que WAMP est démarré et que les paramètres dans `.env` sont corrects

### npm non reconnu
→ Installer Node.js ou ajouter Node.js au PATH système

### Erreur PyMySQL
→ L'environnement virtuel doit être activé avant d'exécuter les commandes Django

## 📝 Commandes Rapides

```powershell
# Activer l'environnement virtuel
cd backend
.\venv\Scripts\Activate.ps1

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Démarrer le serveur Django
python manage.py runserver

# Dans un autre terminal - Frontend
cd frontend
npm install
npm run dev 
```

## ✅ Vérification

Une fois tout configuré, vous devriez pouvoir :
1. Accéder à http://localhost:3000 et voir la page de connexion
2. Vous connecter avec les identifiants du superutilisateur
3. Voir le tableau de bord avec les statistiques



