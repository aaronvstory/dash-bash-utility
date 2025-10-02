# -----------------------------------------------------------------------------------------
# Restore Script - Undo Archive Organization from 2025-10-02
# -----------------------------------------------------------------------------------------
# This script reverses all file moves performed during archive organization
# Run this script to restore files to their original locations
# -----------------------------------------------------------------------------------------

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Archive Restoration Script" -ForegroundColor Yellow
Write-Host "Date: 2025-10-02" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = "C:\claude\dash-bash"

# Define all moves (destination -> source)
$restoreMoves = @(
    @{From = "$baseDir\archives\old-checkpoints\CHECKPOINT-2025-09-04-DASHERS.md"; To = "$baseDir\CHECKPOINT-2025-09-04-DASHERS.md"},
    @{From = "$baseDir\archives\old-checkpoints\CHECKPOINT-2025-09-04.md"; To = "$baseDir\CHECKPOINT-2025-09-04.md"},
    @{From = "$baseDir\archives\old-checkpoints\CHECKPOINT-COLLAPSIBLE-DASHERS.md"; To = "$baseDir\CHECKPOINT-COLLAPSIBLE-DASHERS.md"},
    @{From = "$baseDir\archives\test-files\test-collapsible-dashers.html"; To = "$baseDir\test-collapsible-dashers.html"},
    @{From = "$baseDir\archives\test-files\test-dashers-enhancement.html"; To = "$baseDir\test-dashers-enhancement.html"},
    @{From = "$baseDir\archives\versions\index.html.broken-20250930"; To = "$baseDir\index.html.broken-20250930"},
    @{From = "$baseDir\archives\versions\styles2.css"; To = "$baseDir\styles2.css"},
    @{From = "$baseDir\archives\temp-files\_config.yml"; To = "$baseDir\_config.yml"},
    @{From = "$baseDir\archives\temp-files\launch.ps1"; To = "$baseDir\launch.ps1"}
)

Write-Host "Starting restoration process..." -ForegroundColor Green
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($move in $restoreMoves) {
    if (Test-Path $move.From) {
        try {
            Move-Item -Path $move.From -Destination $move.To -Force
            Write-Host "[OK] Restored: $(Split-Path $move.To -Leaf)" -ForegroundColor Green
            $successCount++
        } catch {
            Write-Host "[ERROR] Failed to restore: $(Split-Path $move.To -Leaf)" -ForegroundColor Red
            Write-Host "  Error: $_" -ForegroundColor Red
            $failCount++
        }
    } else {
        Write-Host "[SKIP] File not found in archive: $(Split-Path $move.From -Leaf)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Restoration Complete!" -ForegroundColor Yellow
Write-Host "Success: $successCount files" -ForegroundColor Green
Write-Host "Failed: $failCount files" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host "========================================" -ForegroundColor Cyan
