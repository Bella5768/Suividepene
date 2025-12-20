# Production Deployment Guide - Suivi des Dépenses

**Last Updated:** 2025-12-20  
**Status:** Ready for Production Deployment

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Security Hardening](#security-hardening)
7. [Monitoring & Logging](#monitoring--logging)
8. [Backup & Recovery](#backup--recovery)
9. [Performance Tuning](#performance-tuning)
10. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Security Verification

- [ ] **SECRET_KEY**: Generated and stored in environment variable (not in code)
- [ ] **DEBUG**: Set to `False` in production
- [ ] **ALLOWED_HOSTS**: Configured with production domain
- [ ] **CORS_ALLOWED_ORIGINS**: Restricted to production domain only
- [ ] **Email Credentials**: Stored in environment variables (not in code)
- [ ] **Database Password**: Stored securely (not in code)
- [ ] **SSL/TLS Certificate**: Obtained and configured
- [ ] **HTTPS**: Enabled and enforced

### Code Quality

- [ ] All tests passing: `python manage.py test`
- [ ] No security warnings: `python manage.py check --deploy`
- [ ] Database migrations applied: `python manage.py migrate`
- [ ] Static files collected: `python manage.py collectstatic --noinput`
- [ ] Frontend built: `npm run build`
- [ ] No console errors in production build

### Infrastructure

- [ ] Database server running (MySQL 8.0+)
- [ ] Redis server running (for caching/Celery)
- [ ] Reverse proxy configured (Nginx)
- [ ] SSL certificates installed
- [ ] Firewall rules configured
- [ ] Backup system configured
- [ ] Monitoring tools installed
- [ ] Log aggregation configured

### Documentation

- [ ] Deployment runbook created
- [ ] Rollback procedure documented
- [ ] Emergency contacts listed
- [ ] Incident response plan ready

---

## Environment Configuration

### 1. Create Production `.env` File

```bash
# backend/.env (NEVER commit this file)

# Django Settings
SECRET_KEY=your-generated-secret-key-here-min-50-chars
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com

# Database
DB_ENGINE=django.db.backends.mysql
DB_NAME=suivi_depense_prod
DB_USER=suivi_user
DB_PASSWORD=strong-password-here
DB_HOST=db.yourdomain.com
DB_PORT=3306

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=support@yourdomain.com
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=support@yourdomain.com

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000

# Sentry (Error Tracking)
SENTRY_DSN=your-sentry-dsn-here

# Redis (Caching)
REDIS_URL=redis://localhost:6379/0

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### 2. Generate SECRET_KEY

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 3. Verify Configuration

```bash
python manage.py check --deploy
```

---

## Database Setup

### 1. Create Production Database

```sql
CREATE DATABASE suivi_depense_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'suivi_user'@'localhost' IDENTIFIED BY 'strong-password-here';
GRANT ALL PRIVILEGES ON suivi_depense_prod.* TO 'suivi_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Run Migrations

```bash
cd backend
python manage.py migrate --database=default
```

### 3. Create Superuser

```bash
python manage.py createsuperuser
```

### 4. Load Initial Data (Optional)

```bash
python manage.py loaddata initial_categories.json
```

### 5. Verify Database

```bash
python manage.py dbshell
SHOW TABLES;
SELECT COUNT(*) FROM django_migrations;
```

---

## Backend Deployment

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Collect Static Files

```bash
python manage.py collectstatic --noinput --clear
```

### 3. Configure Gunicorn

Create `backend/gunicorn_config.py`:

```python
import multiprocessing

bind = "0.0.0.0:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 50
preload_app = True
access_log = "/var/log/gunicorn/access.log"
error_log = "/var/log/gunicorn/error.log"
loglevel = "info"
```

### 4. Start Gunicorn

```bash
gunicorn suivi_depense.wsgi:application \
  --config gunicorn_config.py \
  --bind 0.0.0.0:8000
```

### 5. Configure Systemd Service

Create `/etc/systemd/system/suivi-depense.service`:

```ini
[Unit]
Description=Suivi des Dépenses Django Application
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/var/www/suivi_depense/backend
Environment="PATH=/var/www/suivi_depense/backend/venv/bin"
EnvironmentFile=/var/www/suivi_depense/backend/.env
ExecStart=/var/www/suivi_depense/backend/venv/bin/gunicorn \
  --config gunicorn_config.py \
  suivi_depense.wsgi:application
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable suivi-depense
sudo systemctl start suivi-depense
```

---

## Frontend Deployment

### 1. Build Production Bundle

```bash
cd frontend
npm install
npm run build
```

### 2. Configure Nginx

Create `/etc/nginx/sites-available/suivi-depense`:

```nginx
upstream django {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 10M;
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;
    gzip_min_length 1000;

    root /var/www/suivi_depense/backend/depenses/static;

    location /static/ {
        alias /var/www/suivi_depense/backend/depenses/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /var/www/suivi_depense/backend/media/;
        expires 7d;
    }

    location /api/ {
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/suivi-depense /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Setup SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Security Hardening

### 1. Enable HTTPS Everywhere

✅ Already configured in settings.py for production

### 2. Configure Security Headers

Add to Nginx configuration:

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

### 3. Configure Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 4. Database Security

```sql
-- Revoke unnecessary privileges
REVOKE ALL PRIVILEGES ON *.* FROM 'suivi_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON suivi_depense_prod.* TO 'suivi_user'@'localhost';

-- Enable binary logging for backups
SET GLOBAL binlog_format = 'ROW';
```

### 5. Regular Security Updates

```bash
sudo apt update && sudo apt upgrade -y
sudo apt autoremove -y
```

---

## Monitoring & Logging

### 1. Configure Sentry for Error Tracking

```bash
pip install sentry-sdk
```

In `settings.py`:

```python
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=config('SENTRY_DSN', default=''),
    integrations=[DjangoIntegration()],
    traces_sample_rate=0.1,
    send_default_pii=False,
    environment='production',
)
```

### 2. Configure Logging

Create `backend/logging_config.py`:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s'
        }
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/suivi-depense/django.log',
            'maxBytes': 1024 * 1024 * 10,  # 10MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['file', 'console'],
        'level': 'INFO',
    },
}
```

### 3. Monitor Application Health

```bash
# Create health check endpoint
curl https://yourdomain.com/api/health/
```

### 4. Monitor Database Performance

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

---

## Backup & Recovery

### 1. Automated Database Backups

Create `/usr/local/bin/backup-suivi-depense.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backups/suivi-depense"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="suivi_depense_prod"
DB_USER="suivi_user"

mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup media files
tar -czf $BACKUP_DIR/media_$DATE.tar.gz /var/www/suivi_depense/backend/media/

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

Add to crontab:

```bash
0 2 * * * /usr/local/bin/backup-suivi-depense.sh
```

### 2. Restore from Backup

```bash
# Restore database
gunzip < /backups/suivi-depense/db_20251220_020000.sql.gz | mysql -u suivi_user -p suivi_depense_prod

# Restore media files
tar -xzf /backups/suivi-depense/media_20251220_020000.tar.gz -C /
```

---

## Performance Tuning

### 1. Database Optimization

```sql
-- Analyze tables
ANALYZE TABLE categorie;
ANALYZE TABLE operation;
ANALYZE TABLE prevision;
ANALYZE TABLE commande;

-- Check index usage
SELECT * FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = 'suivi_depense_prod';
```

### 2. Redis Caching

```python
# In settings.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': config('REDIS_URL', default='redis://127.0.0.1:6379/0'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'CONNECTION_POOL_KWARGS': {'max_connections': 50},
        }
    }
}
```

### 3. Frontend Optimization

- ✅ Code splitting configured
- ✅ Asset minification enabled
- ✅ Gzip compression configured
- ✅ Cache headers configured

### 4. Load Testing

```bash
# Install Apache Bench
sudo apt install apache2-utils

