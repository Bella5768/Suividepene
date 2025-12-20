# Production Deployment Checklist

**Project:** Suivi des Dépenses - CSIG  
**Date:** 2025-12-20  
**Status:** Ready for Deployment

---

## Pre-Deployment Phase (1-2 weeks before)

### Code Preparation
- [ ] All features tested locally
- [ ] No console errors in development
- [ ] All tests passing: `python manage.py test`
- [ ] Code reviewed by team
- [ ] No hardcoded credentials in code
- [ ] No debug statements left in code
- [ ] Git history clean and documented

### Security Audit
- [ ] Run Django security check: `python manage.py check --deploy`
- [ ] Review all environment variables
- [ ] Verify SECRET_KEY is not in code
- [ ] Verify DEBUG is False by default
- [ ] Verify email credentials are not hardcoded
- [ ] Check for SQL injection vulnerabilities
- [ ] Check for XSS vulnerabilities
- [ ] Verify CSRF protection enabled
- [ ] Review authentication/authorization

### Documentation
- [ ] Deployment guide reviewed
- [ ] Runbook created
- [ ] Rollback procedure documented
- [ ] Emergency contacts listed
- [ ] API documentation complete
- [ ] Database schema documented

### Team Preparation
- [ ] Deployment team trained
- [ ] On-call schedule established
- [ ] Communication plan ready
- [ ] Incident response plan ready

---

## Infrastructure Setup (1 week before)

### Server Preparation
- [ ] Production server provisioned
- [ ] OS updated and patched
- [ ] Firewall configured
- [ ] SSH keys configured
- [ ] Monitoring tools installed
- [ ] Log aggregation configured

### Database Setup
- [ ] MySQL 8.0+ installed
- [ ] Database created: `suivi_depense_prod`
- [ ] Database user created with limited privileges
- [ ] Backups configured
- [ ] Replication configured (if applicable)
- [ ] Connection pooling configured

### Web Server Setup
- [ ] Nginx installed and configured
- [ ] SSL certificate obtained (Let's Encrypt)
- [ ] SSL certificate installed
- [ ] Nginx configuration tested: `sudo nginx -t`
- [ ] Gzip compression configured
- [ ] Cache headers configured

### Application Server Setup
- [ ] Python 3.8+ installed
- [ ] Virtual environment created
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] Gunicorn configured
- [ ] Systemd service created
- [ ] Redis installed and configured

### Monitoring Setup
- [ ] Sentry account created
- [ ] Sentry DSN configured
- [ ] Application health check endpoint ready
- [ ] Monitoring dashboards created
- [ ] Alerting rules configured
- [ ] Log rotation configured

---

## Pre-Deployment Testing (3-5 days before)

### Staging Environment
- [ ] Staging environment mirrors production
- [ ] All code deployed to staging
- [ ] Database migrated to staging
- [ ] Backups tested on staging
- [ ] Load testing completed on staging
- [ ] All features tested on staging

### Security Testing
- [ ] SSL/TLS certificate valid
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] CORS properly configured
- [ ] Rate limiting working
- [ ] Authentication working
- [ ] Authorization working

### Performance Testing
- [ ] Response time acceptable (< 200ms p95)
- [ ] Database queries optimized
- [ ] Frontend bundle size acceptable (< 500KB gzipped)
- [ ] Load test passed (1000 concurrent users)
- [ ] Memory usage acceptable
- [ ] CPU usage acceptable

### Integration Testing
- [ ] API endpoints tested
- [ ] Export functionality tested (PDF, Excel, CSV)
- [ ] Email sending tested
- [ ] File uploads tested
- [ ] Search functionality tested
- [ ] Filtering functionality tested
- [ ] Pagination tested

---

## Deployment Day

### Pre-Deployment (2 hours before)

#### Final Checks
- [ ] All team members available
- [ ] Communication channels open
- [ ] Rollback plan reviewed
- [ ] Backup verified
- [ ] Database snapshot taken
- [ ] Current version tagged in Git

#### Environment Verification
- [ ] Production .env file ready
- [ ] All secrets configured
- [ ] Database connection tested
- [ ] Redis connection tested
- [ ] Email service tested
- [ ] File storage tested

### Deployment (Execution)

#### Backend Deployment
- [ ] Pull latest code: `git pull origin main`
- [ ] Verify code: `git log --oneline -5`
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Run migrations: `python manage.py migrate`
- [ ] Collect static files: `python manage.py collectstatic --noinput`
- [ ] Run security check: `python manage.py check --deploy`
- [ ] Restart application: `sudo systemctl restart suivi-depense`
- [ ] Verify application started: `sudo systemctl status suivi-depense`

