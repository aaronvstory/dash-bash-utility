@echo off
:: Dash Bash Utility Launcher
:: Launches the PWA development server

:: Set console to UTF-8 for proper display
chcp 65001 >nul 2>&1

:: Clear screen for clean start
cls

:: Launch the PWA server using the existing serve-pwa.bat script
echo Starting Dash Bash PWA Server...
echo.
python serve-pwa.py

:: Check if Python script exited with error
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Server exited with error code %ERRORLEVEL%
    echo Press any key to exit...
    pause >nul
)

exit /b %ERRORLEVEL%