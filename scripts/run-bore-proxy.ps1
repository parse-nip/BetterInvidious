# Start proxy + bore TCP tunnel (supports HTTP CONNECT - Cloudflare does NOT)
# Run from project root: .\scripts\run-bore-proxy.ps1
# Add -AutoSet to skip prompts and auto-configure Fly.
param([switch]$AutoSet)

$ErrorActionPreference = "Stop"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
$ToolsDir = Join-Path $PSScriptRoot "proxy-tools"
$GostExe = Join-Path $ToolsDir "gost.exe"
$NodeProxy = Join-Path $ToolsDir "simple-proxy.js"
$BoreExe = Join-Path $ToolsDir "bore.exe"
$ProxyPort = 3128

if (-not (Test-Path $BoreExe)) {
    Write-Host "Run setup first: .\scripts\setup-cloudflare-proxy.ps1" -ForegroundColor Red
    exit 1
}

$UseNodeProxy = $false
if (Test-Path $NodeProxy) {
    $node = Get-Command node -ErrorAction SilentlyContinue
    if ($node) { $UseNodeProxy = $true }
}

if (-not $UseNodeProxy -and -not (Test-Path $GostExe)) {
    Write-Host "Run setup first. Or install Node.js for the built-in proxy." -ForegroundColor Red
    exit 1
}

Write-Host "=== BetterInvidious Proxy (bore TCP tunnel) ===" -ForegroundColor Cyan
if ($UseNodeProxy) {
    Write-Host "Starting Node.js proxy on port $ProxyPort..." -ForegroundColor Yellow
    $ProxyJob = Start-Job -ScriptBlock { param($s) node $s } -ArgumentList $NodeProxy
} else {
    Write-Host "Starting gost proxy on port $ProxyPort..." -ForegroundColor Yellow
    $ProxyJob = Start-Job -ScriptBlock { param($e,$p) & $e -L ":$p" } -ArgumentList $GostExe, $ProxyPort
}

Start-Sleep -Seconds 2

Write-Host "Starting bore TCP tunnel (bore.pub)..." -ForegroundColor Yellow
$BoreOut = [System.IO.Path]::GetTempFileName()
$BoreErr = [System.IO.Path]::GetTempFileName()
try {
    $proc = Start-Process -FilePath $BoreExe -ArgumentList "local", $ProxyPort, "--to", "bore.pub" `
        -PassThru -RedirectStandardOutput $BoreOut -RedirectStandardError $BoreErr -NoNewWindow
} catch {
    if ($_.Exception.Message -match "virus|unwanted") {
        Write-Host ""
        Write-Host "bore.exe is blocked by Windows Defender. Options:" -ForegroundColor Yellow
        Write-Host "  A) Add exclusion: Settings > Virus & threat protection > Exclusions > Add folder: $ToolsDir" -ForegroundColor Gray
        Write-Host "  B) Use port forwarding: .\scripts\run-proxy-portforward.ps1" -ForegroundColor Gray
        Write-Host ""
        Stop-Job $ProxyJob -ErrorAction SilentlyContinue
        Remove-Job $ProxyJob -ErrorAction SilentlyContinue
        exit 1
    }
    throw
}

$TunnelUrl = $null
$Elapsed = 0
while ($Elapsed -lt 10 -and -not $proc.HasExited) {
    Start-Sleep -Seconds 1
    $Elapsed += 1
    $out = (Get-Content $BoreOut -Raw -ErrorAction SilentlyContinue) + (Get-Content $BoreErr -Raw -ErrorAction SilentlyContinue)
    if ($out -match "listening at bore\.pub:(\d+)" -or $out -match "bore\.pub:(\d+)") {
        $port = $Matches[1]
        $TunnelUrl = "http://bore.pub:$port"
        break
    }
}

if (-not $TunnelUrl) {
    Write-Host ""
    Write-Host "Could not capture bore tunnel URL. Check output above." -ForegroundColor Yellow
    Write-Host "Look for: bore.pub:PORT" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Proxy URL: $TunnelUrl" -ForegroundColor Green
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
Write-Host "Proxy and bore tunnel are running. Keep this window open." -ForegroundColor Yellow
try {
    if ($AutoSet) {
        Write-Host "Running with -AutoSet. Close this window to stop." -ForegroundColor Yellow
        $proc.WaitForExit()
    } else {
        Write-Host "Press Enter to stop..." -ForegroundColor Yellow
        Read-Host
    }
} finally {
    Write-Host "Stopping..." -ForegroundColor Yellow
    if ($proc -and -not $proc.HasExited) { $proc.Kill() }
    Stop-Job $ProxyJob -ErrorAction SilentlyContinue
    Remove-Job $ProxyJob -ErrorAction SilentlyContinue
    if ($BoreOut) { Remove-Item $BoreOut -ErrorAction SilentlyContinue }
    if ($BoreErr) { Remove-Item $BoreErr -ErrorAction SilentlyContinue }
    Write-Host "Stopped." -ForegroundColor Green
}
