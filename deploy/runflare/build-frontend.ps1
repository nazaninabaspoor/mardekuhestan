# Build frontend for same-host Django serve (optional for first API-only bring-up)
param(
  [string]$SiteUrl = "https://mardekuhestan.com"
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$Frontend = Join-Path $Root "frontend"
$OutDir = Join-Path $Root "backend\django\public\web"

Write-Host "Building Next static export..."
Push-Location $Frontend
$env:STATIC_EXPORT = "1"
$env:NEXT_PUBLIC_SITE_URL = $SiteUrl
$env:NEXT_PUBLIC_API_BASE_URL = $SiteUrl
$env:NEXT_PUBLIC_FASTAPI_BASE_URL = $SiteUrl
npm ci
npx next build
Pop-Location

$Built = Join-Path $Frontend "out"
if (-not (Test-Path $Built)) {
  throw "frontend/out پیدا نشد. next.config باید output=export در حالت STATIC_EXPORT بسازد."
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
Remove-Item -Recurse -Force (Join-Path $OutDir "*") -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force (Join-Path $Built "*") $OutDir
Write-Host "OK -> $OutDir"
