# 🔍 Dépannage Email - Les emails ne partent pas

## 📋 Vérifications à faire

### 1. Vérifier les logs Django

Quand vous validez une commande, regardez la console/terminal où Django tourne. Vous devriez voir des messages comme :
- `📧 Tentative d'envoi d'email pour la commande #X`
- `✅ Email envoyé avec succès` ou `❌ ERREUR: ...`

### 2. Tester la configuration email

**Option A : Utiliser le script de test**
```bash
cd backend
venv\Scripts\activate
python manage.py shell < test_email.py
```

**Option B : Test manuel dans le shell Django**
```bash
cd backend
venv\Scripts\activate
python manage.py shell
```

Puis dans le shell :
```python
from django.core.mail import send_mail
from django.conf import settings

send_mail(
    'Test Email',
    'Ceci est un test',
    'support@csig.edu.gn',
    ['votre-email@example.com'],
    fail_silently=False,
)
```

### 3. Vérifier la configuration

Vérifiez que dans `backend/suivi_depense/settings.py` (lignes 189-198) :
- `EMAIL_HOST = 'smtp.office365.com'`
- `EMAIL_PORT = 587`
- `EMAIL_USE_TLS = True`
- `EMAIL_HOST_USER = 'support@csig.edu.gn'`
- `EMAIL_HOST_PASSWORD = 'gnnthnprwdlklnfd'`

### 4. Vérifier que l'utilisateur a un email valide

Pour les commandes publiques :
- L'email doit être fourni lors de la commande
- L'email ne doit PAS être un email généré (`@commande.local`)

Pour les utilisateurs connectés :
- L'utilisateur doit avoir un email valide dans son profil

## 🔧 Erreurs courantes et solutions

### Erreur "Authentication failed"
**Cause :** Mot de passe incorrect ou authentification SMTP désactivée
**Solution :**
- Vérifiez que le mot de passe est correct : `gnnthnprwdlklnfd`
- Si vous avez l'authentification à deux facteurs, créez un mot de passe d'application

### Erreur "Connection refused" ou "Connection timeout"
**Cause :** Problème de connexion réseau ou pare-feu
**Solution :**
- Vérifiez votre connexion internet
- Vérifiez que le port 587 n'est pas bloqué par le pare-feu
- Essayez depuis un autre réseau

### Erreur "TLS/SSL required"
**Cause :** Configuration TLS incorrecte
**Solution :**
- Assurez-vous que `EMAIL_USE_TLS=True` et `EMAIL_USE_SSL=False`
- Le port doit être 587 (pas 465)

### Aucune erreur mais l'email n'arrive pas
**Causes possibles :**
1. L'email est dans les spams
2. L'email de destination est invalide
3. Le serveur SMTP a bloqué l'envoi (trop d'emails, etc.)

**Solutions :**
- Vérifiez le dossier spam/courrier indésirable
- Vérifiez que l'email de destination est correct
- Attendez quelques minutes (délai de livraison)

## 📝 Vérifier les logs en temps réel

Quand vous validez une commande, les messages suivants apparaîtront dans la console Django :

```
📧 Tentative d'envoi d'email pour la commande #10
   Utilisateur: commande_20251217_abc123
   Email trouvé: client@example.com
   ✅ Email valide: client@example.com
   Configuration SMTP:
      Host: smtp.office365.com
      Port: 587
      TLS: True
      User: support@csig.edu.gn
      From: support@csig.edu.gn
   📤 Envoi de l'email en cours...
   ✅ Email envoyé avec succès à client@example.com
```

Si vous voyez des erreurs, notez-les et consultez les solutions ci-dessus.

## 🧪 Test rapide

Pour tester rapidement, validez une commande et regardez la console Django. Les messages vous indiqueront exactement ce qui se passe.

