# Set PROXY secret on betterinvidious-companion (required for YouTube on Fly.io)
# Run from project root: .\scripts\set-companion-proxy.ps1
# Or with proxy URL: .\scripts\set-companion-proxy.ps1 -ProxyUrl "http://user:pass@proxy:port"

param(
    [string]$ProxyUrl
)

$app = "betterinvidious-companion"

if (-not $ProxyUrl) {
    Write-Host "YouTube blocks Fly.io datacenter IPs. The companion needs a residential/non-datacenter proxy." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  HTTP:  http://user:pass@proxy.example.com:8080"
    Write-Host "  SOCKS5: socks5://proxy.example.com:1080"
    Write-Host ""
    $ProxyUrl = Read-Host "Enter your proxy URL"
}

if ([string]::IsNullOrWhiteSpace($ProxyUrl)) {
    Write-Host "No proxy URL provided. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host "Setting PROXY secret on $app..." -ForegroundColor Cyan
fly secrets set "PROXY=$ProxyUrl" -a $app

if ($LASTEXITCODE -eq 0) {
    Write-Host "Done. Redeploy the companion for the change to take effect:" -ForegroundColor Green
    Write-Host "  cd invidious && fly deploy -c companion/fly.toml -a $app" -ForegroundColor White
} else {
    Write-Host "Failed to set secret. Is flyctl installed and are you logged in?" -ForegroundColor Red
    exit 1
}
