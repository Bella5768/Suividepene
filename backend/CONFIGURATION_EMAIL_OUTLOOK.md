# Configuration Email Outlook - CSIG

## ✅ Configuration déjà effectuée

Le système est **déjà configuré** avec les identifiants email CSIG :

- **Email** : `support@csig.edu.gn`
- **Serveur SMTP** : `smtp.office365.com`
- **Port** : `587`
- **TLS** : Activé

## 🚀 Prêt à utiliser

**Aucune configuration supplémentaire n'est nécessaire !** Le système utilisera automatiquement l'email CSIG pour envoyer les confirmations de commande.

## 📧 Fonctionnement

Lorsqu'une commande est validée :
- ✅ Un email de confirmation est envoyé automatiquement
- ✅ L'email est envoyé depuis `support@csig.edu.gn`
- ✅ L'email contient tous les détails de la commande validée

## 🧪 Test

Pour tester l'envoi d'email, vous pouvez :

1. Créer une commande avec un email valide
2. Valider la commande
3. L'utilisateur recevra automatiquement un email de confirmation

## 📝 Note

Les identifiants email sont configurés directement dans le code pour faciliter l'utilisation. 
Si vous devez changer ces identifiants, modifiez le fichier `backend/suivi_depense/settings.py`.

## 🔍 Vérification

Si vous voulez vérifier la configuration, les paramètres sont dans :
- `backend/suivi_depense/settings.py` (lignes 189-198)

Les emails seront envoyés avec :
- **De** : `support@csig.edu.gn`
- **Nom d'affichage** : CSIG (dans le template email)
