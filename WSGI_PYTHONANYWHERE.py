import sys
import os

# Ajoute le chemin de ton projet
path = '/home/bella5768/Suividepene/backend'
if path not in sys.path:
    sys.path.insert(0, path)

# Configure Django
os.environ['DJANGO_SETTINGS_MODULE'] = 'suivi_depense.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
