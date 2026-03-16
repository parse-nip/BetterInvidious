# Build Invidious ARM64 on your PC, push to GitHub Container Registry.
# Pi pulls from ghcr.io - no tar transfer needed.
#
# Prerequisites on PC:
#   - Docker Desktop with buildx
#   - Run .\scripts\build-react-ui.ps1 first
#   - GitHub PAT with write:packages (Settings -> Developer settings -> Personal access tokens)
#
# One-time: docker login ghcr.io -u parse-nip -p YOUR_GITHUB_PAT
#
# Usage:
#   1. .\scripts\build-for-pi.ps1
#   2. git push
#   3. On Pi: git pull && docker compose -f docker-compose.pi-prebuilt.yml pull && docker compose -f docker-compose.pi-prebuilt.yml up -d

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path $PSScriptRoot
$InvidiousDir = Join-Path $ProjectRoot "invidious"
$ImageTag = "ghcr.io/parse-nip/betterinvidious-invidious:arm64"

# Ensure React UI is built
$ReactIndex = Join-Path $InvidiousDir "assets\react\index.html"
if (-not (Test-Path $ReactIndex)) {
    Write-Host "Building React UI first..."
    & (Join-Path $ProjectRoot "scripts\build-react-ui.ps1")
    if (-not (Test-Path $ReactIndex)) {
        Write-Error "React UI still missing. Run .\scripts\build-react-ui.ps1 manually."
    }
}

Write-Host "Building ARM64 image for Raspberry Pi (5-15 min on a decent PC)..."
Push-Location $InvidiousDir

docker buildx version 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker buildx not found. Enable BuildKit in Docker Desktop."
}

docker buildx build `
    --platform linux/arm64 `
    --tag $ImageTag `
    --push `
    --file docker/Dockerfile.arm64 `
    --build-arg release=1 `
    .

if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Error "Build failed."
}

Pop-Location

Write-Host ""
Write-Host "Build complete. Image pushed to ghcr.io/parse-nip/betterinvidious-invidious:arm64"
Write-Host ""
Write-Host "Next:"
Write-Host "  1. git add -A && git commit -m 'Build for Pi' && git push"
Write-Host "  2. On Pi: git pull && cd invidious && docker compose -f docker-compose.pi-prebuilt.yml pull && docker compose -f docker-compose.pi-prebuilt.yml up -d"
