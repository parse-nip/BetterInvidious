# Start proxy only - for use with router port forwarding (no tunnel needed)
# Run from project root: .\scripts\run-proxy-portforward.ps1
# Requires: Forward router port 3128 -> your PC:3128, then set PROXY="http://YOUR_PUBLIC_IP:3128"
param([switch]$AutoSet)

$ErrorActionPreference = "Stop"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
$ToolsDir = Join-Path $PSScriptRoot "proxy-tools"
$NodeProxy = Join-Path $ToolsDir "simple-proxy.js"
$GostExe = Join-Path $ToolsDir "gost.exe"
$ProxyPort = 3128

$UseNodeProxy = $false
if (Test-Path $NodeProxy) {
    $node = Get-Command node -ErrorAction SilentlyContinue
    if ($node) { $UseNodeProxy = $true }
}

if (-not $UseNodeProxy -and -not (Test-Path $GostExe)) {
    Write-Host "Install Node.js or run setup: .\scripts\setup-cloudflare-proxy.ps1" -ForegroundColor Red
    exit 1
}

Write-Host "=== BetterInvidious Proxy (port forward) ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Forward router port $ProxyPort -> this PC:$ProxyPort" -ForegroundColor Yellow
Write-Host "2. Get your public IP: (Invoke-WebRequest -Uri https://api.ipify.org).Content" -ForegroundColor Yellow
Write-Host "3. Set PROXY: fly secrets set PROXY=`"http://YOUR_IP:3128`" -a betterinvidious-companion" -ForegroundColor Yellow
Write-Host "4. Redeploy: cd invidious; fly deploy -c companion/fly.toml -a betterinvidious-companion" -ForegroundColor Yellow
Write-Host ""

if ($UseNodeProxy) {
    Write-Host "Starting Node.js proxy on port $ProxyPort..." -ForegroundColor Green
    node $NodeProxy
} else {
    Write-Host "Starting gost proxy on port $ProxyPort..." -ForegroundColor Green
    & $GostExe -L ":$ProxyPort"
}
