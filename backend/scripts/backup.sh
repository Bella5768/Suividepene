#!/bin/bash
# Script de backup de la base de données
# Usage: ./backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/suivi_app/backups"
PROJECT_DIR="/home/suivi_app/suivi_depense/backend"

# Créer le dossier de backup s'il n'existe pas
mkdir -p $BACKUP_DIR

# Charger les variables d'environnement depuis .env
if [ -f "$PROJECT_DIR/.env" ]; then
    export $(cat $PROJECT_DIR/.env | grep -v '^#' | xargs)
fi

# Backup de la base de données
DB_NAME=${DB_NAME:-suivi_depense}
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-}
DB_HOST=${DB_HOST:-localhost}

echo "Création du backup de la base de données $DB_NAME..."

mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

if [ $? -eq 0 ]; then
    echo "Compression du backup..."
    gzip $BACKUP_DIR/backup_$DATE.sql
    
    echo "✅ Backup créé: $BACKUP_DIR/backup_$DATE.sql.gz"
    
    # Garder seulement les 30 derniers backups
    echo "Nettoyage des anciens backups (garder les 30 derniers)..."
    find $BACKUP_DIR -name "backup_*.sql.gz" -type f -mtime +30 -delete
    
    echo "✅ Backup terminé avec succès"
else
    echo "❌ Erreur lors de la création du backup"
    exit 1
fi

