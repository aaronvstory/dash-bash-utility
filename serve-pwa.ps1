# Dash Bash PWA Server Launcher
# Full-featured PowerShell script for clean server startup

param(
    [switch]$NoKill  # Skip killing existing processes
)

# Set error handling
$ErrorActionPreference = "Stop"

# Banner
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Dash Bash PWA Server Launcher" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is available
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found in PATH" -ForegroundColor Red
    Write-Host "Please install Python or add it to your PATH" -ForegroundColor Red
    pause
    exit 1
}

# Check if serve-pwa.py exists
if (-not (Test-Path "serve-pwa.py")) {
    Write-Host "✗ serve-pwa.py not found in current directory" -ForegroundColor Red
    Write-Host "Current directory: $PWD" -ForegroundColor Yellow
    pause
    exit 1
}

# Check for existing processes on port 8443
if (-not $NoKill) {
    Write-Host ""
    Write-Host "Checking for existing servers on port 8443..." -ForegroundColor Yellow

    try {
        $connections = Get-NetTCPConnection -LocalPort 8443 -ErrorAction SilentlyContinue

        if ($connections) {
            $pids = $connections | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique
            $count = ($pids | Measure-Object).Count

            Write-Host "Found $count process(es) using port 8443" -ForegroundColor Yellow

            foreach ($pid in $pids) {
                try {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "  Killing PID $pid ($($process.ProcessName))..." -ForegroundColor Yellow
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    }
                } catch {
                    Write-Host "  Warning: Could not kill PID $pid" -ForegroundColor Yellow
                }
            }

            Start-Sleep -Milliseconds 500
            Write-Host "✓ Port 8443 cleared" -ForegroundColor Green
        } else {
            Write-Host "✓ Port 8443 is available" -ForegroundColor Green
        }
    } catch {
        Write-Host "Warning: Could not check port 8443 (may require admin)" -ForegroundColor Yellow
    }
}

# Start the server
Write-Host ""
Write-Host "Starting Dash Bash PWA Server..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

try {
    python serve-pwa.py
} catch {
    Write-Host ""
    Write-Host "✗ Server failed to start" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    pause
    exit 1
}
