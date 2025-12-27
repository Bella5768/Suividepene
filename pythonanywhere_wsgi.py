# +++++++++++ DJANGO +++++++++++
# Configuration WSGI pour PythonAnywhere
# Fichier à copier dans: /var/www/bella5768_pythonanywhere_com_wsgi.py

import os
import sys

# Chemin vers le projet
path = '/home/bella5768/Suividepene/backend'
if path not in sys.path:
    sys.path.append(path)

# Chemin vers le virtualenv
virtualenv_path = '/home/bella5768/.virtualenvs/suividepene'
if os.path.exists(virtualenv_path):
    activate_this = os.path.join(virtualenv_path, 'bin', 'activate_this.py')
    if os.path.exists(activate_this):
        exec(open(activate_this).read(), {'__file__': activate_this})

os.environ['DJANGO_SETTINGS_MODULE'] = 'suivi_depense.settings'

# Variables d'environnement pour la production
os.environ['DEBUG'] = 'False'
os.environ['USE_SQLITE'] = 'True'
os.environ['SECRET_KEY'] = 'votre-cle-secrete-a-changer-en-production-minimum-50-caracteres'
os.environ['ALLOWED_HOSTS'] = 'bella5768.pythonanywhere.com,localhost,127.0.0.1'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
