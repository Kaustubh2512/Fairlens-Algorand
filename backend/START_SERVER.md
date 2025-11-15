# How to Start the FairLens Backend Server

## 🚀 Quick Start (Recommended)

### Option 1: Using the Batch Script
```bash
# Simply double-click or run:
run.bat
```

### Option 2: Using PowerShell Script
```powershell
.\start.ps1
```

### Option 3: Manual Start (Recommended for Debugging)

1. **Open PowerShell in the backend directory**

2. **Activate virtual environment:**
```powershell
.\venv\Scripts\Activate.ps1
```

3. **Check if .env file exists:**
```powershell
if (Test-Path .env) { Write-Host ".env file exists" } else { Write-Host "Creating .env from env.example"; Copy-Item env.example .env }
```

4. **Edit .env file with your configuration:**
   - Set DATABASE_URL (PostgreSQL connection)
   - Set JWT_SECRET
   - Set Algorand credentials (optional for testing)

5. **Start the server:**
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🔍 Troubleshooting

### Issue: Database Connection Error

**Solution:**
1. Make sure PostgreSQL is running
2. Check DATABASE_URL in .env file
3. Create database: `createdb fairlens`

### Issue: Port 8000 Already in Use

**Solution:**
```powershell
# Use a different port
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Issue: Module Not Found

**Solution:**
```powershell
# Make sure virtual environment is activated
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### Issue: Import Errors

**Solution:**
```powershell
# Check if all dependencies are installed
pip list

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

## ✅ Verify Server is Running

Once the server starts, you should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

Then test the server:
```powershell
# Test health endpoint
curl http://localhost:8000/api/health

# Or open in browser
start http://localhost:8000/docs
```

## 📝 Expected Output

When the server starts successfully, you should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [XXXXX] using WatchFiles
INFO:     Started server process [XXXXX]
INFO:     Waiting for application startup.
INFO:     Starting up FairLens backend...
INFO:     Database tables created/verified
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [XXXXX] using WatchFiles
```

## 🔗 Access Points

Once running, access:
- **API Root**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health

## 🛑 Stop the Server

Press `Ctrl+C` in the terminal where the server is running.

## 💡 Tips

1. **First Time Setup:**
   - Make sure PostgreSQL is installed and running
   - Create the database: `createdb fairlens`
   - Copy `env.example` to `.env` and configure it

2. **Development Mode:**
   - Use `--reload` flag for auto-reload on code changes
   - Check logs in the terminal for errors

3. **Testing:**
   - Use Swagger UI at http://localhost:8000/docs
   - Test endpoints directly from the browser

---

**If you encounter any errors, check the terminal output for detailed error messages!**

