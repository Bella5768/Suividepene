# Configuration Email - Outlook/Office 365

## Configuration SMTP Outlook

Le système est configuré pour utiliser le serveur SMTP d'Outlook/Office 365.

## Paramètres SMTP Outlook

- **Serveur SMTP** : `smtp.office365.com`
- **Port** : `587`
- **TLS** : Activé (requis)
- **SSL** : Désactivé

## Configuration dans le fichier .env

Créez un fichier `.env` dans le dossier `backend/` avec le contenu suivant :

```env
# Configuration Email - Outlook/Office 365
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=votre-email@outlook.com
EMAIL_HOST_PASSWORD=votre-mot-de-passe
DEFAULT_FROM_EMAIL=votre-email@outlook.com
SERVER_EMAIL=votre-email@outlook.com
```

## Remplacez les valeurs suivantes :

1. **EMAIL_HOST_USER** : Votre adresse email Outlook complète (ex: `nom@outlook.com` ou `nom@hotmail.com`)
2. **EMAIL_HOST_PASSWORD** : Votre mot de passe Outlook
3. **DEFAULT_FROM_EMAIL** : La même adresse email que EMAIL_HOST_USER
4. **SERVER_EMAIL** : La même adresse email que EMAIL_HOST_USER

## Types de comptes Outlook supportés

- Outlook.com (outlook.com, hotmail.com, live.com)
- Office 365 (comptes professionnels)

## Authentification

Outlook/Office 365 nécessite :
- L'authentification SMTP activée sur votre compte
- Votre mot de passe normal (ou un mot de passe d'application si l'authentification à deux facteurs est activée)

## Si vous avez l'authentification à deux facteurs (2FA)

Si votre compte Outlook a l'authentification à deux facteurs activée, vous devez créer un **mot de passe d'application** :

1. Allez sur https://account.microsoft.com/security
2. Connectez-vous avec votre compte Outlook
3. Allez dans "Sécurité" > "Mots de passe d'application"
4. Créez un nouveau mot de passe d'application
5. Utilisez ce mot de passe dans `EMAIL_HOST_PASSWORD`

## Test de la configuration

Pour tester si la configuration fonctionne, vous pouvez utiliser le shell Django :

```python
python manage.py shell
```

Puis dans le shell :

```python
from django.core.mail import send_mail
send_mail(
    'Test Email',
    'Ceci est un test',
    'votre-email@outlook.com',
    ['destinataire@example.com'],
    fail_silently=False,
)
```

## Fonctionnalité automatique

Une fois configuré, lorsqu'une commande est validée :
- Si l'utilisateur a fourni un email valide, il recevra automatiquement un email de confirmation
- L'email sera envoyé depuis votre adresse Outlook configurée
- L'email contient tous les détails de la commande validée

## Dépannage

### Erreur "Authentication failed"
- Vérifiez que votre mot de passe est correct
- Si vous avez 2FA, utilisez un mot de passe d'application
- Vérifiez que l'authentification SMTP est activée sur votre compte

### Erreur "Connection refused"
- Vérifiez que le port 587 n'est pas bloqué par votre pare-feu
- Vérifiez votre connexion internet

### Erreur "TLS/SSL required"
- Assurez-vous que `EMAIL_USE_TLS=True` et `EMAIL_USE_SSL=False`
- Le port doit être 587 (pas 465)
