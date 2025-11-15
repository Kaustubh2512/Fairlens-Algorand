# FairLens Backend Setup Script for Windows
# This script handles the complete setup process

param(
    [switch]$SkipEnv
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FairLens Backend Setup for Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Python version
Write-Host "Checking Python version..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
Write-Host "Found: $pythonVersion" -ForegroundColor Green

# Check if Python 3.10 or 3.11 (recommended)
if ($pythonVersion -match "Python 3\.(10|11)") {
    Write-Host "Python version is compatible!" -ForegroundColor Green
} elseif ($pythonVersion -match "Python 3\.13") {
    Write-Host "Warning: Python 3.13 may have compatibility issues. Consider using Python 3.11." -ForegroundColor Yellow
} else {
    Write-Host "Python version check skipped." -ForegroundColor Yellow
}

Write-Host ""

# Create virtual environment
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error creating virtual environment!" -ForegroundColor Red
        exit 1
    }
    Write-Host "Virtual environment created successfully!" -ForegroundColor Green
} else {
    Write-Host "Virtual environment already exists." -ForegroundColor Green
}

Write-Host ""

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error activating virtual environment!" -ForegroundColor Red
    Write-Host "Try running: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Yellow
    exit 1
}

Write-Host "Virtual environment activated!" -ForegroundColor Green
Write-Host ""

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip wheel setuptools
Write-Host ""

# Install pydantic first (with pre-built wheels if possible)
Write-Host "Installing pydantic (this may take a moment)..." -ForegroundColor Yellow
pip install "pydantic>=2.8.0" "pydantic-core>=2.23.0" --upgrade
Write-Host ""

# Install other dependencies
Write-Host "Installing other dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Error installing dependencies!" -ForegroundColor Red
    Write-Host "Try the following:" -ForegroundColor Yellow
    Write-Host "1. Make sure you're using Python 3.10 or 3.11" -ForegroundColor Yellow
    Write-Host "2. Upgrade pip: python -m pip install --upgrade pip wheel" -ForegroundColor Yellow
    Write-Host "3. Install Rust toolchain from https://rustup.rs/ (if pydantic-core fails)" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

# Create .env file if it doesn't exist
if (-not (Test-Path ".env") -and -not $SkipEnv) {
    Write-Host "Creating .env file from env.example..." -ForegroundColor Yellow
    if (Test-Path "env.example") {
        Copy-Item env.example .env
        Write-Host ".env file created! Please edit it with your configuration." -ForegroundColor Yellow
    } else {
        Write-Host "Warning: env.example not found. Please create .env file manually." -ForegroundColor Yellow
    }
    Write-Host ""
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found. The application may not work without it." -ForegroundColor Yellow
    Write-Host "Please create .env file with your configuration (see env.example)." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env file with your configuration" -ForegroundColor White
Write-Host "2. Make sure PostgreSQL is running and database is created" -ForegroundColor White
Write-Host "3. Run: uvicorn app.main:app --reload" -ForegroundColor White
Write-Host "4. Or use: .\start.ps1" -ForegroundColor White
Write-Host ""
Write-Host "API will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API docs will be available at: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""


