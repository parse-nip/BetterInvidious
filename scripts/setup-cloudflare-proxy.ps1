# Setup Cloudflare Tunnel + proxy for BetterInvidious companion
# Run from project root: .\scripts\setup-cloudflare-proxy.ps1
# Uses Node.js proxy by default (no trojan warnings). Falls back to gost if no Node.

$ErrorActionPreference = "Stop"
$ToolsDir = Join-Path $PSScriptRoot "proxy-tools"
$GostUrl = "https://github.com/go-gost/gost/releases/download/v3.2.6/gost_3.2.6_windows_amd64.zip"
$CloudflaredUrl = "https://github.com/cloudflare/cloudflared/releases/download/2026.3.0/cloudflared-windows-amd64.exe"
$BoreUrl = "https://github.com/ekzhang/bore/releases/download/v0.6.0/bore-v0.6.0-x86_64-pc-windows-msvc.zip"

Write-Host "=== BetterInvidious Proxy Setup ===" -ForegroundColor Cyan
Write-Host ""

# Create tools directory
if (-not (Test-Path $ToolsDir)) {
    New-Item -ItemType Directory -Path $ToolsDir -Force | Out-Null
    Write-Host "Created $ToolsDir" -ForegroundColor Green
}

# Node.js proxy (simple-proxy.js) is bundled - no download. Skip gost if Node available.
$HasNode = Get-Command node -ErrorAction SilentlyContinue
if ($HasNode) {
    Write-Host "Node.js found - will use built-in proxy (no external binaries)." -ForegroundColor Green
}

# Install gost (optional - only if no Node)
$GostExe = Join-Path $ToolsDir "gost.exe"
if (-not $HasNode -and -not (Test-Path $GostExe)) {
    Write-Host "Downloading gost..." -ForegroundColor Yellow
    $ZipPath = Join-Path $ToolsDir "gost.zip"
    Invoke-WebRequest -Uri $GostUrl -OutFile $ZipPath -UseBasicParsing -TimeoutSec 60
    if ((Get-Item $ZipPath).Length -lt 1000) {
        throw "Download failed (file too small). Check your connection."
    }
    Expand-Archive -Path $ZipPath -DestinationPath $ToolsDir -Force
    Remove-Item $ZipPath -Force
    # gost extracts as gost_3.2.6_windows_amd64/gost.exe or gost.exe at root
    $ExtractedDir = Join-Path $ToolsDir "gost_3.2.6_windows_amd64"
    if (Test-Path (Join-Path $ExtractedDir "gost.exe")) {
        Move-Item (Join-Path $ExtractedDir "gost.exe") $GostExe -Force
        Remove-Item $ExtractedDir -Recurse -Force
    } elseif (Test-Path (Join-Path $ToolsDir "gost.exe")) {
        # Already at root
    } else {
        throw "Could not find gost.exe in extracted archive"
    }
    Write-Host "  gost installed" -ForegroundColor Green
} elseif ($HasNode) {
    Write-Host "Skipping gost (using Node.js proxy instead)" -ForegroundColor Green
} else {
    Write-Host "gost already installed" -ForegroundColor Green
}

# Install cloudflared to proxy-tools (reliable, no PATH issues)
$CloudflaredExe = Join-Path $ToolsDir "cloudflared.exe"
if (-not (Test-Path $CloudflaredExe)) {
    Write-Host "Downloading cloudflared..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $CloudflaredUrl -OutFile $CloudflaredExe -UseBasicParsing -TimeoutSec 60
    if ((Get-Item $CloudflaredExe).Length -lt 1000000) {
        throw "Download failed (file too small). Check your connection."
    }
    Write-Host "  cloudflared installed" -ForegroundColor Green
} else {
    Write-Host "cloudflared already installed" -ForegroundColor Green
}

# Install bore (TCP tunnel - supports HTTP CONNECT; Cloudflare Quick Tunnel does NOT)
$BoreExe = Join-Path $ToolsDir "bore.exe"
if (-not (Test-Path $BoreExe)) {
    Write-Host "Downloading bore (TCP tunnel for CONNECT proxy)..." -ForegroundColor Yellow
    $BoreZip = Join-Path $ToolsDir "bore.zip"
    Invoke-WebRequest -Uri $BoreUrl -OutFile $BoreZip -UseBasicParsing -TimeoutSec 60
    if ((Get-Item $BoreZip).Length -lt 100000) {
        throw "Bore download failed (file too small). Check your connection."
    }
    Expand-Archive -Path $BoreZip -DestinationPath $ToolsDir -Force
    Remove-Item $BoreZip -Force
    # bore extracts as bore.exe
    if (-not (Test-Path $BoreExe)) {
        $Extracted = Get-ChildItem $ToolsDir -Filter "bore.exe" -Recurse | Select-Object -First 1
        if ($Extracted) { Move-Item $Extracted.FullName $BoreExe -Force }
    }
    Write-Host "  bore installed" -ForegroundColor Green
} else {
    Write-Host "bore already installed" -ForegroundColor Green
}

# If bore was quarantined by Windows Defender, add exclusion
if (-not (Test-Path $BoreExe) -and (Test-Path (Join-Path $ToolsDir "bore.zip"))) {
    Write-Host ""
    Write-Host "bore.exe may have been quarantined by Windows Defender." -ForegroundColor Yellow
    Write-Host "Add exclusion: Settings > Privacy & Security > Windows Security > Virus & threat protection" -ForegroundColor Yellow
    Write-Host "  > Manage settings > Exclusions > Add folder: $ToolsDir" -ForegroundColor Gray
    Write-Host "Then re-run this setup." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setup complete." -ForegroundColor Green
Write-Host ""
Write-Host "Next: Run the proxy + tunnel with:" -ForegroundColor Cyan
Write-Host "  .\scripts\run-bore-proxy.ps1   (recommended - supports HTTP CONNECT)" -ForegroundColor White
Write-Host "  .\scripts\run-proxy-portforward.ps1   (if bore blocked - use router port forward)" -ForegroundColor Gray
Write-Host ""
