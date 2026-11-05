Set-Location $PSScriptRoot
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
