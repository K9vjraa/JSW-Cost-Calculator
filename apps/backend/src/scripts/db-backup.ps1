# PowerShell database backup utility for MCMS
# Backs up the local PostgreSQL database using pg_dump

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "mcms_backup_$timestamp.dump"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "      MCMS Database Backup Utility" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Load credentials from DATABASE_URL
$dbUrl = $env:DATABASE_URL
if (-not $dbUrl) {
    Write-Error "❌ Error: DATABASE_URL environment variable is not defined!"
    exit 1
}

if ($dbUrl -match "postgresql://([^:]+):([^@]+)@([^:/]+):(\d+)/(.+)") {
    $dbUser = $Matches[1]
    $dbPass = $Matches[2]
    $dbHost = $Matches[3]
    $dbPort = $Matches[4]
    $dbName = $Matches[5]
} else {
    Write-Error "❌ Error: DATABASE_URL is not a valid PostgreSQL connection string!"
    exit 1
}

Write-Host "Target Host: $dbHost"
Write-Host "Target Port: $dbPort"
Write-Host "Target Database: $dbName"
Write-Host "Target User: $dbUser"
Write-Host "Output File: $backupFile"
Write-Host "---------------------------------------------"

# Set PostgreSQL Password variable for non-interactive execution
$env:PGPASSWORD = $dbPass

# Run pg_dump
try {
    Write-Host "Starting pg_dump..." -ForegroundColor Yellow
    pg_dump -h $dbHost -p $dbPort -U $dbUser -F c -b -v -f $backupFile $dbName
    
    if (Test-Path $backupFile) {
        $fileSize = (Get-Item $backupFile).Length
        if ($fileSize -gt 0) {
            Write-Host "Backup completed successfully!" -ForegroundColor Green
            Write-Host "Size: [$(($fileSize/1kb).ToString('F2')) KB]" -ForegroundColor Green
        } else {
            Write-Error "Backup file was created but is empty."
        }
    } else {
        Write-Error "pg_dump finished but backup file was not found."
    }
} catch {
    Write-Error "An unexpected error occurred during backup: $_"
} finally {
    # Clear password env var for safety
    $env:PGPASSWORD = $null
}
