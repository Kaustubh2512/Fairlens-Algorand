# FairLens Backend - Quick Start Guide

This guide will help you get the FairLens backend up and running quickly.

## Prerequisites

- Python 3.10 or 3.11 (Python 3.13 may have compatibility issues)
- PostgreSQL 14+
- Algorand TestNet Wallet (Pera Wallet)
- TestNet ALGO tokens

## Step 1: Algorand Setup

### 1.1 Create Pera Wallet

1. Install Pera Wallet: https://perawallet.app
2. Switch to TestNet mode in settings
3. Copy your 25-word mnemonic (store securely, never commit)
4. Copy your public address

### 1.2 Get TestNet Tokens

1. Visit: https://bank.testnet.algorand.network/
2. Paste your public address
3. Click "Dispense" to receive free ALGO tokens

### 1.3 Algorand API Access

**Recommended: AlgoNode (Free, no API key required)**
- API URL: `https://testnet-api.algonode.network`
- Indexer URL: `https://testnet-idx.algonode.network`
- API Key: Not required (leave empty)

**Alternative: PureStake**
- Visit: https://developer.purestake.io
- Register and get API key

## Step 2: Database Setup

```bash
# Create database
createdb fairlens

# Or using psql:
psql -U postgres
CREATE DATABASE fairlens;
\q
```

## Step 3: Backend Setup

### Windows

```powershell
# Navigate to backend directory
cd backend

# Run automated setup
.\setup-windows.ps1

# Or manually:
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip wheel
pip install -r requirements.txt
```

### Linux/Mac

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip wheel

# Install dependencies
pip install -r requirements.txt
```

## Step 4: Environment Configuration

```bash
# Copy example environment file
cp env.example .env

# Edit .env with your configuration
```

**Required .env variables:**

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost/fairlens

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# Algorand
ALGOD_API_URL=https://testnet-api.algonode.network
ALGOD_API_KEY=  # Leave empty for AlgoNode
ALGOD_INDEXER_URL=https://testnet-idx.algonode.network
ALGOD_INDEXER_KEY=  # Leave empty for AlgoNode
PRIVATE_KEY_MNEMONIC=your-25-word-testnet-wallet-mnemonic-here
ALGORAND_NETWORK=testnet

# IPFS (Optional, for NFT metadata)
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_PROJECT_ID=your-ipfs-project-id
IPFS_PROJECT_SECRET=your-ipfs-project-secret
IPFS_GATEWAY=https://ipfs.io/ipfs/
```

## Step 5: Run the Application

```bash
# Make sure virtual environment is activated
# Windows: .\venv\Scripts\Activate.ps1
# Linux/Mac: source venv/bin/activate

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Step 6: Verify Installation

- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health

## Step 7: Test the Backend

### Using Swagger UI

1. Open http://localhost:8000/docs
2. Register a new user
3. Login to get JWT token
4. Connect wallet
5. Create a tender
6. Test other endpoints

### Using Test Script

```bash
# Run test deployment script
python scripts/test_deployment.py
```

## Common Issues

### Python 3.13 Compatibility

If you encounter pydantic-core compilation errors:
1. Use Python 3.11 instead (recommended)
2. Or install Rust toolchain: https://rustup.rs/

### Database Connection

1. Make sure PostgreSQL is running
2. Check `DATABASE_URL` in `.env` file
3. Verify database exists: `psql -U postgres -l`

### Algorand Connection

1. Check `ALGOD_API_URL` in `.env` file
2. Test connection: `curl https://testnet-api.algonode.network/v2/status`
3. Verify wallet has TestNet ALGO tokens

## Next Steps

1. ✅ Backend is running
2. 🔄 Set up frontend (React + Wallet Connect)
3. 🔄 Connect Pera/MyAlgo wallet
4. 🔄 Test complete workflow (tender → contract → milestone → payment)
5. 🔄 Deploy to production

## Resources

- **API Documentation**: http://localhost:8000/docs
- **Lora Explorer**: https://lora.algokit.io/
- **Algorand Developer Portal**: https://dev.algorand.co/
- **ARC Standards**: https://dev.algorand.co/arc-standards/

---

**Ready to build transparent tender management on Algorand! 🚀**
