import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'suivi_depense.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Créer le superutilisateur s'il n'existe pas
username = 'admin'
email = 'admin@csi.local'
password = 'admin123'

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f'Superutilisateur créé avec succès!')
    print(f'Username: {username}')
    print(f'Password: {password}')
else:
    print(f'Le superutilisateur "{username}" existe déjà.')



