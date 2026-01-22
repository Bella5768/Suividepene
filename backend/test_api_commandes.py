#!/usr/bin/env python
import os
import django
from django.contrib.auth.models import User
from depenses.models import Commande, CommandeLigne
from depenses.serializers import CommandeSerializer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'suivi_depense.settings')
django.setup()

print("=== Test API Commandes ===")

# Vérifier s'il y a des commandes
commandes = Commande.objects.all()[:3]
print(f"Nombre de commandes: {commandes.count()}")

for cmd in commandes:
    print(f"\nCommande #{cmd.id}:")
    print(f"  Utilisateur: {cmd.utilisateur_nom or cmd.utilisateur}")
    print(f"  Date: {cmd.date_commande}")
    print(f"  Nombre de lignes: {cmd.lignes.count()}")
    
    # Vérifier les lignes
    for ligne in cmd.lignes.all():
        print(f"    Ligne #{ligne.id}:")
        print(f"      Menu plat ID: {ligne.menu_plat.id}")
        print(f"      Plat nom: {ligne.menu_plat.plat.nom if ligne.menu_plat and ligne.menu_plat.plat else 'N/A'}")
        print(f"      Quantité: {ligne.quantite}")
    
    # Tester le serializer
    serializer = CommandeSerializer(cmd)
    data = serializer.data
    print(f"  Serializer lignes: {len(data.get('lignes', []))}")
    
    for i, ligne_data in enumerate(data.get('lignes', [])):
        print(f"    Ligne #{i+1} plat_nom: {ligne_data.get('plat_nom', 'N/A')}")

print("\n=== Fin du test ===")
