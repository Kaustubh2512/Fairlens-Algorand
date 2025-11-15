# FairLens Backend - Running Guide

## 🚀 Server Status

The FairLens backend server is starting up. Once it's running, you can access:

- **API Root**: http://localhost:8000
- **API Documentation (Swagger)**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health

## 📝 Quick Start

### Option 1: Using the Batch Script (Easiest)
```bash
# Double-click run.bat or run from command line:
run.bat
```

### Option 2: Using PowerShell Script
```powershell
.\start.ps1
```

### Option 3: Manual Start
```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## ⚙️ Configuration

### 1. Environment Variables

Make sure you have a `.env` file in the `backend` directory. If not, copy from `env.example`:

```bash
copy env.example .env
```

### 2. Required Environment Variables

Edit `.env` file with your configuration:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost/fairlens

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# Algorand
ALGOD_API_URL=https://testnet-api.algonode.network
ALGOD_API_KEY=
ALGOD_INDEXER_URL=https://testnet-idx.algonode.network
ALGOD_INDEXER_KEY=
PRIVATE_KEY_MNEMONIC=your-25-word-testnet-wallet-mnemonic-here
ALGORAND_NETWORK=testnet

# IPFS (Optional)
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_PROJECT_ID=
IPFS_PROJECT_SECRET=
IPFS_GATEWAY=https://ipfs.io/ipfs/
```

### 3. Database Setup

Make sure PostgreSQL is running and create the database:

```bash
createdb fairlens
```

Or using psql:
```sql
CREATE DATABASE fairlens;
```

## 🔍 Verify Server is Running

### Check Health Endpoint
```bash
curl http://localhost:8000/api/health
```

Or open in browser: http://localhost:8000/api/health

### Check API Documentation
Open in browser: http://localhost:8000/docs

## 🧪 Test the API

### 1. Register a User
```bash
POST http://localhost:8000/api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "test123",
  "role": "contractor"
}
```

### 2. Login
```bash
POST http://localhost:8000/api/auth/login
{
  "email": "test@example.com",
  "password": "test123"
}
```

### 3. Connect Wallet
```bash
POST http://localhost:8000/api/auth/connect-wallet
Authorization: Bearer <token>
{
  "wallet_address": "YOUR_ALGORAND_ADDRESS"
}
```

## 🛑 Stop the Server

Press `Ctrl+C` in the terminal where the server is running.

## 🐛 Troubleshooting

### Port Already in Use
If port 8000 is already in use, change the port:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Database Connection Error
1. Check PostgreSQL is running
2. Verify DATABASE_URL in .env file
3. Check database exists: `psql -U postgres -l`

### Module Not Found
1. Activate virtual environment: `.\venv\Scripts\Activate.ps1`
2. Install dependencies: `pip install -r requirements.txt`

### Algorand Connection Error
1. Check ALGOD_API_URL in .env file
2. Test connection: `curl https://testnet-api.algonode.network/v2/status`
3. Verify wallet has TestNet ALGO tokens

## 📚 Next Steps

1. ✅ Server is running
2. 🔄 Test API endpoints via Swagger UI
3. 🔄 Set up frontend (React + Wallet Connect)
4. 🔄 Connect Pera/MyAlgo wallet
5. 🔄 Test complete workflow

## 🔗 Useful Links

- **API Docs**: http://localhost:8000/docs
- **Lora Explorer**: https://lora.algokit.io/
- **Algorand Developer Portal**: https://dev.algorand.co/
- **ARC Standards**: https://dev.algorand.co/arc-standards/

---

**Server is ready! 🚀**

