# Instructions pour pousser le code sur GitHub

## Prérequis

1. **Installer Git** (si ce n'est pas déjà fait) :
   - Télécharger depuis : https://git-scm.com/download/win
   - Installer avec les options par défaut

2. **Configurer Git** (première fois seulement) :
   ```bash
   git config --global user.name "Votre Nom"
   git config --global user.email "votre.email@example.com"
   ```

## Méthode 1 : Utiliser le script batch (Recommandé)

1. Double-cliquer sur `push_to_github.bat`
2. Suivre les instructions à l'écran
3. Entrer vos identifiants GitHub si demandé

## Méthode 2 : Commandes manuelles

Ouvrir PowerShell ou CMD dans le dossier du projet et exécuter :

```bash
# Aller dans le dossier du projet
cd C:\wamp64\www\Suivi_depense

# Initialiser Git (si pas déjà fait)
git init

# Ajouter le remote GitHub
git remote add origin https://github.com/Bella5768/Suividepene.git
# Ou si le remote existe déjà :
git remote set-url origin https://github.com/Bella5768/Suividepene.git

# Ajouter tous les fichiers
git add .

# Créer le commit
git commit -m "Initial commit: Application de suivi des depenses avec restauration"

# Pousser vers GitHub
git push -u origin main
# Si la branche s'appelle "master" au lieu de "main" :
git push -u origin master
```

## Authentification GitHub

Si vous êtes demandé de vous authentifier :

1. **Token d'accès personnel** (recommandé) :
   - Aller sur GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
   - Créer un nouveau token avec les permissions `repo`
   - Utiliser ce token comme mot de passe

2. **GitHub CLI** (alternative) :
   - Installer GitHub CLI : https://cli.github.com/
   - Exécuter : `gh auth login`

## Fichiers exclus (.gitignore)

Les fichiers suivants sont automatiquement exclus :
- `backend/venv/` (environnement virtuel Python)
- `backend/.env` (variables d'environnement sensibles)
- `backend/db.sqlite3` (base de données locale)
- `node_modules/` (dépendances Node.js)
- Fichiers de cache et temporaires

## Important

⚠️ **Ne jamais pousser** :
- Fichiers `.env` contenant des mots de passe
- Clés API ou secrets
- Bases de données de production

