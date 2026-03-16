# Build React UI and copy to Invidious assets
$ErrorActionPreference = "Stop"
$frontendDir = Join-Path (Join-Path $PSScriptRoot "..") "frontend"
$targetDir = Join-Path (Join-Path (Join-Path $PSScriptRoot "..") "invidious") "assets\react"

Write-Host "Building React frontend..."
Push-Location $frontendDir
try {
    npm run build
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}

$distDir = Join-Path $frontendDir "dist"
if (-not (Test-Path $distDir)) {
    Write-Error "Build output not found at $distDir"
    exit 1
}

Write-Host "Copying build to $targetDir..."
if (Test-Path $targetDir) {
    Remove-Item -Recurse -Force $targetDir
}
New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
Copy-Item -Path "$distDir\*" -Destination $targetDir -Recurse -Force

Write-Host "Done. React UI is at $targetDir"
