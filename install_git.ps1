# Script d'aide pour installer Git
Write-Host "========================================" -ForegroundColor Green
Write-Host "Installation de Git pour Windows" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Vérifier si Git est déjà installé
$gitPath = Get-Command git -ErrorAction SilentlyContinue
if ($gitPath) {
    Write-Host "✅ Git est déjà installé!" -ForegroundColor Green
    Write-Host "Version: " -NoNewline
    git --version
    exit 0
}

Write-Host "Git n'est pas installé sur votre système." -ForegroundColor Yellow
Write-Host ""

# Vérifier si winget est disponible
$winget = Get-Command winget -ErrorAction SilentlyContinue
if ($winget) {
    Write-Host "Option 1: Installation via winget (Recommandé)" -ForegroundColor Cyan
    Write-Host "Voulez-vous installer Git via winget? (O/N): " -NoNewline -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "O" -or $response -eq "o" -or $response -eq "Y" -or $response -eq "y") {
        Write-Host "Installation de Git en cours..." -ForegroundColor Cyan
        winget install --id Git.Git -e --source winget
        Write-Host ""
        Write-Host "✅ Installation terminée!" -ForegroundColor Green
        Write-Host "Redémarrez PowerShell et exécutez: git --version" -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "Option 2: Installation manuelle" -ForegroundColor Cyan
Write-Host "1. Ouvrez votre navigateur et allez sur: https://git-scm.com/download/win" -ForegroundColor White
Write-Host "2. Téléchargez Git pour Windows" -ForegroundColor White
Write-Host "3. Exécutez l'installateur" -ForegroundColor White
Write-Host "4. IMPORTANT: Cochez 'Add Git to PATH' lors de l'installation" -ForegroundColor Yellow
Write-Host "5. Redémarrez PowerShell après l'installation" -ForegroundColor White
Write-Host ""

# Ouvrir le navigateur
Write-Host "Voulez-vous ouvrir la page de téléchargement maintenant? (O/N): " -NoNewline -ForegroundColor Yellow
$response = Read-Host
if ($response -eq "O" -or $response -eq "o" -or $response -eq "Y" -or $response -eq "y") {
    Start-Process "https://git-scm.com/download/win"
    Write-Host "Page de téléchargement ouverte dans votre navigateur." -ForegroundColor Green
}

Write-Host ""
Write-Host "Après l'installation, exécutez les commandes suivantes:" -ForegroundColor Cyan
Write-Host "  git init" -ForegroundColor White
Write-Host "  git remote add origin https://github.com/Bella5768/Suividepene.git" -ForegroundColor White
Write-Host "  git add ." -ForegroundColor White
Write-Host "  git commit -m `"Initial commit`"" -ForegroundColor White
Write-Host "  git push -u origin main" -ForegroundColor White
Write-Host ""

