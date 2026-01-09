import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'suivi_depense.settings')
sys.path.insert(0, os.path.dirname(__file__))

try:
    django.setup()
    
    from depenses.models import Prevision, Categorie
    from datetime import datetime
    
    print("=== DEBUG PREVISIONS ===")
    
    # Verifier les categories
    categories = Categorie.objects.all()
    print(f"Categories disponibles: {categories.count()}")
    for cat in categories:
        print(f"  - {cat.nom} (ID: {cat.id})")
    
    # Verifier les previsions
    previsions = Prevision.objects.all()
    print(f"\nPrevisions existantes: {previsions.count()}")
    for prev in previsions:
        print(f"  - {prev.categorie.nom}: {prev.montant_prevu} GNF (Mois: {prev.mois})")
    
    # Tester l'API
    print("\n=== TEST API ===")
    mois_test = "2026-01-01"
    try:
        previsions_mois = Prevision.objects.filter(mois__startswith="2026-01")
        print(f"Previsions pour janvier 2026: {previsions_mois.count()}")
        
        # Tester le format de date
        mois_date = datetime.strptime("2026-01", '%Y-%m').date()
        mois_date = mois_date.replace(day=1)
        print(f"Date formatée: {mois_date}")
        
        previsions_filtrees = Prevision.objects.filter(mois=mois_date)
        print(f"Previsions avec date exacte: {previsions_filtrees.count()}")
        
    except Exception as e:
        print(f"Erreur API: {e}")
    
    print("\n=== CREATION TEST ===")
    # Creer une prevision de test
    try:
        categorie = Categorie.objects.first()
        if categorie:
            # Verifier le format du champ mois
            first_prev = Prevision.objects.first()
            if first_prev:
                print(f"Type du champ mois: {type(first_prev.mois)}")
                print(f"Valeur du champ mois: {first_prev.mois}")
            
            # Utiliser le bon format
            prevision, created = Prevision.objects.get_or_create(
                categorie=categorie,
                mois="2026-01-01",  # Format string
                defaults={
                    'montant_prevu': 1000000,
                    'statut': 'draft'
                }
            )
            if created:
                print(f"✅ Prevision de test cree: {prevision}")
            else:
                print(f"ℹ️  Prevision existe: {prevision}")
        else:
            print("❌ Aucune categorie disponible!")
    except Exception as e:
        print(f"❌ Erreur creation: {e}")
    
    print("\n=== FIN DEBUG ===")
    
except Exception as e:
    print(f"❌ Erreur generale: {e}")
    import traceback
    traceback.print_exc()
