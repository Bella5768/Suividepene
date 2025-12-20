"""
Configuration Gunicorn pour la production
"""
import multiprocessing

# Adresse et port d'écoute
bind = "127.0.0.1:8000"

# Nombre de workers (généralement 2-4 x nombre de CPU)
workers = multiprocessing.cpu_count() * 2 + 1

# Type de worker
worker_class = "sync"

# Timeout
timeout = 120
keepalive = 5

# Logging
accesslog = "logs/gunicorn_access.log"
errorlog = "logs/gunicorn_error.log"
loglevel = "info"

# Process naming
proc_name = "suivi_depense"

# Worker timeout
graceful_timeout = 30

# Max requests (recycler les workers après N requêtes pour éviter les fuites mémoire)
max_requests = 1000
max_requests_jitter = 50

