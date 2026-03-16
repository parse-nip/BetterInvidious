# Run BetterInvidious (popped.dev) with Docker
# Double-click or: powershell -ExecutionPolicy Bypass -File run-invidious.ps1

$dockerPath = "C:\Program Files\Docker\Docker\resources\bin"
if (Test-Path $dockerPath) {
    $env:Path = "$dockerPath;$env:Path"
}

Set-Location $PSScriptRoot

Write-Host "Starting Docker Compose (PostgreSQL + Invidious). First run may take 15-30 min to build." -ForegroundColor Cyan
Write-Host "Once ready, open: http://127.0.0.1:3000" -ForegroundColor Green
Write-Host ""

docker-compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Containers started. Open http://127.0.0.1:3000 in your browser." -ForegroundColor Green
    Write-Host "To stop: docker-compose down" -ForegroundColor Yellow
} else {
    Write-Host "If Docker Desktop is not running, start it from the Start menu and run this script again." -ForegroundColor Red
}