# Run load test
ab -n 1000 -c 10 https://yourdomain.com/
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check Django configuration
python manage.py check --deploy

# Check Gunicorn logs
journalctl -u suivi-depense -n 50

# Test database connection
python manage.py dbshell
```

### High Memory Usage

```bash
# Check Gunicorn workers
ps aux | grep gunicorn

# Reduce worker count in gunicorn_config.py
workers = 4  # Reduce from default
```

### Database Connection Issues

```bash
# Test connection
mysql -u suivi_user -p -h db.yourdomain.com suivi_depense_prod

# Check connection pooling
SHOW PROCESSLIST;
```

### Static Files Not Loading

```bash
# Recollect static files
python manage.py collectstatic --noinput --clear

# Check Nginx configuration
sudo nginx -t
```

### CORS Errors

```bash
# Verify CORS_ALLOWED_ORIGINS in .env
echo $CORS_ALLOWED_ORIGINS

# Check browser console for specific error
# Update CORS_ALLOWED_ORIGINS if needed
```

---

## Rollback Procedure

### Quick Rollback

```bash
# Stop current version
sudo systemctl stop suivi-depense

# Restore from backup
git checkout previous-tag
python manage.py migrate --fake-initial

# Restart
sudo systemctl start suivi-depense
```

### Database Rollback

```bash
# Restore from backup
gunzip < /backups/suivi-depense/db_previous.sql.gz | mysql -u suivi_user -p suivi_depense_prod

# Verify
python manage.py migrate --check
```

---

## Monitoring Commands

```bash
# Check application status
sudo systemctl status suivi-depense

# View recent logs
sudo journalctl -u suivi-depense -n 100 -f

# Check database
mysql -u suivi_user -p -e "SELECT COUNT(*) FROM suivi_depense_prod.depenses_operation;"

# Check disk space
df -h

# Check memory usage
free -h

# Monitor real-time
htop
```

---

## Post-Deployment Verification

- [ ] Application loads without errors
- [ ] Login works correctly
- [ ] All CRUD operations function
- [ ] Exports (PDF, Excel, CSV) work
- [ ] Email notifications send
- [ ] API rate limiting works
- [ ] Static files load quickly
- [ ] Database queries are fast
- [ ] Error tracking (Sentry) works
- [ ] Backups complete successfully

---

## Support & Escalation

**Emergency Contact:** [Your contact info]  
**Incident Response:** [Your procedure]  
**Escalation Path:** [Your escalation path]

---

**Deployment completed successfully!** 🎉
