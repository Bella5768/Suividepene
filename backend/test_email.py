"""
Script de test pour vérifier la configuration email
Usage: python manage.py shell < test_email.py
Ou: python manage.py shell puis copier-coller le contenu
"""

import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'suivi_depense.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

print("=" * 60)
print("TEST DE CONFIGURATION EMAIL")
print("=" * 60)
print()

# Afficher la configuration
print("Configuration Email:")
print(f"  EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
print(f"  EMAIL_HOST: {settings.EMAIL_HOST}")
print(f"  EMAIL_PORT: {settings.EMAIL_PORT}")
print(f"  EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
print(f"  EMAIL_USE_SSL: {settings.EMAIL_USE_SSL}")
print(f"  EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
print(f"  EMAIL_HOST_PASSWORD: {'*' * len(settings.EMAIL_HOST_PASSWORD) if settings.EMAIL_HOST_PASSWORD else 'NON DÉFINI'}")
print(f"  DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
print()

# Demander l'email de test
email_test = input("Entrez votre email pour le test (ou appuyez sur Entrée pour annuler): ").strip()

if not email_test:
    print("Test annulé.")
    exit()

print()
print(f"Envoi d'un email de test à {email_test}...")
print()

try:
    # Test simple
    send_mail(
        subject='Test Email CSIG - Configuration',
        message='Ceci est un email de test pour vérifier la configuration SMTP.',
        from_email=settings.DEFAULT_FROM_EMAIL or 'support@csig.edu.gn',
        recipient_list=[email_test],
        fail_silently=False,
    )
    print("✅ Email envoyé avec succès !")
    print(f"   Vérifiez votre boîte de réception: {email_test}")
    
except Exception as e:
    print("❌ ERREUR lors de l'envoi de l'email:")
    print(f"   {str(e)}")
    print()
    print("Vérifications à faire:")
    print("  1. Vérifiez que EMAIL_HOST_USER et EMAIL_HOST_PASSWORD sont corrects")
    print("  2. Vérifiez votre connexion internet")
    print("  3. Vérifiez que le port 587 n'est pas bloqué par le pare-feu")
    print("  4. Si vous avez l'authentification à deux facteurs, utilisez un mot de passe d'application")
    import traceback
    print()
    print("Détails de l'erreur:")
    print(traceback.format_exc())

