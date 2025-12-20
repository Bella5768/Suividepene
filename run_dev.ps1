# Simple script to run Django development server
# Just double-click this file or run: powershell -ExecutionPolicy Bypass -File run_dev.ps1

$pythonPath = "C:\wamp64\www\Suivi_depense\backend\venv\Scripts\python.exe"
$managePath = "C:\wamp64\www\Suivi_depense\backend\manage.py"
$backendDir = "C:\wamp64\www\Suivi_depense\backend"

Write-Host "Starting Django Development Server..." -ForegroundColor Green
Write-Host "Backend will run on: http://localhost:8000" -ForegroundColor Yellow
Write-Host ""

# Start the server
& $pythonPath $managePath runserver 0.0.0.0:8000 -WorkingDirectory $backendDir

# Keep the window open if there's an error
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error occurred. Press any key to close..." -ForegroundColor Red
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
