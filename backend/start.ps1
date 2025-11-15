# FairLens Backend Startup Script for Windows
# Run this script from the backend directory

Write-Host "Starting FairLens Backend..." -ForegroundColor Green

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Virtual environment not found. Creating..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Green
& .\venv\Scripts\Activate.ps1

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found. Please create it from env.example" -ForegroundColor Yellow
    Write-Host "Copying env.example to .env..." -ForegroundColor Yellow
    Copy-Item env.example .env
    Write-Host "Please edit .env file with your configuration before continuing." -ForegroundColor Yellow
    pause
}

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Green
python -m pip install --upgrade pip

# Install/upgrade dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
pip install -r requirements.txt

# Check if installation was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
    Write-Host "Starting server..." -ForegroundColor Green
    Write-Host "API will be available at: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "API docs will be available at: http://localhost:8000/docs" -ForegroundColor Cyan
    Write-Host ""
    
    # Start the server
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
} else {
    Write-Host "Error installing dependencies. Please check the error messages above." -ForegroundColor Red
    pause
}


