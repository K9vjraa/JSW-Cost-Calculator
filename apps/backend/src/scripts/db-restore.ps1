# PowerShell database restore utility for MCMS
# Restores the PostgreSQL database from a backup file using pg_restore

param (
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "      MCMS Database Restore Utility" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

if (-not (Test-Path $BackupFile)) {
    Write-Error "Backup file not found at: $BackupFile"
    exit 1
}

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
Write-Host "Input File: $BackupFile"
Write-Host "---------------------------------------------"

# Set PostgreSQL Password variable for non-interactive execution
$env:PGPASSWORD = $dbPass

try {
    Write-Host "Starting pg_restore (cleaning existing schemas)..." -ForegroundColor Yellow
    # -c cleans (drops) database objects before recreating them
    # --if-exists avoids errors during clean if objects do not exist
    pg_restore -h $dbHost -p $dbPort -U $dbUser -d $dbName -c --if-exists -v $BackupFile
    Write-Host "Database restore completed successfully!" -ForegroundColor Green
} catch {
    Write-Error "An unexpected error occurred during restore: $_"
} finally {
    # Clear password env var for safety
    $env:PGPASSWORD = $null
}
