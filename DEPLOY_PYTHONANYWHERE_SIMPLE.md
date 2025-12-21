# Guide Simple: Déployer sur PythonAnywhere

**Problème:** Le frontend React n'est pas construit  
**Solution:** Construire et déployer le frontend

---

## 🎯 Étapes Rapides

### Étape 1: Construire le Frontend (5 minutes)

**Sur votre ordinateur:**

```powershell
cd C:\wamp64\www\Suivi_depense\frontend

# Installer les dépendances
npm install

# Construire pour la production
npm run build
```

**Résultat:** Un dossier `dist/` avec les fichiers optimisés.

### Étape 2: Copier vers Django (2 minutes)

```powershell
# Copier les fichiers construits
Copy-Item -Path "C:\wamp64\www\Suivi_depense\frontend\dist\*" `
  -Destination "C:\wamp64\www\Suivi_depense\backend\depenses\static\depenses\" `
  -Recurse -Force

# Aller au backend
cd C:\wamp64\www\Suivi_depense\backend

# Collecter les fichiers statiques
.\venv\Scripts\python.exe manage.py collectstatic --noinput
```

### Étape 3: Tester Localement (2 minutes)

```powershell
# Démarrer le serveur
python manage.py runserver

# Ouvrir http://localhost:8000 dans le navigateur
# Vous devriez voir l'application React
```

### Étape 4: Pousser vers GitHub (2 minutes)

```powershell
cd C:\wamp64\www\Suivi_depense

git add -A
git commit -m "Frontend build for production"
git push origin main
```

### Étape 5: Déployer sur PythonAnywhere (5 minutes)

**Via Bash Console sur PythonAnywhere:**

```bash
# 1. Aller au répertoire du projet
cd /home/bella5768/Suividepene

# 2. Mettre à jour le code
git pull origin main

# 3. Activer l'environnement virtuel
source /home/bella5768/.virtualenvs/suividepene/bin/activate

# 4. Installer les dépendances
pip install -r backend/requirements.txt

# 5. Exécuter les migrations
cd backend
python manage.py migrate

# 6. Collecter les fichiers statiques
python manage.py collectstatic --noinput

# 7. Recharger l'application web
# (Allez sur le Dashboard et cliquez "Reload")
```

---

## ✅ Vérification

Après le déploiement, vérifiez:

1. **Frontend:** https://bella5768.pythonanywhere.com/
   - Devrait afficher l'application React

2. **API:** https://bella5768.pythonanywhere.com/api/
   - Devrait retourner du JSON

3. **Admin:** https://bella5768.pythonanywhere.com/admin/
   - Devrait afficher la page d'admin Django

---

## 🐛 Si Ça Ne Marche Pas

### Erreur: "Static files not found"

```bash
# Recollectez les fichiers
python manage.py collectstatic --noinput --clear
```

### Erreur: "Module not found"

```bash
# Réinstallez les dépendances
pip install --upgrade -r backend/requirements.txt
```

### Erreur: "CORS error" dans la console du navigateur

Vérifiez dans `backend/suivi_depense/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    'https://bella5768.pythonanywhere.com',
]
```

### Voir les logs d'erreur

Sur PythonAnywhere:
1. Allez sur votre application web
2. Onglet "Log files"
3. Consultez `error.log` et `server.log`

---

## 📋 Checklist Rapide

- [ ] Frontend construit (`npm run build`)
- [ ] Fichiers copiés vers Django
- [ ] `collectstatic` exécuté
- [ ] Code poussé vers GitHub
- [ ] Code mis à jour sur PythonAnywhere (`git pull`)
- [ ] Migrations exécutées
- [ ] `collectstatic` exécuté sur PythonAnywhere
- [ ] Application web rechargée
- [ ] Frontend visible à https://bella5768.pythonanywhere.com/

---

## 🚀 Résumé

| Étape | Commande | Temps |
|-------|----------|-------|
| 1 | `npm install && npm run build` | 5 min |
| 2 | Copier les fichiers | 2 min |
| 3 | `collectstatic` | 1 min |
| 4 | Tester localement | 2 min |
| 5 | `git push` | 1 min |
| 6 | Déployer sur PythonAnywhere | 5 min |
| **Total** | | **16 min** |

---

**C'est tout! Votre application devrait fonctionner.** 🎉
