# Dash Bash Utility Launcher
# Professional PowerShell launcher with server management

# Set console encoding and colors
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.BackgroundColor = "Black"
$Host.UI.RawUI.ForegroundColor = "White"
Clear-Host

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PythonScript = Join-Path $ScriptDir "serve-pwa.py"
$Port = 8443
$Url = "http://localhost:$Port/index.html"

# ASCII Banner
function Show-Banner {
    Write-Host ""
    Write-Host "-----------------------------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "     ████████   █████   ██████  ██   ██     ████████   █████   ██████  ██   ██" -ForegroundColor Cyan
    Write-Host "     ██   ██   ██   ██ ██       ██   ██     ██   ██   ██   ██ ██       ██   ██" -ForegroundColor Cyan
    Write-Host "     ██   ██   ███████  ██████  ███████     ████████  ███████  ██████  ███████" -ForegroundColor Yellow
    Write-Host "     ██   ██   ██   ██      ██  ██   ██     ██   ██   ██   ██      ██  ██   ██" -ForegroundColor Yellow
    Write-Host "     ████████  ██   ██  ██████  ██   ██     ████████  ██   ██  ██████  ██   ██" -ForegroundColor Green
    Write-Host ""
    Write-Host "                        DoorDash Driver Utility v1.0" -ForegroundColor White
    Write-Host ""
    Write-Host "-----------------------------------------------------------------------------------------" -ForegroundColor DarkGray
}

# Check Python availability
function Test-Python {
    $pythonCommands = @("python", "python3", "py")
    
    foreach ($cmd in $pythonCommands) {
        try {
            $version = & $cmd --version 2>&1
            if ($version -match "Python (\d+\.\d+)") {
                return @{
                    Command = $cmd
                    Version = $matches[1]
                    Found = $true
                }
            }
        } catch {
            continue
        }
    }
    
    return @{ Found = $false }
}

# Kill existing server on port
function Stop-ExistingServer {
    param($Port)
    
    $processes = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    
    if ($processes) {
        foreach ($proc in $processes) {
            try {
                Stop-Process -Id $proc.OwningProcess -Force -ErrorAction SilentlyContinue
                Write-Host "    [OK]    Stopped existing server on port $Port" -ForegroundColor Green
            } catch {
                # Ignore errors
            }
        }
        Start-Sleep -Seconds 1
    }
}

# Start the server
function Start-Server {
    param($PythonCmd, $ScriptPath, $Port)
    
    Write-Host ""
    Write-Host "    STARTING SERVER" -ForegroundColor Yellow
    Write-Host "-----------------------------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "    [INFO]  Starting HTTPS server on port $Port..." -ForegroundColor Cyan
    Write-Host "    [INFO]  Server script: $ScriptPath" -ForegroundColor Gray
    Write-Host ""
    
    # Start Python server
    $serverProcess = Start-Process -FilePath $PythonCmd -ArgumentList $ScriptPath -PassThru -NoNewWindow
    
    # Wait for server to start
    Start-Sleep -Seconds 2
    
    # Check if server is running
    if ($serverProcess.HasExited) {
        Write-Host "    [ERROR] Server failed to start!" -ForegroundColor Red
        return $false
    }
    
    Write-Host "    [OK]    Server started successfully (PID: $($serverProcess.Id))" -ForegroundColor Green
    Write-Host ""
    
    return $serverProcess
}

# Open browser
function Open-Browser {
    param($Url)
    
    Write-Host "    OPENING APPLICATION" -ForegroundColor Yellow
    Write-Host "-----------------------------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "    [INFO]  Opening browser to: $Url" -ForegroundColor Cyan
    Write-Host ""
    
    Start-Process $Url
    Start-Sleep -Seconds 1
    
    Write-Host "    [OK]    Browser launched" -ForegroundColor Green
    Write-Host ""
}

# Main execution
function Main {
    Show-Banner
    
    Write-Host ""
    Write-Host "    SYSTEM CHECK" -ForegroundColor Yellow
    Write-Host "-----------------------------------------------------------------------------------------" -ForegroundColor DarkGray
    
    # Check Python
    $python = Test-Python
    if (-not $python.Found) {
        Write-Host "    [ERROR] Python not found! Please install Python 3.x" -ForegroundColor Red
        Write-Host ""
        Write-Host "    Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "-----------------------------------------------------------------------------------------" -ForegroundColor DarkGray
        Write-Host "    Press any key to exit..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
    
    Write-Host "    [OK]    Python $($python.Version) found: $($python.Command)" -ForegroundColor Green
    
    # Check if serve-pwa.py exists
    if (-not (Test-Path $PythonScript)) {
        Write-Host "    [ERROR] serve-pwa.py not found!" -ForegroundColor Red
        Write-Host "           Expected at: $PythonScript" -ForegroundColor Gray
        Write-Host ""
        Write-Host "-----------------------------------------------------------------------------------------" -ForegroundColor DarkGray
        Write-Host "    Press any key to exit..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
    
    Write-Host "    [OK]    Server script found" -ForegroundColor Green
    
    # Stop any existing server
    Stop-ExistingServer -Port $Port
    
    Write-Host "-----------------------------------------------------------------------------------------" -ForegroundColor DarkGray
    
    # Start server
    $server = Start-Server -PythonCmd $python.Command -ScriptPath $PythonScript -Port $Port
    
    if (-not $server) {
        Write-Host "    Press any key to exit..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
    
    # Open browser
    Open-Browser -Url $Url
    
    # Show running status
    Write-Host "    APPLICATION STATUS" -ForegroundColor Yellow
    Write-Host "-----------------------------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "    [OK]    Dash Bash Utility is running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "    URL:     $Url" -ForegroundColor Cyan
    Write-Host "    PID:     $($server.Id)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "    Features:" -ForegroundColor White
    Write-Host "    - Target Calculator with preset amounts" -ForegroundColor Gray
    Write-Host "    - Quick Messages with drag-and-drop" -ForegroundColor Gray
    Write-Host "    - Address Book with real-time hours" -ForegroundColor Gray
    Write-Host "    - Notes with multi-category support" -ForegroundColor Gray
    Write-Host "    - Dashers with 24-hour timers" -ForegroundColor Gray
    Write-Host ""
    Write-Host "    LocalStorage: ENABLED (persistent data)" -ForegroundColor Green
    Write-Host "    PWA Support:  ENABLED (installable app)" -ForegroundColor Green
    Write-Host ""
    Write-Host "-----------------------------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "    Press [Q] to quit server, or close this window to keep running" -ForegroundColor Yellow
    Write-Host ""
    
    # Wait for user input
    while ($true) {
        if ($Host.UI.RawUI.KeyAvailable) {
            $key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            if ($key.Character -eq 'q' -or $key.Character -eq 'Q') {
                Write-Host ""
                Write-Host "    [INFO]  Shutting down server..." -ForegroundColor Yellow
                Stop-Process -Id $server.Id -Force
                Write-Host "    [OK]    Server stopped" -ForegroundColor Green
                Write-Host ""
                break
            }
        }
        
        # Check if server is still running
        if ($server.HasExited) {
            Write-Host ""
            Write-Host "    [WARN]  Server has stopped unexpectedly" -ForegroundColor Yellow
            break
        }
        
        Start-Sleep -Milliseconds 100
    }
    
    Write-Host "-----------------------------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "    Thank you for using Dash Bash Utility!" -ForegroundColor Cyan
    Write-Host "-----------------------------------------------------------------------------------------" -ForegroundColor DarkGray
    Start-Sleep -Seconds 2
}

# Run main function
Main