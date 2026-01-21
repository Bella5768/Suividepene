#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'suivi_depense.settings')
django.setup()

from django.utils import timezone
from depenses.models import Plat, Menu, MenuPlat
from decimal import Decimal

print("Création des données de test pour la restauration...")

# Créer des plats de test
plats_data = [
    ('Riz Sauce', 'Riz blanc avec sauce tomate', 'Dejeuner', Decimal('15000')),
    ('Poulet Frit', 'Poulet frit avec frites', 'Dejeuner', Decimal('25000')),
    ('Salade', 'Salade verte fraîche', 'Dejeuner', Decimal('8000')),
    ('Yaourt', 'Yaourt nature', 'Dejeuner', Decimal('5000')),
]

for nom, description, categorie, prix in plats_data:
    plat, created = Plat.objects.get_or_create(
        nom=nom,
        defaults={
            'description': description,
            'categorie_restau': categorie,
            'prix_standard': prix,
            'actif': True
        }
    )
    print(f'Plat {plat.nom} créé: {created}')

# Créer un menu pour aujourd'hui
today = timezone.now().date()
menu, created = Menu.objects.get_or_create(
    date_menu=today,
    defaults={
        'publication_at': timezone.now(),
    }
)
print(f'Menu du {today} créé: {created}')

# Ajouter les plats au menu
plats = Plat.objects.filter(actif=True)
for i, plat in enumerate(plats):
    MenuPlat.objects.get_or_create(
        menu=menu,
        plat=plat,
        defaults={
            'prix_jour': plat.prix_standard,
            'ordre': i
        }
    )
    print(f'Plat {plat.nom} ajouté au menu')

print('Données de test créées avec succès!')
print(f'URL de commande publique: http://localhost:8000/commander')
