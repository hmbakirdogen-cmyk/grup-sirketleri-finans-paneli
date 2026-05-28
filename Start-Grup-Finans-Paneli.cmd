@echo off
setlocal
powershell -ExecutionPolicy Bypass -File "%~dp0Start-Grup-Finans-Paneli.ps1"
if errorlevel 1 (
  echo.
  echo Baslatma basarisiz oldu. Ayrintilar bu pencerede gorunuyor.
  pause
)
