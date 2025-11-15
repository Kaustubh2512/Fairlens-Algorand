# Windows Setup Guide for FairLens Backend

## Prerequisites

- Python 3.10 or 3.11 (Python 3.13 may have compatibility issues with some packages)
- PostgreSQL 14+ installed and running
- Git for Windows (optional)

## Step-by-Step Setup

### 1. Create Virtual Environment

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (PowerShell)
.\venv\Scripts\Activate.ps1

# If you get an execution policy error, run this first:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Upgrade pip

```powershell
python -m pip install --upgrade pip
```

### 3. Install Dependencies

```powershell
pip install -r requirements.txt
```

**Note**: If you encounter Rust compilation errors with `pydantic-core`, try:
- Using Python 3.10 or 3.11 instead of 3.13
- Or install pre-built wheels by updating pip first: `python -m pip install --upgrade pip wheel`

### 4. Set Up PostgreSQL Database

```powershell
# Make sure PostgreSQL is running
# Create database using psql or pgAdmin
# Using psql:
psql -U postgres
CREATE DATABASE fairlens;
\q
```

### 5. Configure Environment Variables

```powershell
# Copy the example environment file
Copy-Item env.example .env

# Edit .env file with your configuration
# Use Notepad or your preferred editor:
notepad .env
```

Required variables in `.env`:
```
DATABASE_URL=postgresql+asyncpg://user:password@localhost/fairlens
JWT_SECRET=your-secret-key-change-in-production
ALGOD_API_URL=https://testnet-api.algonode.network
ALGOD_API_KEY=
ALGOD_INDEXER_URL=https://testnet-idx.algonode.network
ALGOD_INDEXER_KEY=
PRIVATE_KEY_MNEMONIC=your-testnet-wallet-mnemonic-here
ENVIRONMENT=development
DEBUG=True
```

### 6. Run the Application

```powershell
# Make sure virtual environment is activated
# You should see (venv) in your prompt

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 7. Verify Installation

- Open browser and go to: http://localhost:8000/docs
- You should see the Swagger API documentation

## Troubleshooting

### Issue: Execution Policy Error

**Error**: `cannot be loaded because running scripts is disabled on this system`

**Solution**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Rust Compilation Error

**Error**: `error: metadata-generation-failed` when installing pydantic-core

**Solutions**:
1. Use Python 3.10 or 3.11 (recommended)
2. Install pre-built wheels:
   ```powershell
   python -m pip install --upgrade pip wheel
   pip install pydantic --only-binary :all:
   ```
3. Or install Rust toolchain: https://rustup.rs/

### Issue: PostgreSQL Connection Error

**Error**: `could not connect to server`

**Solutions**:
1. Make sure PostgreSQL service is running:
   ```powershell
   # Check if PostgreSQL is running
   Get-Service postgresql*
   
   # Start PostgreSQL if not running
   Start-Service postgresql-x64-14  # Adjust version number
   ```
2. Verify database credentials in `.env` file
3. Check if PostgreSQL is listening on port 5432

### Issue: Module Not Found

**Error**: `ModuleNotFoundError: No module named 'app'`

**Solution**:
```powershell
# Make sure you're in the backend directory
cd backend

# Verify virtual environment is activated
# You should see (venv) in your prompt

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: Port Already in Use

**Error**: `Address already in use`

**Solution**:
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use a different port
uvicorn app.main:app --reload --port 8001
```

## Alternative: Using Python 3.10/3.11

If you're using Python 3.13 and encountering issues, consider using Python 3.10 or 3.11:

1. Download Python 3.11 from https://www.python.org/downloads/
2. Install it
3. Create virtual environment with specific Python version:
   ```powershell
   py -3.11 -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

## Quick Start Script

Create a file `start.ps1` in the backend directory:

```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Run it with:
```powershell
.\start.ps1
```

## Additional Resources

- FastAPI Documentation: https://fastapi.tiangolo.com/
- Algorand Python SDK: https://github.com/algorand/py-algorand-sdk
- PostgreSQL Windows Installation: https://www.postgresql.org/download/windows/


