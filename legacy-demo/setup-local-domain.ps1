# Run this once as Administrator to map mybookstore.com to your PC.
# Right-click PowerShell -> Run as administrator, then:
#   cd C:\Users\BhavaniPrasad\projects\my-book-store
#   .\setup-local-domain.ps1

$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$marker = "# MY BOOK STORE local domain"
$entries = @(
  "127.0.0.1 mybookstore.com",
  "127.0.0.1 www.mybookstore.com",
  "127.0.0.1 my-book-store.com",
  "127.0.0.1 www.my-book-store.com"
)

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).
  IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
  Write-Host "This script needs Administrator rights." -ForegroundColor Yellow
  Write-Host "Re-launching elevated..."
  Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
  exit
}

$content = Get-Content -Path $hostsPath -ErrorAction Stop
if ($content -notcontains $marker) {
  Add-Content -Path $hostsPath -Value "`r`n$marker"
  foreach ($line in $entries) {
    Add-Content -Path $hostsPath -Value $line
  }
  Write-Host "Added local domain mappings to hosts file." -ForegroundColor Green
} else {
  Write-Host "Local domain mappings already present." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Next:"
Write-Host "  1. Double-click start-bookstore.bat (Run as administrator if port 80 is blocked)"
Write-Host "  2. In Chrome/Edge type:  mybookstore.com"
Write-Host ""
Write-Host "Note: Domains cannot contain spaces."
Write-Host "  'www.my book store.com' is invalid."
Write-Host "  Use: mybookstore.com  or  my-book-store.com"
pause
