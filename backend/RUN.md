# How to Run FairLens Backend - Step by Step

## Prerequisites Check

Before starting, make sure you have:
- ✅ Python 3.10 or 3.11 installed (Python 3.13 may cause issues)
- ✅ PostgreSQL installed and running
- ✅ Git (optional, for cloning)

## Step 1: Check Python Version

Open PowerShell and run:
```powershell
python --version
```

**Expected**: Python 3.10.x or 3.11.x

If you have Python 3.13, consider installing Python 3.11 from https://www.python.org/downloads/

## Step 2: Navigate to Backend Directory

```powershell
cd "C:\Projects\algorand 1511\backend"
```

## Step 3: Create Virtual Environment

```powershell
python -m venv venv
```

Wait for it to complete. You should see no errors.

## Step 4: Activate Virtual Environment

```powershell
.\venv\Scripts\Activate.ps1
```

**If you get an error about execution policy**, run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try activating again:
```powershell
.\venv\Scripts\Activate.ps1
```

**You should see `(venv)` in your prompt** - this means the virtual environment is active.

## Step 5: Upgrade pip

```powershell
python -m pip install --upgrade pip wheel setuptools
```

## Step 6: Install Dependencies

```powershell
pip install -r requirements.txt
```

**This may take 2-5 minutes**. If you see errors about pydantic-core or Rust, see Troubleshooting below.

## Step 7: Set Up PostgreSQL Database

### Option A: Using psql (Command Line)

```powershell
# Connect to PostgreSQL
psql -U postgres

# In PostgreSQL prompt, run:
CREATE DATABASE fairlens;
\q
```

### Option B: Using pgAdmin (GUI)

1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" → "Database"
4. Name it: `fairlens`
5. Click "Save"

## Step 8: Create .env File

```powershell
# Copy the example file
Copy-Item env.example .env

# Edit the .env file
notepad .env
```

**Update these values in .env:**
```env
DATABASE_URL=postgresql+asyncpg://postgres:your_password@localhost/fairlens
JWT_SECRET=your-super-secret-key-change-this-in-production
ALGOD_API_URL=https://testnet-api.algonode.network
PRIVATE_KEY_MNEMONIC=your-testnet-wallet-mnemonic-here-twelve-words-separated-by-spaces
```

**Replace:**
- `your_password` with your PostgreSQL password
- `your-super-secret-key-change-this-in-production` with a random string
- `your-testnet-wallet-mnemonic-here...` with your Algorand TestNet wallet mnemonic (or leave empty for now)

## Step 9: Start the Server

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**You should see:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

## Step 10: Verify It's Working

1. Open your browser
2. Go to: http://localhost:8000/docs
3. You should see the Swagger API documentation

## Quick Start Script (Alternative)

If you prefer an automated approach:

```powershell
# Run the setup script
.\setup-windows.ps1

# Then start the server
.\start.ps1
```

## Troubleshooting

### Issue: "source: command not found"
**Solution**: Use `.\venv\Scripts\Activate.ps1` instead of `source venv/bin/activate`

### Issue: "Execution Policy" error
**Solution**: Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Issue: "pydantic-core" Rust compilation error
**Solutions**:
1. **Recommended**: Use Python 3.11 instead of 3.13
2. **Alternative**: Install Rust from https://rustup.rs/
3. **Quick fix**: Install pydantic separately first:
   ```powershell
   pip install "pydantic>=2.8.0" "pydantic-core>=2.23.0"
   pip install -r requirements.txt
   ```

### Issue: "ModuleNotFoundError: No module named 'app'"
**Solution**: Make sure you're in the `backend` directory and virtual environment is activated

### Issue: Database connection error
**Solutions**:
1. Make sure PostgreSQL is running:
   ```powershell
   Get-Service postgresql*
   ```
2. Check your DATABASE_URL in .env file
3. Verify database exists: `psql -U postgres -l`

### Issue: Port 8000 already in use
**Solution**: Use a different port:
```powershell
uvicorn app.main:app --reload --port 8001
```

### Issue: "uvicorn: command not found"
**Solution**: Make sure virtual environment is activated and dependencies are installed:
```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Testing the API

### 1. Register a User

Open http://localhost:8000/docs and try:
- **POST /api/auth/register**
- Use this example:
```json
{
  "name": "Test Government",
  "email": "gov@test.com",
  "password": "test1234",
  "role": "government"
}
```

### 2. Login

- **POST /api/auth/login**
```json
{
  "email": "gov@test.com",
  "password": "test1234"
}
```

### 3. Create a Tender

- **POST /api/tenders/create** (requires login token)
- Click "Authorize" button, paste your token from login response

## Next Steps

1. ✅ Backend is running
2. 🔄 Set up frontend (see frontend README)
3. 🔄 Connect Algorand wallet
4. 🔄 Start creating tenders and contracts

## Need Help?

- Check the logs in the terminal for error messages
- Verify all environment variables in .env
- Make sure PostgreSQL is running
- Check Python version (3.10 or 3.11 recommended)

## Common Commands

```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Deactivate virtual environment
deactivate

# Start server
uvicorn app.main:app --reload

# Check if server is running
curl http://localhost:8000/api/health
```

---

**You're all set!** The backend should now be running on http://localhost:8000


