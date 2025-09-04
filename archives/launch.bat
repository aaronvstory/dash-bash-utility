@echo off
:: Dash Bash Utility - Quick Launch Script
:: This batch file launches the PowerShell script with proper execution policy

title Dash Bash Utility Launcher

echo -----------------------------------------------------------------------------------------
echo.
echo    Dash Bash Utility - Progressive Web App
echo.
echo -----------------------------------------------------------------------------------------
echo.

:: Check if PowerShell is available
where powershell >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PowerShell is not installed or not in PATH
    echo [INFO] Please ensure PowerShell is installed on your system
    pause
    exit /b 1
)

:: Get the directory of this batch file
set SCRIPT_DIR=%~dp0

:: Launch the PowerShell script with bypass execution policy
echo [INFO] Starting Dash Bash Utility...
echo.

powershell.exe -ExecutionPolicy Bypass -File "%SCRIPT_DIR%launch.ps1"

:: If PowerShell script exits, pause to show any errors
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] An error occurred while running the application
    echo.
    pause
)