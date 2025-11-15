@echo off
title FairLens Backend Server

echo FairLens Backend Startup Script
echo ================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check Python version (3.8+ required)
for /f "tokens=2" %%i in ('python --version') do set PYTHON_VERSION=%%i
for /f "tokens=1,2 delims=." %%a in ("%PYTHON_VERSION%") do (
    set PYTHON_MAJOR=%%a
    set PYTHON_MINOR=%%b
)

if %PYTHON_MAJOR% lss 3 (
    echo Error: Python 3.8+ is required. Found: %PYTHON_VERSION%
    pause
    exit /b 1
)

if %PYTHON_MAJOR% equ 3 if %PYTHON_MINOR% lss 8 (
    echo Error: Python 3.8+ is required. Found: %PYTHON_VERSION%
    pause
    exit /b 1
)

echo ✓ Python %PYTHON_VERSION% found

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo ✓ Virtual environment created
) else (
    echo ✓ Virtual environment exists
)

REM Activate virtual environment
call venv\Scripts\activate.bat
echo ✓ Virtual environment activated

REM Check if requirements.txt exists
if not exist "requirements.txt" (
    echo Error: requirements.txt not found
    pause
    exit /b 1
)

REM Upgrade pip first
echo Upgrading pip...
python -m pip install --upgrade pip >nul

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
echo ✓ Dependencies installed

REM Check if init-db.py exists
if not exist "init-db.py" (
    echo Error: init-db.py not found
    pause
    exit /b 1
)

REM Initialize database
echo Initializing database...
python init-db.py
echo ✓ Database initialized

REM Start the server
echo Starting FairLens backend server...
echo Server will be available at: http://localhost:8000
echo.

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

pause