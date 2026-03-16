# Deploy BetterInvidious to Fly.io
# Run from project root: .\deploy.ps1
#
# First-time setup: run .\deploy.ps1 -Setup
# Regular deploy:   run .\deploy.ps1

param(
    [switch]$Setup,      # First-time setup (create Postgres, apps, secrets)
    [switch]$Local       # Restart local Docker instead of deploying
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$InvidiousDir = Join-Path $ProjectRoot "invidious"

function Write-Step { param($Msg) Write-Host "`n==> $Msg" -ForegroundColor Cyan }
function Write-Ok   { param($Msg) Write-Host "  OK: $Msg" -ForegroundColor Green }
function Write-Warn { param($Msg) Write-Host "  ! $Msg" -ForegroundColor Yellow }

# --- Local Docker restart ---
if ($Local) {
    Write-Step "Restarting local Docker (Invidious + Companion)..."
    Push-Location $InvidiousDir
    try {
        docker-compose down 2>$null
        docker-compose up --build -d
        if ($LASTEXITCODE -ne 0) { throw "Docker Compose failed" }
        Write-Ok "Running at http://127.0.0.1:3000"
    } finally {
        Pop-Location
    }
    exit 0
}

# --- Fly deploy ---
Write-Step "Checking prerequisites..."

# Fly CLI
$fly = Get-Command fly -ErrorAction SilentlyContinue
if (-not $fly) {
    Write-Error "Fly CLI not found. Install: https://fly.io/docs/hands-on/install-flyctl/"
}

# Build React UI
Write-Step "Building React UI..."
Push-Location $ProjectRoot
try {
    & (Join-Path $ProjectRoot "scripts\build-react-ui.ps1")
    if ($LASTEXITCODE -ne 0) { throw "React build failed" }
} finally {
    Pop-Location
}

$reactAssets = Join-Path $InvidiousDir "assets\react\index.html"
if (-not (Test-Path $reactAssets)) {
    Write-Error "React build not found at invidious/assets/react/"
}

Write-Ok "React UI built"

# --- Setup ---
if ($Setup) {
    Write-Step "First-time setup"
    Write-Host ""
    Write-Host "  1. Create Postgres:" -ForegroundColor White
    Write-Host "     fly postgres create --name betterinvidious-db" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Create apps:" -ForegroundColor White
    Write-Host "     fly apps create betterinvidious" -ForegroundColor Gray
    Write-Host "     fly apps create betterinvidious-companion" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Attach Postgres:" -ForegroundColor White
    Write-Host "     fly postgres attach betterinvidious-db -a betterinvidious" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  4. Set secrets (run these - generates keys for you):" -ForegroundColor White
    $companionKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 16 | ForEach-Object { [char]$_ })
    $hmacKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 24 | ForEach-Object { [char]$_ })
    Write-Host "     fly secrets set SERVER_SECRET_KEY=$companionKey -a betterinvidious-companion" -ForegroundColor Gray
    Write-Host "     fly secrets set INVIDIOUS_INVIDIOUS_COMPANION_KEY=$companionKey -a betterinvidious" -ForegroundColor Gray
    Write-Host "     fly secrets set INVIDIOUS_HMAC_KEY=$hmacKey -a betterinvidious" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  5. Run deploy:" -ForegroundColor White
    Write-Host "     .\deploy.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Warn "Copy the fly secrets commands above and run them, then run .\deploy.ps1"
    exit 0
}

# --- Deploy companion ---
Write-Step "Deploying Invidious Companion..."
Push-Location $InvidiousDir
try {
    fly deploy -c companion/fly.toml
    if ($LASTEXITCODE -ne 0) { throw "Companion deploy failed" }
} finally {
    Pop-Location
}
Write-Ok "Companion deployed"

# --- Deploy main app ---
Write-Step "Deploying BetterInvidious..."
Push-Location $InvidiousDir
try {
    fly deploy
    if ($LASTEXITCODE -ne 0) { throw "Invidious deploy failed" }
} finally {
    Pop-Location
}
Write-Ok "Deploy complete"

Write-Host ""
Write-Host "  Open: https://betterinvidious.fly.dev" -ForegroundColor Green
Write-Host "  Or:   fly open -a betterinvidious" -ForegroundColor Gray
Write-Host ""
