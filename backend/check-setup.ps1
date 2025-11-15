# FairLens Backend - Setup Checker
# This script checks if everything is set up correctly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FairLens Backend - Setup Checker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✓ Python found: $pythonVersion" -ForegroundColor Green
    
    if ($pythonVersion -match "Python 3\.(10|11)") {
        Write-Host "  ✓ Python version is compatible" -ForegroundColor Green
    } elseif ($pythonVersion -match "Python 3\.13") {
        Write-Host "  ⚠ Python 3.13 may have compatibility issues" -ForegroundColor Yellow
        $warnings++
    }
} catch {
    Write-Host "  ✗ Python not found!" -ForegroundColor Red
    $errors++
}
Write-Host ""

# Check Virtual Environment
Write-Host "Checking virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "  ✓ Virtual environment exists" -ForegroundColor Green
    
    if (Test-Path "venv\Scripts\Activate.ps1") {
        Write-Host "  ✓ Activation script exists" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Activation script not found" -ForegroundColor Red
        $errors++
    }
} else {
    Write-Host "  ⚠ Virtual environment not found" -ForegroundColor Yellow
    Write-Host "    Run: python -m venv venv" -ForegroundColor Gray
    $warnings++
}
Write-Host ""

# Check .env file
Write-Host "Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "  ✓ .env file exists" -ForegroundColor Green
    
    # Check if it has required variables
    $envContent = Get-Content .env -Raw
    $requiredVars = @("DATABASE_URL", "JWT_SECRET", "ALGOD_API_URL")
    $missingVars = @()
    
    foreach ($var in $requiredVars) {
        if ($envContent -notmatch $var) {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -eq 0) {
        Write-Host "  ✓ Required environment variables found" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Missing variables: $($missingVars -join ', ')" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "  ⚠ .env file not found" -ForegroundColor Yellow
    Write-Host "    Run: Copy-Item env.example .env" -ForegroundColor Gray
    $warnings++
}
Write-Host ""

# Check Dependencies (if venv is activated)
Write-Host "Checking dependencies..." -ForegroundColor Yellow
$venvActive = $env:VIRTUAL_ENV -ne $null

if ($venvActive) {
    Write-Host "  ✓ Virtual environment is active" -ForegroundColor Green
    
    try {
        python -c "import fastapi" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Dependencies are installed" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ Dependencies not installed" -ForegroundColor Yellow
            Write-Host "    Run: pip install -r requirements.txt" -ForegroundColor Gray
            $warnings++
        }
    } catch {
        Write-Host "  ⚠ Could not check dependencies" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "  ⚠ Virtual environment not activated" -ForegroundColor Yellow
    Write-Host "    Run: .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
    $warnings++
}
Write-Host ""

# Check PostgreSQL (optional)
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
try {
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgService) {
        $running = $pgService | Where-Object { $_.Status -eq "Running" }
        if ($running) {
            Write-Host "  ✓ PostgreSQL service is running" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ PostgreSQL service is not running" -ForegroundColor Yellow
            Write-Host "    Start it with: Start-Service postgresql-x64-14" -ForegroundColor Gray
            $warnings++
        }
    } else {
        Write-Host "  ⚠ PostgreSQL service not found" -ForegroundColor Yellow
        Write-Host "    Make sure PostgreSQL is installed" -ForegroundColor Gray
        $warnings++
    }
} catch {
    Write-Host "  ⚠ Could not check PostgreSQL" -ForegroundColor Yellow
    $warnings++
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✓ Everything looks good! You can start the server." -ForegroundColor Green
    Write-Host ""
    Write-Host "Run: uvicorn app.main:app --reload" -ForegroundColor Cyan
} elseif ($errors -eq 0) {
    Write-Host "⚠ Some warnings found, but you can still try to run the server." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run: uvicorn app.main:app --reload" -ForegroundColor Cyan
} else {
    Write-Host "✗ Some errors found. Please fix them before running the server." -ForegroundColor Red
}

Write-Host ""


