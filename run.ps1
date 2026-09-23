# CashRegister — start backend and frontend in two windows.
# Run from repo root:
#   powershell -ExecutionPolicy Bypass -File run.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$dbUser = $env:CR_DB_USER;   if (-not $dbUser)   { $dbUser   = "cashregister" }
$dbPass = $env:CR_DB_PASS;   if (-not $dbPass)   { $dbPass   = "cashregister" }
$dbHost = $env:CR_DB_HOST;   if (-not $dbHost)   { $dbHost   = "localhost" }
$dbPort = $env:CR_DB_PORT;   if (-not $dbPort)   { $dbPort   = "3306" }
$dbName = $env:CR_DB_NAME;   if (-not $dbName)   { $dbName   = "cashregister" }
$dbUrl  = "mysql+pymysql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?charset=utf8mb4"

Write-Host "==== Starting CashRegister ====" -ForegroundColor Cyan
Write-Host ""
Write-Host " Backend  → http://localhost:8000/docs"
Write-Host " Frontend → http://localhost:3000"
Write-Host ""

# Backend window
$backendCmd = @"
`$env:DATABASE_URL = '$dbUrl'
`$env:SECRET_KEY   = 'dev-secret-change-in-prod'
`$env:CORS_ORIGINS = 'http://localhost:3000,http://127.0.0.1:3000'
cd '$root\backend'
& '$root\backend\.venv\Scripts\uvicorn.exe' app.main:app --reload --port 8000
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

Start-Sleep -Seconds 2

# Frontend window
$frontendCmd = @"
cd '$root\frontend'
npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host "Two PowerShell windows should now be open." -ForegroundColor Green
Write-Host "Login: admin / admin123   (POS PIN: 0000)"
