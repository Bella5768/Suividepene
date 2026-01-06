import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'suivi_depense.settings')
sys.path.insert(0, os.path.dirname(__file__))

try:
    django.setup()
    
    from depenses.models import Categorie, SousCategorie
    
    # Categories de base
    categories_data = [
        {'nom': 'Restauration', 'code': 'RESTAURATION'},
        {'nom': 'Hygiène', 'code': 'HYGIENE'},
        {'nom': 'Transport', 'code': 'TRANSPORT'},
        {'nom': 'Communication', 'code': 'COMMUNICATION'},
        {'nom': 'Maintenance', 'code': 'MAINTENANCE'},
        {'nom': 'Autres', 'code': 'AUTRES'},
    ]
    
    # Sous-categories pour la restauration
    sous_categories_data = [
        {'categorie_code': 'RESTAURATION', 'nom': 'Repas employés'},
        {'categorie_code': 'RESTAURATION', 'nom': 'Fournitures cuisine'},
        {'categorie_code': 'HYGIENE', 'nom': 'Produits nettoyage'},
        {'categorie_code': 'HYGIENE', 'nom': 'Articles toilette'},
        {'categorie_code': 'TRANSPORT', 'nom': 'Carburant'},
        {'categorie_code': 'TRANSPORT', 'nom': 'Transport personnel'},
        {'categorie_code': 'COMMUNICATION', 'nom': 'Internet'},
        {'categorie_code': 'COMMUNICATION', 'nom': 'Téléphone'},
        {'categorie_code': 'MAINTENANCE', 'nom': 'Entretien bâtiment'},
        {'categorie_code': 'MAINTENANCE', 'nom': 'Réparations'},
        {'categorie_code': 'AUTRES', 'nom': 'Divers'},
    ]
    
    print("Creation des categories...")
    for cat_data in categories_data:
        categorie, created = Categorie.objects.get_or_create(
            code=cat_data['code'],
            defaults={'nom': cat_data['nom']}
        )
        if created:
            print(f"✅ Categorie cree: {categorie.nom}")
        else:
            print(f"ℹ️  Categorie existe: {categorie.nom}")
    
    print("\nCreation des sous-categories...")
    for sc_data in sous_categories_data:
        categorie = Categorie.objects.get(code=sc_data['categorie_code'])
        sous_categorie, created = SousCategorie.objects.get_or_create(
            categorie=categorie,
            nom=sc_data['nom'],
            defaults={}
        )
        if created:
            print(f"✅ Sous-categorie cree: {sous_categorie.nom}")
        else:
            print(f"ℹ️  Sous-categorie existe: {sous_categorie.nom}")
    
    print(f"\n✅ Termine!")
    print(f"Categories: {Categorie.objects.count()}")
    print(f"Sous-categories: {SousCategorie.objects.count()}")
    print("\nVous pouvez maintenant creer des previsions!")
    
except Exception as e:
    print(f"❌ Erreur: {e}")
    print("\nSi vous etes sur PythonAnywhere, utilisez:")
    print("cd ~/Suivi_depense/backend && python create_categories.py")
