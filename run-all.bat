@echo off
title FairLens Complete System

echo FairLens Complete System Startup Script
echo ======================================

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

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Get Node.js version
for /f %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION% found

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm is not installed
    pause
    exit /b 1
)

REM Get npm version
for /f %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✓ npm %NPM_VERSION% found

echo ✓ All system requirements satisfied

echo.
echo Starting backend server...
echo =========================

REM Change to backend directory
cd backend

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

REM Install backend dependencies
echo Installing backend dependencies...
pip install --upgrade pip >nul
pip install -r requirements.txt >nul
echo ✓ Backend dependencies installed

REM Initialize database
echo Initializing database...
python init-db.py >nul
echo ✓ Database initialized

REM Start backend server in new window
start "FairLens Backend" cmd /k "uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
echo ✓ Backend server started in new window

REM Change back to root directory
cd ..

echo.
echo Starting frontend server...
echo ==========================

REM Install frontend dependencies
echo Installing frontend dependencies...
npm install >nul
echo ✓ Frontend dependencies installed

REM Start frontend server in new window
start "FairLens Frontend" cmd /k "npm run dev"
echo ✓ Frontend server started in new window

echo.
echo ========================================
echo FairLens System is Running!
echo ========================================
echo.
echo Backend API:     http://localhost:8000
echo Frontend UI:     http://localhost:5173
echo API Docs:        http://localhost:8000/docs
echo.
echo Close the backend and frontend windows to stop the servers
echo.

pause