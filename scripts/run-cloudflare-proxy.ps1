# Start proxy + Cloudflare Tunnel, then set PROXY secret on companion
# Run from project root: .\scripts\run-cloudflare-proxy.ps1
# Add -AutoSet to skip prompts and auto-configure Fly.
param([switch]$AutoSet)

$ErrorActionPreference = "Stop"
# Refresh PATH (winget installs may not be visible in current session)
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
$ToolsDir = Join-Path $PSScriptRoot "proxy-tools"
$GostExe = Join-Path $ToolsDir "gost.exe"
$NodeProxy = Join-Path $ToolsDir "simple-proxy.js"
$CloudflaredExe = Join-Path $ToolsDir "cloudflared.exe"
$ProxyPort = 3128

# Resolve cloudflared path (may be from winget)
if (-not (Test-Path $CloudflaredExe)) {
    $cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
    if ($cloudflared) {
        $CloudflaredExe = "cloudflared"
    }
}

# Prefer Node.js proxy (no trojan warnings; uses built-in modules only)
$UseNodeProxy = $false
if (Test-Path $NodeProxy) {
    $node = Get-Command node -ErrorAction SilentlyContinue
    if ($node) {
        $UseNodeProxy = $true
    }
}

if (-not $UseNodeProxy -and -not (Test-Path $GostExe)) {
    Write-Host "Run setup first: .\scripts\setup-cloudflare-proxy.ps1" -ForegroundColor Red
    Write-Host "Or ensure Node.js is installed for the built-in proxy." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $CloudflaredExe) -and -not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
    Write-Host "Run setup first: .\scripts\setup-cloudflare-proxy.ps1" -ForegroundColor Red
    exit 1
}

Write-Host "=== BetterInvidious Proxy ===" -ForegroundColor Cyan
if ($UseNodeProxy) {
    Write-Host "Starting Node.js proxy on port $ProxyPort (no external binaries)..." -ForegroundColor Yellow
    $GostJob = Start-Job -ScriptBlock {
        param($script)
        node $script
    } -ArgumentList $NodeProxy
} else {
    Write-Host "Starting gost proxy on port $ProxyPort..." -ForegroundColor Yellow
    $GostJob = Start-Job -ScriptBlock {
        param($exe, $port)
        & $exe -L ":$port"
    } -ArgumentList $GostExe, $ProxyPort
}

Start-Sleep -Seconds 2

Write-Host "Starting Cloudflare Tunnel..." -ForegroundColor Yellow

# Start cloudflared and capture output for the tunnel URL
$CloudflaredArgs = "tunnel", "--url", "http://localhost:$ProxyPort"
$CloudflaredCmd = if (Test-Path $CloudflaredExe) { $CloudflaredExe } else { "cloudflared" }

$OutFile = [System.IO.Path]::GetTempFileName()
$ErrFile = [System.IO.Path]::GetTempFileName()
$process = Start-Process -FilePath $CloudflaredCmd -ArgumentList $CloudflaredArgs -PassThru `
    -RedirectStandardOutput $OutFile -RedirectStandardError $ErrFile -NoNewWindow

# Wait for tunnel URL (cloudflared outputs to stderr)
$TunnelUrl = $null
$Timeout = 15
$Elapsed = 0
while ($Elapsed -lt $Timeout -and -not $process.HasExited) {
    Start-Sleep -Seconds 1
    $Elapsed += 1
    $err = Get-Content $ErrFile -Raw -ErrorAction SilentlyContinue
    $out = Get-Content $OutFile -Raw -ErrorAction SilentlyContinue
    $combined = "$err $out"
    if ($combined -match "https://([a-z0-9-]+\.trycloudflare\.com)") {
        $TunnelUrl = "https://$($Matches[1])"
        break
    }
}

if (-not $TunnelUrl) {
    Write-Host ""
    Write-Host "Could not capture tunnel URL. Check cloudflared output above." -ForegroundColor Yellow
    Write-Host "Look for a line like: https://xxxxx.trycloudflare.com" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Set PROXY manually:" -ForegroundColor Cyan
    Write-Host "  fly secrets set PROXY=`"https://YOUR-URL.trycloudflare.com`" -a betterinvidious-companion" -ForegroundColor White
    Write-Host "  cd invidious && fly deploy -c companion/fly.toml -a betterinvidious-companion" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "Tunnel URL: $TunnelUrl" -ForegroundColor Green
    Write-Host ""
    
    $SetSecret = $AutoSet
    if (-not $AutoSet) {
        $resp = Read-Host "Set PROXY secret on companion and redeploy? (y/n)"
        $SetSecret = ($resp -eq "y" -or $resp -eq "Y")
    }
    if ($SetSecret) {
        Write-Host "Setting PROXY secret..." -ForegroundColor Cyan
        fly secrets set "PROXY=$TunnelUrl" -a betterinvidious-companion
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Redeploying companion..." -ForegroundColor Cyan
            Push-Location (Join-Path (Split-Path $PSScriptRoot -Parent) "invidious")
            fly deploy -c companion/fly.toml -a betterinvidious-companion
            Pop-Location
            Write-Host ""
            Write-Host "Done. Video playback should work now." -ForegroundColor Green
        }
    } else {
        Write-Host ""
        Write-Host "Run manually:" -ForegroundColor Cyan
        Write-Host "  fly secrets set PROXY=`"$TunnelUrl`" -a betterinvidious-companion" -ForegroundColor White
        Write-Host "  cd invidious && fly deploy -c companion/fly.toml -a betterinvidious-companion" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Proxy and tunnel are running. Keep this window open." -ForegroundColor Yellow
try {
    if ($AutoSet) {
        Write-Host "Running with -AutoSet. Close this window to stop." -ForegroundColor Yellow
        $process.WaitForExit()
    } else {
        Write-Host "Press Enter to stop..." -ForegroundColor Yellow
        Read-Host
    }
} finally {
    Write-Host "Stopping..." -ForegroundColor Yellow
    if ($process -and -not $process.HasExited) { $process.Kill() }
    Stop-Job $GostJob -ErrorAction SilentlyContinue
    Remove-Job $GostJob -ErrorAction SilentlyContinue
    if ($OutFile) { Remove-Item $OutFile -ErrorAction SilentlyContinue }
    if ($ErrFile) { Remove-Item $ErrFile -ErrorAction SilentlyContinue }
    Write-Host "Stopped." -ForegroundColor Green
}
