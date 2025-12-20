# Quick Start - Production Deployment

**Time to Deploy:** ~30 minutes  
**Difficulty:** Intermediate

---

## 1. Prepare Environment (5 minutes)

```bash
# Copy production environment template
cp backend/.env.production backend/.env

# Edit with your values
nano backend/.env
```

**Required values to set:**
- `SECRET_KEY` - Generate: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
- `ALLOWED_HOSTS` - Your domain(s)
- `DB_PASSWORD` - Database password
- `DB_HOST` - Database server
- `CORS_ALLOWED_ORIGINS` - Your frontend domain
- `EMAIL_HOST_USER` - Email account
- `EMAIL_HOST_PASSWORD` - Email password

---

## 2. Setup Database (5 minutes)

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE suivi_depense_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Create user
mysql -u root -p -e "CREATE USER 'suivi_user'@'localhost' IDENTIFIED BY 'your-password';"

# Grant privileges
mysql -u root -p -e "GRANT ALL PRIVILEGES ON suivi_depense_prod.* TO 'suivi_user'@'localhost'; FLUSH PRIVILEGES;"

# Verify
mysql -u suivi_user -p -e "SELECT DATABASE();"
```

---

## 3. Install Backend (5 minutes)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Verify configuration
python manage.py check --deploy
```

---

## 4. Build Frontend (5 minutes)

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Verify build
ls -lh dist/
```

---

## 5. Start Application (5 minutes)

### Option A: Development Server (Testing)

```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

### Option B: Production Server (Gunicorn)

```bash
cd backend
gunicorn --config gunicorn_config.py suivi_depense.wsgi:application
```

### Option C: Systemd Service (Recommended)

```bash
# Create service file
sudo nano /etc/systemd/system/suivi-depense.service
```

Paste:
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

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable suivi-depense
sudo systemctl start suivi-depense
sudo systemctl status suivi-depense
```

---

## 6. Configure Nginx (5 minutes)

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/suivi-depense
```

Paste:
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

    root /var/www/suivi_depense/backend/depenses/static;

    location /static/ {
        alias /var/www/suivi_depense/backend/depenses/static/;
        expires 30d;
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
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable and test:
```bash
sudo ln -s /etc/nginx/sites-available/suivi-depense /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 7. Setup SSL Certificate (5 minutes)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 8. Verify Deployment (5 minutes)

```bash
# Check application
curl https://yourdomain.com/

# Check API
curl https://yourdomain.com/api/

# Check logs
sudo journalctl -u suivi-depense -n 50

# Check Nginx
sudo systemctl status nginx

# Check database
mysql -u suivi_user -p suivi_depense_prod -e "SELECT COUNT(*) FROM django_migrations;"
```

---

## Troubleshooting

### Application won't start
```bash
# Check Django configuration
python manage.py check --deploy

# Check logs
sudo journalctl -u suivi-depense -n 100

# Test database connection
python manage.py dbshell
```

### Static files not loading
```bash
# Recollect static files
python manage.py collectstatic --noinput --clear

# Check permissions
sudo chown -R www-data:www-data /var/www/suivi_depense/backend/depenses/static
```

### CORS errors
```bash
# Verify CORS_ALLOWED_ORIGINS in .env
grep CORS_ALLOWED_ORIGINS backend/.env

# Update if needed and restart
sudo systemctl restart suivi-depense
```

### Database connection issues
```bash
# Test connection
mysql -u suivi_user -p -h db.yourdomain.com suivi_depense_prod

# Check .env settings
grep DB_ backend/.env
```

---

## Next Steps

1. ✅ **Verify everything is working**
   - Test login
   - Test CRUD operations
   - Test exports
   - Check logs

2. **Setup monitoring**
   - Configure Sentry for error tracking
   - Setup log aggregation
   - Configure alerts

3. **Setup backups**
   - Configure automated database backups
   - Test restore procedure
   - Document backup location

4. **Setup monitoring**
   - Monitor application health
   - Monitor database performance
   - Monitor server resources

---

## Quick Commands Reference

```bash
# View logs
sudo journalctl -u suivi-depense -f

# Restart application
sudo systemctl restart suivi-depense

# Check status
sudo systemctl status suivi-depense

# View database
mysql -u suivi_user -p suivi_depense_prod

# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Check configuration
python manage.py check --deploy
```

---

## Security Checklist

- [ ] DEBUG=False in .env
- [ ] SECRET_KEY is strong and unique
- [ ] ALLOWED_HOSTS configured
- [ ] CORS_ALLOWED_ORIGINS restricted
- [ ] Email credentials in .env (not in code)
- [ ] Database password in .env (not in code)
- [ ] SSL certificate installed
- [ ] HTTPS enforced
- [ ] Firewall configured
- [ ] Regular backups enabled

---

**Status:** ✅ Ready to Deploy

Follow these steps in order and you'll have a production-ready application in ~30 minutes!
