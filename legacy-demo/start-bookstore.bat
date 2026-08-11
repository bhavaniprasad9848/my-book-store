@echo off
title MY BOOK STORE
cd /d "%~dp0"

echo Starting MY BOOK STORE...
echo.
echo Open in browser:
echo   http://mybookstore.com
echo   http://www.mybookstore.com
echo   http://localhost
echo.
echo Keep this window open while you use the store.
echo Press Ctrl+C to stop.
echo.

REM Prefer port 80 so the domain works without :5173
python -m http.server 80
if errorlevel 1 (
  echo.
  echo Port 80 needs Administrator. Falling back to port 5173...
  echo Use: http://localhost:5173
  echo.
  python -m http.server 5173
)

pause
