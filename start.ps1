# One-click local start for MY BOOK STORE (Windows PowerShell).
Set-Location $PSScriptRoot
$ErrorActionPreference = "Stop"

# 1. Create .env on first run, with a fresh AUTH_SECRET.
if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $secret = [Convert]::ToBase64String($bytes)
  (Get-Content .env) -replace 'replace-with-a-long-random-secret', $secret | Set-Content .env
  Write-Host "Created .env (add Stripe/Resend keys later to enable checkout and emails)."
}

# 2. Install packages (also runs prisma generate).
if (-not (Test-Path node_modules)) { npm install }

# 3. Create/upgrade the database. Seed it the first time.
$firstRun = -not (Test-Path prisma\dev.db)
npx prisma migrate deploy
if ($firstRun) { npx prisma db seed }

# 4. Start fresh.
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
