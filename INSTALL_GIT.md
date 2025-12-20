# Installation de Git pour Windows

## Problème
Git n'est pas installé ou n'est pas dans le PATH de votre système.

## Solution : Installer Git

### Option 1 : Installation standard (Recommandé)

1. **Télécharger Git pour Windows** :
   - Aller sur : https://git-scm.com/download/win
   - Le téléchargement commencera automatiquement

2. **Installer Git** :
   - Double-cliquer sur le fichier téléchargé (`Git-2.x.x-64-bit.exe`)
   - Suivre l'assistant d'installation
   - **IMPORTANT** : Cocher "Add Git to PATH" lors de l'installation
   - Garder les options par défaut pour le reste

3. **Redémarrer PowerShell** après l'installation

4. **Vérifier l'installation** :
   ```powershell
   git --version
   ```

### Option 2 : Installation via winget (Windows 10/11)

Si vous avez `winget` installé :
```powershell
winget install --id Git.Git -e --source winget
```

### Option 3 : Installation via Chocolatey

Si vous avez Chocolatey installé :
```powershell
choco install git
```

## Après l'installation

1. **Configurer Git** (première fois) :
   ```bash
   git config --global user.name "Votre Nom"
   git config --global user.email "votre.email@example.com"
   ```

2. **Pousser le code** :
   ```bash
   cd C:\wamp64\www\Suivi_depense
   git init
   git remote add origin https://github.com/Bella5768/Suividepene.git
   git add .
   git commit -m "Initial commit: Application de suivi des depenses avec restauration"
   git push -u origin main
   ```

## Authentification GitHub

Lors du `git push`, GitHub vous demandera de vous authentifier :

1. **Créer un token d'accès personnel** :
   - Aller sur GitHub.com
   - Settings > Developer settings > Personal access tokens > Tokens (classic)
   - Cliquer sur "Generate new token (classic)"
   - Donner un nom (ex: "SuiviDepense")
   - Cocher la permission `repo`
   - Cliquer sur "Generate token"
   - **Copier le token** (vous ne pourrez plus le voir après)

2. **Utiliser le token** :
   - Username : votre nom d'utilisateur GitHub
   - Password : le token que vous venez de créer

## Alternative : GitHub Desktop

Si vous préférez une interface graphique :
- Télécharger GitHub Desktop : https://desktop.github.com/
- Plus simple pour les débutants

