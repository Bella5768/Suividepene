# Script PowerShell pour démarrer le frontend
$nodeDir = Join-Path $PSScriptRoot "..\nodejs-portable"
$env:Path = "$nodeDir;$env:Path"

Write-Host "=== Démarrage du Frontend ===" -ForegroundColor Cyan
Write-Host "Node.js version:" -ForegroundColor Yellow
& "$nodeDir\node.exe" --version

Write-Host "`nDémarrage du serveur de développement..." -ForegroundColor Green
Set-Location $PSScriptRoot
& "$nodeDir\npm.cmd" run dev



