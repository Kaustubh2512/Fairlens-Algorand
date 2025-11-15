@echo off
title FairLens Frontend Server

echo FairLens Frontend Startup Script
echo ================================

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

REM Check if package.json exists
if not exist "package.json" (
    echo Error: package.json not found
    pause
    exit /b 1
)

REM Install dependencies
echo Installing frontend dependencies...
npm install
echo ✓ Frontend dependencies installed

REM Start the frontend
echo Starting FairLens frontend...
echo Frontend will be available at: http://localhost:5173
echo.

npm run dev

pause