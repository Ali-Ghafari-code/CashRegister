# CashRegister — Windows setup (no Docker)
#
# Prerequisites already on your machine:
#   * MySQL 8 running, with a database created:
#       CREATE DATABASE cashregister CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
#       CREATE USER 'cashregister'@'localhost' IDENTIFIED BY 'cashregister';
#       GRANT ALL ON cashregister.* TO 'cashregister'@'localhost';
#       FLUSH PRIVILEGES;
#   * Python 3.12+  (python --version)
#   * Node.js 20+   (node --version)
#
# Run once from repo root (D:\assets\CashRegister):
#   powershell -ExecutionPolicy Bypass -File setup.ps1
#
# It creates the Python venv, installs deps, runs Alembic migrations,
# seeds the database, and installs frontend deps.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

# --- MySQL connection settings (override with env vars if you use different) ---
$dbUser = $env:CR_DB_USER;   if (-not $dbUser)   { $dbUser   = "cashregister" }
$dbPass = $env:CR_DB_PASS;   if (-not $dbPass)   { $dbPass   = "cashregister" }
$dbHost = $env:CR_DB_HOST;   if (-not $dbHost)   { $dbHost   = "localhost" }
$dbPort = $env:CR_DB_PORT;   if (-not $dbPort)   { $dbPort   = "3306" }
$dbName = $env:CR_DB_NAME;   if (-not $dbName)   { $dbName   = "cashregister" }
$dbUrl  = "mysql+pymysql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?charset=utf8mb4"

Write-Host ""
Write-Host "==== CashRegister setup ====" -ForegroundColor Cyan
Write-Host "Database: $dbUrl"
Write-Host ""

# --- Backend ---
Write-Host "[1/4] Creating Python venv..." -ForegroundColor Yellow
Set-Location "$root\backend"
if (-not (Test-Path ".venv")) { python -m venv .venv }
& "$root\backend\.venv\Scripts\python.exe" -m pip install --upgrade pip --quiet

Write-Host "[2/4] Installing backend dependencies..." -ForegroundColor Yellow
& "$root\backend\.venv\Scripts\pip.exe" install -r requirements.txt --quiet

Write-Host "[3/4] Running Alembic migrations + seed..." -ForegroundColor Yellow
$env:DATABASE_URL = $dbUrl
$env:SECRET_KEY   = "dev-secret-change-in-prod"
$env:CORS_ORIGINS = "http://localhost:3000,http://127.0.0.1:3000"

& "$root\backend\.venv\Scripts\alembic.exe" upgrade head
& "$root\backend\.venv\Scripts\python.exe" -m scripts.seed

Write-Host ""
Write-Host "[4/4] Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location "$root\frontend"
if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.local.example" ".env.local"
}
npm install --no-audit --no-fund

Set-Location $root
Write-Host ""
Write-Host "==== Setup complete! ====" -ForegroundColor Green
Write-Host ""
Write-Host "Next step: run .\run.ps1 to start both servers." -ForegroundColor Cyan
Write-Host "  Frontend  → http://localhost:3000"
Write-Host "  API docs  → http://localhost:8000/docs"
Write-Host "  Login     → admin / admin123   (POS PIN: 0000)"
