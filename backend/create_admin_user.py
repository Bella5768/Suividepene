import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'suivi_depense.settings')
sys.path.insert(0, os.path.dirname(__file__))

try:
    django.setup()
    
    from django.contrib.auth.models import User
    from depenses.models import UserProfile
    
    print("=== CREATION SUPERUTILISATEUR ===")
    
    # Données du superutilisateur
    username = "admin"
    email = "admin@csig.edu.gn"
    password = "Admin123!@#"
    
    # Vérifier si l'utilisateur existe déjà
    if User.objects.filter(username=username).exists():
        user = User.objects.get(username=username)
        print(f"ℹ️  L'utilisateur '{username}' existe déjà")
        print(f"   - Email: {user.email}")
        print(f"   - Staff: {user.is_staff}")
        print(f"   - Superuser: {user.is_superuser}")
    else:
        # Créer le superutilisateur
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print(f"✅ Superutilisateur '{username}' créé avec succès")
        print(f"   - Email: {user.email}")
        print(f"   - Mot de passe: {password}")
    
    # Créer ou mettre à jour le profil
    profile, created = UserProfile.objects.get_or_create(user=user)
    profile.role = 'admin'
    profile.save()
    
    print(f"\n🔑 INFORMATIONS DE CONNEXION:")
    print(f"   URL: https://csig.pythonanywhere.com/admin/")
    print(f"   Utilisateur: {username}")
    print(f"   Mot de passe: {password}")
    print(f"   Email: {email}")
    
    print(f"\n📋 PRIVILÈGES DU SUPERUTILISATEUR:")
    print(f"   ✅ Accès à l'administration Django complète")
    print(f"   ✅ Gestion des utilisateurs et permissions")
    print(f"   ✅ Accès à toutes les données du système")
    print(f"   ✅ Configuration des prévisions et catégories")
    print(f"   ✅ Validation des commandes de restauration")
    print(f"   ✅ Génération de rapports et exports")
    
    print(f"\n⚠️  SÉCURITÉ:")
    print(f"   - Changez le mot de passe après la première connexion")
    print(f"   - Utilisez des mots de passe forts")
    print(f"   - Ne partagez pas ces identifiants")
    
except Exception as e:
    print(f"❌ Erreur: {e}")
    import traceback
    traceback.print_exc()
    print("\nSi vous êtes sur PythonAnywhere, utilisez:")
    print("cd ~/Suivi_depense/backend && python create_superuser.py")
