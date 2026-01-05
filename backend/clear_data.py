import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'suivi_depense.settings')
sys.path.insert(0, os.path.dirname(__file__))

try:
    django.setup()
    
    from depenses.models import Prevision, Operation
    
    # Compter avant suppression
    nb_operations = Operation.objects.count()
    nb_previsions = Prevision.objects.count()
    
    print(f"Operations trouvees: {nb_operations}")
    print(f"Previsions trouvees: {nb_previsions}")
    
    # Effacer
    Operation.objects.all().delete()
    Prevision.objects.all().delete()
    
    print(f"\n✅ Operations effacees: {nb_operations}")
    print(f"✅ Previsions effacees: {nb_previsions}")
    print("\n✅ Termine! Le systeme est pret pour une utilisation reelle.")
    
except Exception as e:
    print(f"❌ Erreur: {e}")
    print("\nSi vous etes sur PythonAnywhere, utilisez:")
    print("cd ~/Suivi_depense/backend && python clear_data.py")
