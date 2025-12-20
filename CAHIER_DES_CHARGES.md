# CAHIER DES CHARGES COMPLET
## Application de Suivi des Dépenses - CSI G

**Version:** 1.0  
**Date:** Décembre 2025  
**Client:** CSI G (Centre de Suivi et d'Information Guinéen)

---

## 1. CONTEXTE & OBJECTIFS

### 1.1 Contexte
L'application de suivi des dépenses permet à l'organisation de gérer efficacement ses dépenses quotidiennes, de suivre les écarts par rapport aux prévisions budgétaires, et de générer des rapports mensuels pour la prise de décision.

### 1.2 Objectifs Principaux
- **Traçabilité complète** : Enregistrement de toutes les opérations avec journal d'audit immuable
- **Précision des prévisions** : Suivi des écarts entre prévisions et réalisations
- **Multi-allocation** : Possibilité d'imputer une opération sur plusieurs prévisions
- **Rapports consolidés** : Génération automatique de rapports mensuels (PDF/Excel)
- **Gestion de la restauration** : Système intégré pour la commande de repas et la gestion de la cantine

---

## 2. FONCTIONNALITÉS PRINCIPALES

### 2.1 Gestion des Opérations
- **Enregistrement des dépenses** : Date, catégorie, sous-catégorie, unités, prix unitaire, montant
- **Calcul automatique** : Montant total, écart vs prévision
- **Filtres avancés** : Par date, catégorie, période
- **Export Excel** : Export des opérations avec filtres appliqués
- **Import CSV** : Import en masse des opérations

### 2.2 Gestion des Prévisions
- **Création de prévisions** : Par mois, catégorie, sous-catégorie
- **Suivi des montants** : Montant prévu, montant imputé, solde restant
- **Statuts** : Brouillon, Validé, Clôturé
- **Calcul automatique** : Des soldes et écarts

### 2.3 Imputations
- **Imputation automatique** : Lors de la création d'une opération, si une prévision correspondante existe
- **Multi-allocation** : Une opération peut être imputée sur plusieurs prévisions
- **Suivi des montants** : Montant imputé par prévision

### 2.4 Catégories et Sous-Catégories
- **Gestion hiérarchique** : Catégories principales et sous-catégories
- **Codes uniques** : Identification par code pour faciliter les rapports
- **Descriptions** : Documentation de chaque catégorie

### 2.5 Rapports
- **Rapport mensuel** : Total dépenses, total prévu, écart global, moyenne journalière
- **Par catégorie** : Détail des dépenses et écarts par catégorie
- **Export PDF** : Génération de rapports en PDF
- **Export Excel** : Génération de rapports en Excel

### 2.6 Journal d'Audit
- **Traçabilité complète** : Enregistrement de toutes les actions (création, modification, suppression)
- **Informations** : Utilisateur, date/heure, type d'action, objet modifié
- **Consultation** : Interface dédiée pour consulter l'historique

### 2.7 Gestion de la Restauration / Cantine
- **Gestion des plats** : Catalogue des plats disponibles avec prix standard
- **Gestion des menus** : Création de menus par date avec plats, prix du jour, stock
- **Publication de menus** : Génération de lien public pour commande sans authentification
- **Commandes** : Système de commande pour les employés
- **Subventions** : Calcul automatique des subventions (fixe ou pourcentage)
- **Imputation automatique** : Création automatique d'opérations et imputations pour la restauration
- **Tableau de bord cantine** : Vue d'ensemble des commandes pour le gestionnaire

---

## 3. ARCHITECTURE TECHNIQUE

### 3.1 Stack Technologique
- **Backend** : Django 4.2.7 (Python)
- **Frontend** : React 18+ avec Vite
- **Base de données** : MySQL
- **Authentification** : JWT (JSON Web Tokens) via Django REST Framework Simple JWT
- **API** : REST API avec Django REST Framework
- **Développement** : Vite (port 3001) pour le frontend, Django (port 8000) pour le backend

### 3.2 Structure du Projet
```
Suivi_depense/
├── backend/              # Application Django
│   ├── depenses/        # Application principale
│   │   ├── models.py    # Modèles de données
│   │   ├── views.py     # Vues API
│   │   ├── serializers.py # Sérialiseurs DRF
│   │   ├── urls.py      # Routes API
│   │   └── templates/   # Templates Django
│   └── suivi_depense/   # Configuration Django
├── frontend/            # Application React
│   ├── src/
│   │   ├── pages/       # Pages React
│   │   ├── components/  # Composants réutilisables
│   │   ├── contexts/    # Contextes React (Auth)
│   │   └── utils/       # Utilitaires
│   └── vite.config.js   # Configuration Vite
└── nodejs-portable/     # Node.js portable (Windows)
```

### 3.3 Authentification
- **JWT** : Tokens d'accès et de rafraîchissement
- **Rôles** : Utilisateurs authentifiés (staff/non-staff)
- **Accès public** : Lien public pour commande de repas (sans authentification)

---

## 4. MODÈLE DE DONNÉES

### 4.1 Tables Principales

#### Categories
- `id` : Identifiant unique
- `nom` : Nom de la catégorie
- `code` : Code unique (ex: "RESTAURATION", "TRANSPORT")
- `description` : Description de la catégorie
- `created_at`, `updated_at` : Horodatage

#### SousCategories
- `id` : Identifiant unique
- `categorie` : Référence à Categories (ForeignKey)
- `nom` : Nom de la sous-catégorie
- `description` : Description
- `created_at`, `updated_at` : Horodatage

#### Previsions
- `id` : Identifiant unique
- `mois` : Date du mois (YYYY-MM-01)
- `categorie` : Référence à Categories
- `sous_categorie` : Référence à SousCategories (nullable)
- `montant_prevu` : Montant prévu (DECIMAL)
- `statut` : ENUM('brouillon', 'valide', 'cloture')
- `montant_impute` : Calculé automatiquement
- `solde_restant` : Calculé automatiquement
- `created_by` : Utilisateur créateur
- `created_at`, `updated_at` : Horodatage

#### Operations
- `id` : Identifiant unique
- `date_operation` : Date de l'opération
- `jour` : Jour de la semaine (calculé)
- `semaine_iso` : Semaine ISO (calculé)
- `categorie` : Référence à Categories
- `sous_categorie` : Référence à SousCategories (nullable)
- `unites` : Nombre d'unités
- `prix_unitaire` : Prix par unité
- `montant_depense` : Calculé automatiquement (unites × prix_unitaire)
- `description` : Description de l'opération
- `ecart` : Écart vs prévision (calculé)
- `created_by` : Utilisateur créateur
- `created_at`, `updated_at` : Horodatage

#### Imputations
- `id` : Identifiant unique
- `operation` : Référence à Operations
- `prevision` : Référence à Previsions
- `montant_impute` : Montant imputé sur cette prévision
- `created_by` : Utilisateur créateur
- `created_at`, `updated_at` : Horodatage

#### AuditLog
- `id` : Identifiant unique
- `action` : Type d'action ('create', 'update', 'delete')
- `user` : Utilisateur ayant effectué l'action
- `content_type` : Type de modèle modifié
- `object_id` : ID de l'objet modifié
- `metadata` : Données JSON supplémentaires
- `created_at` : Horodatage

### 4.2 Tables Restauration / Cantine

#### Plats
- `id` : Identifiant unique
- `nom` : Nom du plat
- `description` : Description du plat
- `categorie_restau` : ENUM('PetitDej', 'Dejeuner', 'Diner', 'Snack')
- `prix_standard` : Prix catalogue standard (GNF)
- `actif` : Boolean (plat actif ou non)
- `created_at`, `updated_at` : Horodatage

#### Menus
- `id` : Identifiant unique
- `date_menu` : Date du menu (UNIQUE)
- `publication_at` : Date de publication (nullable)
- `token_public` : Token unique pour accès public (nullable)
- `created_at`, `updated_at` : Horodatage

#### MenuPlats
- `id` : Identifiant unique
- `menu` : Référence à Menus
- `plat` : Référence à Plats
- `prix_jour` : Prix du jour (peut différer du standard)
- `stock_max` : Stock maximum (nullable = illimité)
- `ordre` : Ordre d'affichage
- UNIQUE(menu, plat)

#### FenetreCommande
- `id` : Identifiant unique
- `categorie_restau` : ENUM('PetitDej', 'Dejeuner', 'Diner', 'Snack')
- `heure_limite` : Heure limite pour commander (TIME)
- `actif` : Boolean

#### ReglesSubvention
- `id` : Identifiant unique
- `type_subvention` : ENUM('AUCUNE', 'FIXE', 'POURCENT')
- `valeur` : Montant fixe ou pourcentage
- `plafond_par_jour` : Nombre de plats subventionnés par jour
- `actif` : Boolean
- `effectif_de`, `effectif_a` : Période de validité

#### Commandes
- `id` : Identifiant unique
- `utilisateur` : Référence à User (nullable pour commandes publiques)
- `date_commande` : Date de consommation
- `etat` : ENUM('brouillon', 'validee', 'annulee', 'livree')
- `montant_brut` : Calculé automatiquement
- `montant_subvention` : Calculé automatiquement
- `montant_net` : Calculé automatiquement (brut - subvention)
- `operation` : Référence à Operations (créée lors de la validation)
- `nom_employe` : Nom de l'employé (pour commandes publiques)
- `email_employe` : Email (optionnel, pour commandes publiques)
- `created_at`, `updated_at` : Horodatage
- UNIQUE(utilisateur, date_commande) si utilisateur non null

#### CommandeLignes
- `id` : Identifiant unique
- `commande` : Référence à Commandes
- `menu_plat` : Référence à MenuPlats
- `quantite` : Quantité commandée
- `prix_unitaire` : Copie du prix_jour
- `montant_ligne` : Calculé (quantite × prix_unitaire)

---

## 5. RÈGLES DE GESTION

### 5.1 Opérations
- Le montant de dépense est calculé automatiquement : `unites × prix_unitaire`
- L'écart est calculé automatiquement en comparant avec la prévision correspondante
- Si plusieurs prévisions correspondent, l'écart utilise la première trouvée

### 5.2 Prévisions
- Le montant imputé est la somme de toutes les imputations liées
- Le solde restant = `montant_prevu - montant_impute`
- Validation : Un prévision validée ne peut plus être modifiée

### 5.3 Imputations
- Création automatique lors de la sauvegarde d'une opération si une prévision correspondante existe
- Une opération peut être imputée sur plusieurs prévisions (multi-allocation)
- Le montant imputé ne peut pas dépasser le solde restant de la prévision

### 5.4 Restauration

#### Menus
- Un seul menu par date
- Le token public est généré automatiquement lors de la publication
- Le lien public est : `http://localhost:8000/commander/{token_public}/`

#### Commandes
- **Montant brut** : Σ (quantité × prix_jour) pour toutes les lignes
- **Subvention** :
  - Type FIXE : `min(plafond_par_jour, nb_plats_subventionnables) × valeur`
  - Type POURCENT : `montant_brut × (valeur/100)`, plafonnée si nécessaire
- **Montant net** : `montant_brut - montant_subvention`
- **Fenêtre de commande** : Vérification de l'heure limite avant validation
- **Stock** : Vérification que la quantité demandée ≤ stock restant

#### Imputation Automatique
- Lors de la validation d'une commande :
  1. Création d'une `Operation` :
     - Date = date_commande
     - Catégorie = "Restauration" (créée si n'existe pas)
     - Sous-catégorie = selon créneau (ex: "Déjeuner")
     - Unités = Nombre total de plats
     - Montant = montant_net
  2. Création d'une `Imputation` sur la prévision du mois "Restauration"

---

## 6. INTERFACES UTILISATEUR

### 6.1 Pages Principales

#### Dashboard
- Vue d'ensemble des statistiques mensuelles
- Cartes avec couleurs uniques (codes couleur CSI G)
- Total dépenses, total prévu, écart global
- Moyenne journalière, nombre d'opérations
- Dernières opérations

#### Opérations
- Liste des opérations avec filtres (date, catégorie)
- Formulaire modal pour créer/éditer
- Export Excel
- Recherche multi-critères

#### Prévisions
- Liste des prévisions par mois
- Formulaire modal pour créer/éditer
- Filtres par mois et statut
- Affichage des soldes

#### Imputations
- Liste des imputations
- Détails : opération, prévision, montant
- Filtres par date, prévision

#### Rapports
- Sélecteur de mois
- Rapport mensuel détaillé
- Export PDF et Excel
- Statistiques par catégorie

#### Catégories
- Gestion des catégories et sous-catégories
- CRUD complet
- Codes uniques

#### Journal d'Audit
- Liste chronologique de toutes les actions
- Filtres par utilisateur, type d'action, date
- Détails complets de chaque action

### 6.2 Pages Restauration

#### Gestion des Plats
- Liste des plats disponibles
- Formulaire pour créer/éditer
- Filtres par catégorie (Petit-déj, Déjeuner, Dîner, Snack)
- Activation/désactivation

#### Gestion des Menus
- Sélecteur de date
- Création de menu pour une date
- Ajout de plats au menu (prix du jour, stock, ordre)
- Publication du menu (génère le lien public)
- Affichage du lien public avec bouton de copie

#### Mes Commandes (Employés)
- Sélecteur de date
- Affichage du menu du jour (si publié)
- Sélection de plats avec quantité
- Panier avec total brut, subvention, net
- Validation de commande
- Affichage des commandes existantes

#### Commander (Lien Public)
- **Accès sans authentification** via token public
- Formulaire : Nom employé, email (optionnel)
- Affichage du menu avec plats disponibles
- Sélection de quantité avec vérification du stock
- Panier fixe avec total
- Validation de commande

#### Tableau de Bord Cantine
- Statistiques du jour : Total commandes, validées, brouillons
- Montants : Brut, subvention, net
- Liste des commandes du jour
- Filtres par date
- Export CSV/Excel

### 6.3 Design & UX
- **Style** : Interface similaire à Django Admin
- **Couleurs** : Codes couleur CSI G (bleu #366092, etc.)
- **Logo** : Logo CSIG dans le header
- **Monnaie** : Franc Guinéen (GNF) avec formatage personnalisé
- **Responsive** : Design adaptatif
- **Tables** : Style amélioré avec couleurs CSI G, badges, hover effects

---

## 7. API ENDPOINTS

### 7.1 Authentification
- `POST /api/auth/token/` : Obtenir un token JWT
- `POST /api/auth/token/refresh/` : Rafraîchir le token
- `POST /api/auth/token-django/` : Obtenir un token Django (pour compatibilité)

### 7.2 Opérations
- `GET /api/operations/` : Liste des opérations (avec filtres)
- `POST /api/operations/` : Créer une opération
- `GET /api/operations/{id}/` : Détails d'une opération
- `PUT /api/operations/{id}/` : Modifier une opération
- `DELETE /api/operations/{id}/` : Supprimer une opération
- `GET /api/operations/export-excel/` : Export Excel

### 7.3 Prévisions
- `GET /api/previsions/` : Liste des prévisions (avec filtres)
- `POST /api/previsions/` : Créer une prévision
- `GET /api/previsions/{id}/` : Détails d'une prévision
- `PUT /api/previsions/{id}/` : Modifier une prévision
- `DELETE /api/previsions/{id}/` : Supprimer une prévision

### 7.4 Imputations
- `GET /api/imputations/` : Liste des imputations
- `POST /api/imputations/` : Créer une imputation
- `GET /api/imputations/{id}/` : Détails d'une imputation
- `DELETE /api/imputations/{id}/` : Supprimer une imputation

### 7.5 Catégories
- `GET /api/categories/` : Liste des catégories
- `POST /api/categories/` : Créer une catégorie
- `GET /api/categories/{id}/` : Détails d'une catégorie
- `PUT /api/categories/{id}/` : Modifier une catégorie
- `DELETE /api/categories/{id}/` : Supprimer une catégorie

### 7.6 Sous-Catégories
- `GET /api/sous-categories/` : Liste des sous-catégories
- `POST /api/sous-categories/` : Créer une sous-catégorie
- `GET /api/sous-categories/{id}/` : Détails
- `PUT /api/sous-categories/{id}/` : Modifier
- `DELETE /api/sous-categories/{id}/` : Supprimer

### 7.7 Rapports
- `GET /api/rapports/mensuel/?mois=YYYY-MM` : Rapport mensuel
- `GET /api/rapports/export-pdf/?mois=YYYY-MM` : Export PDF
- `GET /api/rapports/export-excel/?mois=YYYY-MM` : Export Excel

### 7.8 Audit
- `GET /api/audit/` : Liste des entrées d'audit (avec filtres)

### 7.9 Restauration - Plats
- `GET /api/restauration/plats/` : Liste des plats
- `POST /api/restauration/plats/` : Créer un plat
- `GET /api/restauration/plats/{id}/` : Détails
- `PUT /api/restauration/plats/{id}/` : Modifier
- `DELETE /api/restauration/plats/{id}/` : Supprimer

### 7.10 Restauration - Menus
- `GET /api/restauration/menus/?date_menu=YYYY-MM-DD` : Menu d'une date
- `POST /api/restauration/menus/` : Créer un menu
- `GET /api/restauration/menus/{id}/` : Détails
- `POST /api/restauration/menus/{id}/publier/` : Publier un menu
- `POST /api/restauration/menus/{id}/ajouter_plat/` : Ajouter un plat au menu
- `GET /api/restauration/menus/by_date_range/?from=YYYY-MM-DD&to=YYYY-MM-DD` : Menus par plage

### 7.11 Restauration - Commandes
- `GET /api/restauration/commandes/?date_commande=YYYY-MM-DD` : Commandes d'une date
- `POST /api/restauration/commandes/creer_avec_lignes/` : Créer une commande avec lignes
- `GET /api/restauration/commandes/{id}/` : Détails
- `POST /api/restauration/commandes/{id}/valider/` : Valider une commande
- `POST /api/restauration/commandes/{id}/annuler/` : Annuler une commande
- `GET /api/restauration/commandes/tableau_bord_cantine/?date=YYYY-MM-DD` : Statistiques cantine

### 7.12 Restauration - Public (Sans Authentification)
- `GET /api/restauration/public/menu/{token}/` : Récupérer un menu publié via token
- `POST /api/restauration/public/commander/{token}/` : Créer une commande publique

### 7.13 Restauration - Autres
- `GET /api/restauration/fenetres-commande/` : Fenêtres de commande
- `GET /api/restauration/regles-subvention/` : Règles de subvention

---

## 8. SÉCURITÉ & RÔLES

### 8.1 Authentification
- **JWT** : Tokens d'accès et de rafraîchissement
- **Session Django** : Alternative pour compatibilité
- **Accès public** : Lien public pour commande (sans authentification, via token)

### 8.2 Permissions
- **IsAuthenticated** : Accès aux API nécessite une authentification
- **IsStaff** : Certaines fonctionnalités réservées au staff (gestion des menus, validation)
- **AllowAny** : Endpoints publics pour commande (avec token de menu)

### 8.3 Rôles Implicites
- **ADMIN** : Gère plats, menus, règles de subvention, paramètres
- **CONTROLE** : Valide/annule commandes, supervise imputations
- **EMPLOYE** : Crée/édite ses commandes, consulte historique
- **PUBLIC** : Accès via lien public pour commander (sans compte)

---

## 9. RAPPORTS & KPIs

### 9.1 Rapports Mensuels
- **Total dépenses** : Somme de toutes les opérations du mois
- **Total prévu** : Somme de toutes les prévisions du mois
- **Écart global** : Différence entre total dépenses et total prévu
- **Moyenne journalière** : Total dépenses / nombre de jours avec opérations
- **Par catégorie** : Détail des dépenses et écarts par catégorie
- **Nombre d'opérations** : Total et par catégorie

### 9.2 Rapports Restauration
- **Journalier** :
  - Nombre de commandes
  - Nombre de plats par catégorie
  - Montant brut, subventions, montant net
- **Mensuel** :
  - Moyenne journalière des dépenses "Restauration"
  - Écart vs prévision "Restauration"
  - Top 10 plats par quantité
  - Coût moyen par employé
- **Exports** : CSV/Excel, PDF

---

## 10. CONTRAINTES & VALIDATIONS

### 10.1 Validations Métier
- **Opérations** : Montant > 0, date valide, catégorie existante
- **Prévisions** : Montant > 0, mois valide, catégorie existante
- **Imputations** : Montant imputé ≤ solde restant de la prévision
- **Commandes** :
  - Vérification de la fenêtre de commande (heure limite)
  - Vérification du stock disponible
  - Menu publié obligatoire
  - Une commande par jour par utilisateur (si authentifié)

### 10.2 Contrôles d'Erreurs
- **Tentative de commander après l'heure limite** : Message d'erreur clair
- **Stock insuffisant** : Empêcher quantité > stock restant
- **Menu non publié** : Message d'indisponibilité
- **Double commande** : Refuser ou fusionner selon configuration
- **Règles de subvention expirées** : Basculer sur règle par défaut (AUCUNE)

---

## 11. DÉPLOIEMENT

### 11.1 Environnement de Développement
- **Django** : `http://localhost:8000`
- **Vite** : `http://localhost:3001`
- **Base de données** : MySQL locale (WAMP)
- **Node.js** : Version portable (nodejs-portable)

### 11.2 Environnement de Production
- **Serveur** : Linux/Cloud (AWS/Azure)
- **Base de données** : MySQL
- **Frontend** : Build Vite intégré dans Django (static files)
- **Reverse Proxy** : Nginx ou Apache
- **HTTPS** : Certificat SSL requis

### 11.3 Scripts de Démarrage
- `start_servers.bat` : Démarre Django et Vite
- `start_unified.bat` : Démarre en mode unifié (Django sert le frontend)
- `backend/start_server_simple.bat` : Démarre uniquement Django

---

## 12. FONCTIONNALITÉS FUTURES (OPTIONNELLES)

### 12.1 Intégrations
- **Power BI** : Connexion pour visualisations avancées
- **Metabase** : Tableaux de bord interactifs
- **Email** : Notifications par email pour validation de commandes
- **SMS** : Notifications SMS (optionnel)

### 12.2 Améliorations
- **Gestion de stock avancée** : Alertes de stock faible
- **Planning de menus** : Planification hebdomadaire/mensuelle
- **Statistiques avancées** : Graphiques, tendances
- **Multi-tenant** : Support de plusieurs organisations
- **API mobile** : Application mobile pour commandes

---

## 13. GLOSSAIRE

- **Opération** : Enregistrement d'une dépense réelle
- **Prévision** : Montant budgétaire prévu pour un mois/catégorie
- **Imputation** : Attribution d'une opération à une prévision
- **Écart** : Différence entre prévision et réalisation
- **Menu** : Menu du jour avec plats disponibles
- **Commande** : Commande de repas par un employé
- **Subvention** : Part prise en charge par l'employeur
- **Token public** : Identifiant unique pour accès public à un menu

---

## 14. CONTACTS & SUPPORT

**Développeur** : Assistant IA (Auto)  
**Client** : CSI G  
**Date de création** : Décembre 2025  
**Version** : 1.0

---

**FIN DU CAHIER DES CHARGES**