#### Frontend Deployment
- [ ] Build frontend: `npm run build`
- [ ] Verify build output
- [ ] Deploy to static file location
- [ ] Verify static files accessible
- [ ] Clear browser cache (or verify cache busting)

#### Nginx Deployment
- [ ] Update Nginx configuration if needed
- [ ] Test Nginx configuration: `sudo nginx -t`
- [ ] Reload Nginx: `sudo systemctl reload nginx`
- [ ] Verify Nginx running: `sudo systemctl status nginx`

#### Verification
- [ ] Application loads: `curl https://yourdomain.com/`
- [ ] API responds: `curl https://yourdomain.com/api/`
- [ ] Login works
- [ ] Dashboard loads
- [ ] No console errors
- [ ] Static files load
- [ ] Images load
- [ ] CSS applied correctly

### Post-Deployment (30 minutes after)

#### Smoke Tests
- [ ] Homepage loads
- [ ] Login page loads
- [ ] Can login with test account
- [ ] Dashboard displays data
- [ ] Can create operation
- [ ] Can view operations list
- [ ] Can export data
- [ ] Can view reports
- [ ] Email notifications send
- [ ] Error tracking (Sentry) working

#### Performance Verification
- [ ] Response times acceptable
- [ ] No database errors
- [ ] No application errors
- [ ] Memory usage normal
- [ ] CPU usage normal
- [ ] Disk space available

#### Monitoring Verification
- [ ] Logs flowing to aggregation service
- [ ] Alerts configured and working
- [ ] Dashboards showing data
- [ ] Error tracking receiving events
- [ ] Backup job completed

---

## Post-Deployment (24 hours)

### Monitoring
- [ ] Application running smoothly
- [ ] No errors in logs
- [ ] No performance issues
- [ ] User feedback positive
- [ ] All features working
- [ ] Backups completing successfully

### Documentation
- [ ] Deployment documented
- [ ] Any issues documented
- [ ] Lessons learned captured
- [ ] Runbook updated if needed

### Team Debriefing
- [ ] Team debriefing completed
- [ ] Issues discussed
- [ ] Improvements identified
- [ ] Follow-up tasks assigned

---

## Rollback Procedure (If Needed)

### Immediate Actions
- [ ] Notify team
- [ ] Stop current deployment
- [ ] Assess issue severity
- [ ] Decide on rollback

### Rollback Steps
- [ ] Stop application: `sudo systemctl stop suivi-depense`
- [ ] Checkout previous version: `git checkout previous-tag`
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Restore database: `gunzip < backup.sql.gz | mysql -u user -p db`
- [ ] Collect static files: `python manage.py collectstatic --noinput`
- [ ] Start application: `sudo systemctl start suivi-depense`
- [ ] Verify application: `curl https://yourdomain.com/`

### Post-Rollback
- [ ] Notify users
- [ ] Document issue
- [ ] Root cause analysis
- [ ] Plan fix
- [ ] Schedule re-deployment

---

## Critical Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Deployment Lead | [Name] | [Phone] | [Email] |
| Database Admin | [Name] | [Phone] | [Email] |
| System Admin | [Name] | [Phone] | [Email] |
| On-Call | [Name] | [Phone] | [Email] |

---

## Deployment Timeline

| Phase | Duration | Start Time | End Time |
|-------|----------|-----------|----------|
| Pre-deployment checks | 30 min | T-30min | T-0min |
| Backend deployment | 10 min | T+0min | T+10min |
| Frontend deployment | 5 min | T+10min | T+15min |
| Smoke tests | 15 min | T+15min | T+30min |
| Monitoring verification | 15 min | T+30min | T+45min |
| **Total** | **75 min** | | |

---

## Success Criteria

- [ ] Application loads without errors
- [ ] All CRUD operations work
- [ ] Exports function correctly
- [ ] Email notifications send
- [ ] API rate limiting works
- [ ] Security headers present
- [ ] SSL certificate valid
- [ ] Database queries fast
- [ ] No errors in logs
- [ ] Monitoring shows healthy metrics

---

## Sign-Off

- [ ] Deployment Lead Approval: _________________ Date: _______
- [ ] QA Lead Approval: _________________ Date: _______
- [ ] Operations Lead Approval: _________________ Date: _______

---

**Deployment Status:** ✅ READY

All systems prepared and tested. Ready for production deployment.
