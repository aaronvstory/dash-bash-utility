# Dash Bash Utility - Launch Script
# This script starts the development server and opens the application in your default browser

$Host.UI.RawUI.WindowTitle = "Dash Bash Utility Server"

Write-Host "-----------------------------------------------------------------------------------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "   ╔╦╗┌─┐┌─┐┬ ┬  ╔╗ ┌─┐┌─┐┬ ┬  ╦ ╦┌┬┐┬┬  ┬┌┬┐┬ ┬" -ForegroundColor Cyan
Write-Host "    ║║├─┤└─┐├─┤  ╠╩╗├─┤└─┐├─┤  ║ ║ │ ││  │ │ └┬┘" -ForegroundColor Cyan
Write-Host "   ═╩╝┴ ┴└─┘┴ ┴  ╚═╝┴ ┴└─┘┴ ┴  ╚═╝ ┴ ┴┴─┘┴ ┴  ┴" -ForegroundColor Cyan
Write-Host ""
Write-Host "                    Progressive Web App Launcher" -ForegroundColor White
Write-Host ""
Write-Host "-----------------------------------------------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

# Check if Python is installed
Write-Host "[INFO] Checking Python installation..." -ForegroundColor Green
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[OK] Found $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "[INFO] Please install Python from https://www.python.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Kill any existing Python servers on port 8443
Write-Host "[INFO] Checking for existing servers on port 8443..." -ForegroundColor Green
$existingProcess = Get-NetTCPConnection -LocalPort 8443 -State Listen -ErrorAction SilentlyContinue
if ($existingProcess) {
    $pid = $existingProcess.OwningProcess
    Write-Host "[WARN] Found existing process on port 8443 (PID: $pid)" -ForegroundColor Yellow
    Write-Host "[INFO] Terminating existing server..." -ForegroundColor Green
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "[INFO] Working directory: $scriptPath" -ForegroundColor Green

# Change to the script directory
Set-Location $scriptPath

# Start the Python server in the background
Write-Host "[INFO] Starting development server..." -ForegroundColor Green
Write-Host "[INFO] Server will run at: http://localhost:8443" -ForegroundColor Cyan
Write-Host ""

# Create a background job for the server
$serverJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    python serve-pwa.py 2>&1
} -ArgumentList $scriptPath

# Wait a moment for server to start
Write-Host "[INFO] Waiting for server to initialize..." -ForegroundColor Green
Start-Sleep -Seconds 2

# Check if server started successfully
$serverState = Get-Job -Id $serverJob.Id
if ($serverState.State -eq "Failed") {
    Write-Host "[ERROR] Failed to start server" -ForegroundColor Red
    Receive-Job -Id $serverJob.Id
    Read-Host "Press Enter to exit"
    exit 1
}

# Test if server is responding
Write-Host "[INFO] Testing server connection..." -ForegroundColor Green
$maxRetries = 5
$retryCount = 0
$serverReady = $false

while ($retryCount -lt $maxRetries -and -not $serverReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8443" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
            Write-Host "[OK] Server is ready!" -ForegroundColor Green
        }
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "[INFO] Waiting for server... (attempt $retryCount/$maxRetries)" -ForegroundColor Yellow
            Start-Sleep -Seconds 1
        }
    }
}

if (-not $serverReady) {
    Write-Host "[ERROR] Server failed to respond after $maxRetries attempts" -ForegroundColor Red
    Stop-Job -Id $serverJob.Id
    Remove-Job -Id $serverJob.Id
    Read-Host "Press Enter to exit"
    exit 1
}

# Open the application in the default browser
Write-Host "[INFO] Opening application in browser..." -ForegroundColor Green
Start-Process "http://localhost:8443/index.html"

Write-Host ""
Write-Host "-----------------------------------------------------------------------------------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "[OK] Dash Bash Utility is now running!" -ForegroundColor Green
Write-Host ""
Write-Host "    Application URL: http://localhost:8443/index.html" -ForegroundColor Cyan
Write-Host "    Server Status:   Running" -ForegroundColor Green
Write-Host ""
Write-Host "[INFO] Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "-----------------------------------------------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

# Keep the server running
try {
    while ($true) {
        # Check if job is still running
        $jobState = Get-Job -Id $serverJob.Id
        if ($jobState.State -ne "Running") {
            Write-Host "[ERROR] Server stopped unexpectedly" -ForegroundColor Red
            Receive-Job -Id $serverJob.Id
            break
        }
        
        # Check for any output from the server
        $output = Receive-Job -Id $serverJob.Id -Keep
        if ($output) {
            $output | ForEach-Object { Write-Host $_ }
        }
        
        Start-Sleep -Seconds 1
    }
} finally {
    # Cleanup on exit
    Write-Host ""
    Write-Host "[INFO] Shutting down server..." -ForegroundColor Yellow
    Stop-Job -Id $serverJob.Id -ErrorAction SilentlyContinue
    Remove-Job -Id $serverJob.Id -ErrorAction SilentlyContinue
    Write-Host "[OK] Server stopped" -ForegroundColor Green
}