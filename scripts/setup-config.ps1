# Create config/config.yml from example if missing.
# Ensures login_enabled, registration_enabled, check_tables for user accounts.

$ErrorActionPreference = "Stop"
$InvidiousRoot = Split-Path (Split-Path $PSScriptRoot)
$ConfigPath = Join-Path $InvidiousRoot "invidious\config\config.yml"
$ExamplePath = Join-Path $InvidiousRoot "invidious\config\config.example.yml"

if (Test-Path $ConfigPath) {
    Write-Host "config/config.yml already exists. Skipping."
    exit 0
}

if (-not (Test-Path $ExamplePath)) {
    Write-Error "config/config.example.yml not found."
    exit 1
}

Copy-Item $ExamplePath $ConfigPath
Write-Host "Created config/config.yml from example."

$content = Get-Content $ConfigPath -Raw
$content = $content -replace '#login_enabled: true', 'login_enabled: true'
$content = $content -replace '#registration_enabled: true', 'registration_enabled: true'
$content = $content -replace '#check_tables: false', 'check_tables: true'
$content = $content -replace 'check_tables: false', 'check_tables: true'

if ($content -match 'hmac_key: "CHANGE_ME!!"') {
    $bytes = [byte[]]::new(20)
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $newKey = -join ($bytes | ForEach-Object { '{0:x2}' -f $_ })
    $content = $content -replace 'hmac_key: "CHANGE_ME!!"', "hmac_key: `"$newKey`""
    Write-Host "Generated new hmac_key."
}

Set-Content $ConfigPath $content -NoNewline
Write-Host "Done. Edit config/config.yml to set db credentials and domain."
