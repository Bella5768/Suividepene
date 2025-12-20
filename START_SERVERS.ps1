# Start both Django and React development servers
# Run this script from the project root directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Suivi des Dépenses - Development Servers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "Starting Backend (Django)..." -ForegroundColor Green
Write-Host "Backend will run on: http://localhost:8000" -ForegroundColor Yellow
Write-Host ""

# Start Django backend in a new window
$backendPath = Join-Path $scriptDir "backend"
$pythonPath = Join-Path $backendPath "venv\Scripts\python.exe"
$managePath = Join-Path $backendPath "manage.py"

Start-Process -FilePath $pythonPath -ArgumentList "$managePath runserver 0.0.0.0:8000" -WorkingDirectory $backendPath -WindowStyle Normal

Write-Host "Backend started in new window" -ForegroundColor Green
Write-Host ""

# Wait a moment before starting frontend
Start-Sleep -Seconds 2

Write-Host "Starting Frontend (React/Vite)..." -ForegroundColor Green
Write-Host "Frontend will run on: http://localhost:3001" -ForegroundColor Yellow
Write-Host ""

# Start React frontend in a new window
$frontendPath = Join-Path $scriptDir "frontend"
$nodePath = Join-Path $scriptDir "nodejs-portable\node.exe"

# Create a temporary batch file to run npm
$tempBatch = Join-Path $env:TEMP "start_frontend_temp.bat"
@"
@echo off
cd /d "$frontendPath"
"$nodePath" "$frontendPath\..\nodejs-portable\node_modules\npm\bin\npm-cli.js" run dev
pause
"@ | Out-File -FilePath $tempBatch -Encoding ASCII

Start-Process -FilePath $tempBatch -WindowStyle Normal

Write-Host "Frontend started in new window" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Both servers are starting..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop the servers" -ForegroundColor Gray
