# ============================================
# Run Supabase Migrations
# ============================================
# This script helps you apply database migrations to your Supabase project

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Supabase Migration Runner" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "ERROR: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please create .env.local with your Supabase credentials" -ForegroundColor Yellow
    exit 1
}

# Load environment variables
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

$SUPABASE_URL = $env:NEXT_PUBLIC_SUPABASE_URL
$SUPABASE_SERVICE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $SUPABASE_URL -or -not $SUPABASE_SERVICE_KEY) {
    Write-Host "ERROR: Missing Supabase credentials in .env.local" -ForegroundColor Red
    Write-Host "Required variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    exit 1
}

Write-Host "Connected to: $SUPABASE_URL" -ForegroundColor Green
Write-Host ""

# List migration files
$migrations = Get-ChildItem -Path "supabase/migrations" -Filter "*.sql" | Sort-Object Name
Write-Host "Available migrations:" -ForegroundColor Cyan
foreach ($migration in $migrations) {
    Write-Host "  - $($migration.Name)" -ForegroundColor White
}
Write-Host ""

# Ask which migration to run
Write-Host "Enter the migration filename to run (or 'all' to run all):" -ForegroundColor Yellow
$choice = Read-Host

if ($choice -eq 'all') {
    $filesToRun = $migrations
} else {
    $filesToRun = $migrations | Where-Object { $_.Name -eq $choice }
    if ($filesToRun.Count -eq 0) {
        Write-Host "ERROR: Migration file '$choice' not found!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Running migrations..." -ForegroundColor Cyan
Write-Host ""

foreach ($file in $filesToRun) {
    Write-Host "Running: $($file.Name)..." -ForegroundColor Yellow
    
    $sqlContent = Get-Content $file.FullName -Raw
    
    # Execute SQL using Supabase REST API
    $projectRef = ($SUPABASE_URL -replace 'https://([^.]+)\.supabase\.co', '$1')
    $apiUrl = "https://$projectRef.supabase.co/rest/v1/rpc/exec_sql"
    
    try {
        $body = @{
            query = $sqlContent
        } | ConvertTo-Json
        
        $headers = @{
            "apikey" = $SUPABASE_SERVICE_KEY
            "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
            "Content-Type" = "application/json"
        }
        
        # Note: Direct SQL execution requires a custom RPC function in Supabase
        # Alternative: Use Supabase CLI or SQL Editor in dashboard
        Write-Host "  Please run this migration manually using Supabase SQL Editor:" -ForegroundColor Yellow
        Write-Host "  1. Go to https://supabase.com/dashboard/project/$projectRef/editor" -ForegroundColor White
        Write-Host "  2. Copy the SQL from: $($file.FullName)" -ForegroundColor White
        Write-Host "  3. Paste and run in SQL Editor" -ForegroundColor White
        Write-Host ""
    } catch {
        Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Migration Instructions Complete" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
