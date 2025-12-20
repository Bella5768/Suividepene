"""
Script pour assigner la permission de validation des commandes à un utilisateur
Usage dans le shell Django: exec(open('assign_validation_permission.py').read())
"""

from django.contrib.auth.models import User
from depenses.models import UserPermission

def assign_validation_permission(username):
    """Assigner la permission de validation des commandes à un utilisateur"""
    try:
        user = User.objects.get(username=username)
        
        # Créer ou mettre à jour la permission
        permission, created = UserPermission.objects.update_or_create(
            utilisateur=user,
            fonctionnalite='restauration_valider_commandes',
            defaults={
                'peut_voir': True,
                'peut_creer': False,
                'peut_modifier': True,  # C'est ce qui permet de valider
                'peut_supprimer': False,
            }
        )
        
        if created:
            print(f"✅ Permission de validation créée pour l'utilisateur '{username}'")
        else:
            print(f"✅ Permission de validation mise à jour pour l'utilisateur '{username}'")
        
        print(f"   - peut_voir: {permission.peut_voir}")
        print(f"   - peut_modifier: {permission.peut_modifier} (nécessaire pour valider)")
        
        return permission
    except User.DoesNotExist:
        print(f"❌ Erreur: L'utilisateur '{username}' n'existe pas")
        return None

# Assigner la permission à "hawa bah"
username = 'hawa bah'
assign_validation_permission(username)

# Vérifier que la permission a bien été assignée
try:
    user = User.objects.get(username=username)
    permission = UserPermission.objects.filter(
        utilisateur=user,
        fonctionnalite='restauration_valider_commandes'
    ).first()
    
    if permission and permission.peut_modifier:
        print(f"\n✅ Vérification: L'utilisateur '{username}' a bien la permission de valider les commandes")
    else:
        print(f"\n⚠️  Attention: La permission n'a pas été correctement assignée")
except User.DoesNotExist:
    print(f"\n❌ L'utilisateur '{username}' n'existe pas")

