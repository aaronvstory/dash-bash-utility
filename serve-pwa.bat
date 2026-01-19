@echo off
REM Simple launcher that calls the full PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0serve-pwa.ps1"
pause
