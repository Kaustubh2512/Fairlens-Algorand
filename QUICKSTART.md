# FairLens Quick Start Guide

Get up and running with FairLens in minutes!

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Git

## Quick Installation

### Windows

1. Double-click `run-all.bat`
2. Wait for both servers to start
3. Open your browser to `http://localhost:5173`

### Mac/Linux

1. Run in terminal:
   ```bash
   chmod +x run-all.sh
   ./run-all.sh
   ```
2. Open your browser to `http://localhost:5173`

## Manual Installation

If you prefer manual installation:

### Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python init-db.py
uvicorn app.main:app --reload
```

### Frontend

```bash
npm install
npm run dev
```

## First Steps

1. Open `http://localhost:5173` in your browser
2. Click "Get Started"
3. Register as a Government or Contractor user
4. Connect your Algorand wallet (Pera or MyAlgo)
5. Start creating tenders or applying for projects!

## Default URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Need Help?

Check the full documentation in [README.md](README.md) or open an issue on GitHub.