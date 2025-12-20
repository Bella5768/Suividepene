# Script d'installation de Node.js et des dépendances frontend
Write-Host "=== Installation de Node.js et des dependances ===" -ForegroundColor Cyan

# Vérifier si Node.js est déjà installé
$nodePaths = @(
    "C:\Program Files\nodejs",
    "C:\Program Files (x86)\nodejs",
    "$env:ProgramFiles\nodejs",
    "$env:ProgramFiles(x86)\nodejs"
)

$nodeFound = $false
foreach ($path in $nodePaths) {
    if (Test-Path "$path\node.exe") {
        Write-Host "Node.js trouve dans: $path" -ForegroundColor Green
        $env:Path = "$path;$env:Path"
        & "$path\node.exe" --version
        & "$path\npm.cmd" --version
        $nodeFound = $true
        $npmPath = "$path\npm.cmd"
        break
    }
}

if (-not $nodeFound) {
    Write-Host "Node.js non trouve. Installation en cours..." -ForegroundColor Yellow
    
    # Télécharger et installer Node.js LTS
    $nodeVersion = "20.11.0"
    $url = "https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-x64.msi"
    $installer = "$env:TEMP\nodejs-installer.msi"
    
    Write-Host "Telechargement de Node.js v$nodeVersion..." -ForegroundColor Cyan
    try {
        Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
        Write-Host "Installation de Node.js (cela peut prendre quelques minutes)..." -ForegroundColor Cyan
        $process = Start-Process msiexec.exe -ArgumentList "/i `"$installer`" /quiet /norestart ADDLOCAL=ALL" -Wait -PassThru
        Remove-Item $installer -ErrorAction SilentlyContinue
        
        # Attendre que l'installation se termine
        Write-Host "Attente de la fin de l'installation..." -ForegroundColor Yellow
        Start-Sleep -Seconds 20
        
        # Mettre à jour le PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        # Vérifier l'installation
        foreach ($path in $nodePaths) {
            if (Test-Path "$path\node.exe") {
                Write-Host "Node.js installe avec succes dans: $path" -ForegroundColor Green
                $env:Path = "$path;$env:Path"
                & "$path\node.exe" --version
                & "$path\npm.cmd" --version
                $nodeFound = $true
                $npmPath = "$path\npm.cmd"
                break
            }
        }
    } catch {
        Write-Host "Erreur lors de l'installation: $_" -ForegroundColor Red
    }
}

if ($nodeFound) {
    Write-Host "`nInstallation des dependances npm..." -ForegroundColor Cyan
    Set-Location "$PSScriptRoot\frontend"
    & $npmPath install
    Write-Host "`n=== Installation terminee ===" -ForegroundColor Green
    Write-Host "Pour demarrer le frontend: cd frontend && npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "`nNode.js n'a pas pu etre installe automatiquement." -ForegroundColor Red
    Write-Host "Veuillez installer Node.js manuellement depuis: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Puis redemarrer ce terminal et executer: cd frontend && npm install" -ForegroundColor Yellow
}



