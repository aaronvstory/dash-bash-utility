@echo off
:: Dash Bash Utility Launcher
:: Launches PowerShell script with proper execution policy

:: Set console to UTF-8 for proper display
chcp 65001 >nul 2>&1

:: Clear screen for clean start
cls

:: Launch PowerShell script with bypass execution policy
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%~dp0launch.ps1"

:: Check if PowerShell script exited with error
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] PowerShell script exited with error code %ERRORLEVEL%
    echo Press any key to exit...
    pause >nul
)

exit /b %ERRORLEVEL%