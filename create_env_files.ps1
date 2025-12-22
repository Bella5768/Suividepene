# Script pour créer les fichiers .env pour le frontend
# Usage: .\create_env_files.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Création des fichiers .env" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$frontendPath = "frontend"

# Vérifier que le dossier frontend existe
if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Erreur: Le dossier 'frontend' n'existe pas !" -ForegroundColor Red
    exit 1
}

# Demander l'URL de l'API pour la production
Write-Host "Configuration de l'URL de l'API backend" -ForegroundColor Yellow
Write-Host "`nExemples:" -ForegroundColor Gray
Write-Host "  - PythonAnywhere: https://yourusername.pythonanywhere.com" -ForegroundColor Gray
Write-Host "  - Railway: https://your-app.railway.app" -ForegroundColor Gray
Write-Host "  - Render: https://your-app.onrender.com" -ForegroundColor Gray
Write-Host "  - VPS: https://api.votre-domaine.com`n" -ForegroundColor Gray

$apiUrl = Read-Host "Entrez l'URL de votre backend (ou appuyez sur Entrée pour laisser vide)"

# Créer .env.production
$prodEnvPath = Join-Path $frontendPath ".env.production"
$prodContent = @"
# Configuration pour la production
# Les variables d'environnement Vite doivent commencer par VITE_
VITE_API_URL=$apiUrl
"@

try {
    Set-Content -Path $prodEnvPath -Value $prodContent -Encoding UTF8
    Write-Host "✅ Créé: $prodEnvPath" -ForegroundColor Green
    Write-Host "   Contenu: VITE_API_URL=$apiUrl" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erreur lors de la création de $prodEnvPath" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Créer .env.local (pour développement)
$localEnvPath = Join-Path $frontendPath ".env.local"
$localContent = @"
# Configuration pour le développement local
# Ce fichier est ignoré par Git (.gitignore)
# Laisser vide pour utiliser le proxy Vite (localhost:8000)
VITE_API_URL=
"@

try {
    Set-Content -Path $localEnvPath -Value $localContent -Encoding UTF8
    Write-Host "✅ Créé: $localEnvPath" -ForegroundColor Green
    Write-Host "   Contenu: VITE_API_URL= (vide pour utiliser le proxy)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erreur lors de la création de $localEnvPath" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Créer .env.example (template)
$exampleEnvPath = Join-Path $frontendPath ".env.example"
$exampleContent = @"
# Template des variables d'environnement
# Copiez ce fichier en .env.local pour le développement local
# ou .env.production pour la production

# URL de l'API backend
# En développement : laisser vide (utilise le proxy Vite)
# En production : URL complète de votre backend
VITE_API_URL=

# Exemples :
# Développement local (proxy Vite) : VITE_API_URL=
# PythonAnywhere : VITE_API_URL=https://yourusername.pythonanywhere.com
# Railway : VITE_API_URL=https://your-app.railway.app
# Render : VITE_API_URL=https://your-app.onrender.com
"@

try {
    Set-Content -Path $exampleEnvPath -Value $exampleContent -Encoding UTF8
    Write-Host "✅ Créé: $exampleEnvPath" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la création de $exampleEnvPath" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Résumé" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "⚠️  IMPORTANT: Utilisez VITE_API_URL (pas REACT_APP_API_URL)" -ForegroundColor Yellow
Write-Host "   Votre projet utilise Vite, pas Create React App !`n" -ForegroundColor Yellow

Write-Host "📝 Fichiers créés:" -ForegroundColor Green
Write-Host "   1. frontend/.env.production (pour la production)" -ForegroundColor Cyan
Write-Host "   2. frontend/.env.local (pour le développement)" -ForegroundColor Cyan
Write-Host "   3. frontend/.env.example (template)" -ForegroundColor Cyan

Write-Host "`n📚 Documentation:" -ForegroundColor Green
Write-Host "   - PYTHONANYWHERE_SETUP.md (guide complet)" -ForegroundColor Cyan
Write-Host "   - frontend/ENV_SETUP.md (détails sur les .env)" -ForegroundColor Cyan

Write-Host "`n✅ Terminé !" -ForegroundColor Green
Write-Host "`nPour tester en développement:" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White

Write-Host "`nPour build pour la production:" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run build" -ForegroundColor White

Write-Host ""

