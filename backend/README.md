# FairLens Backend - Blockchain-Based Tender Management System

Production-ready FastAPI backend for FairLens, a transparent tender management system built on Algorand blockchain with Box Storage, ARC-3 NFTs, and automated milestone payments.

## 🎯 Overview

FairLens ensures transparent tender management between government and contractors using the Algorand blockchain. The system uses:
- **PyTeal Smart Contracts** with Box Storage for efficient milestone management
- **ARC-3 NFTs** for milestone representation
- **Inner Transactions** for automatic payment releases
- **Lora Explorer** integration for transaction verification
- **IPFS** for NFT metadata storage

## ✨ Features

- **User Management**: JWT-based authentication with role-based access (Government/Contractor/Citizen)
- **Tender Management**: Create, list, and manage tenders with blockchain verification
- **Smart Contract Deployment**: Deploy PyTeal smart contracts with Box Storage for milestone data
- **NFT Minting**: Mint and burn ARC-3 compliant NFTs for project milestones
- **Payment Automation**: Automatic payment release via smart contracts using Inner Transactions
- **Wallet Integration**: Connect Algorand wallets (Pera/MyAlgo)
- **Admin Dashboard**: Aggregated statistics and analytics
- **Lora Explorer**: Automatic generation of explorer URLs for all transactions and contracts

## 🏗️ Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy (async)
- **Blockchain**: Algorand Python SDK + PyTeal
- **Smart Contracts**: PyTeal with Box Storage (TEAL v10)
- **NFT Standard**: ARC-3 (Algorand Standard Asset)
- **Metadata Storage**: IPFS (Infura/Pinata)
- **Authentication**: JWT with bcrypt
- **API Documentation**: Auto-generated Swagger/OpenAPI
- **Explorer**: Lora Explorer integration

## 📚 References

- **Algorand Developer Portal**: https://dev.algorand.co/
- **ARC Standards**: https://dev.algorand.co/arc-standards/
- **ARC Repository**: https://github.com/algorandfoundation/ARCs
- **Box Storage Docs**: https://dev.algorand.co/concepts/smart-contracts/storage/box/
- **Lora Explorer**: https://lora.algokit.io/
- **AlgoDevs Community**: https://www.algodevs.site/

## 🚀 Quick Start

### Prerequisites

1. **Python 3.10 or 3.11** (Python 3.13 may have compatibility issues)
2. **PostgreSQL 14+**
3. **Algorand TestNet Account**
4. **IPFS Account** (optional, for NFT metadata)

### Step 1: Algorand Wallet Setup

#### 1.1 Create Pera Wallet (TestNet)

1. Install Pera Wallet: https://perawallet.app
2. Switch to TestNet mode in settings
3. Copy your:
   - **Public address** → used for testing
   - **25-word mnemonic** → stored locally for development (never commit it)

#### 1.2 Get TestNet Tokens

1. Visit Algorand TestNet Faucet: https://bank.testnet.algorand.network/
2. Paste your public address
3. Click "Dispense" to receive free ALGO tokens

#### 1.3 Algorand API Node Access

Choose one of these providers:

**Option A: AlgoNode (Recommended)**
- URL: https://algonode.io
- TestNet API: `https://testnet-api.algonode.network`
- TestNet Indexer: `https://testnet-idx.algonode.network`
- API Key: Not required (public node)

**Option B: PureStake Developer API**
- URL: https://developer.purestake.io
- Requires API key registration

### Step 2: Installation

#### Windows

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

#### Linux/Mac

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

### Step 3: Database Setup

```bash
# Create PostgreSQL database
createdb fairlens

# Or using SQL:
psql -U postgres
CREATE DATABASE fairlens;
\q
```

### Step 4: Environment Configuration

```bash
# Copy example environment file
cp env.example .env

# Edit .env with your configuration
```

**Required environment variables:**

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost/fairlens

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Algorand
ALGOD_API_URL=https://testnet-api.algonode.network
ALGOD_API_KEY=  # Leave empty for AlgoNode (public node)
ALGOD_INDEXER_URL=https://testnet-idx.algonode.network
ALGOD_INDEXER_KEY=  # Leave empty for AlgoNode
PRIVATE_KEY_MNEMONIC=your-25-word-testnet-wallet-mnemonic-here
ALGORAND_NETWORK=testnet

# IPFS (for NFT metadata storage)
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_PROJECT_ID=your-ipfs-project-id
IPFS_PROJECT_SECRET=your-ipfs-project-secret
IPFS_GATEWAY=https://ipfs.io/ipfs/

# Application
ENVIRONMENT=development
DEBUG=True

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173
```

### Step 5: Run the Application

```bash
# Make sure virtual environment is activated
# Windows: .\venv\Scripts\Activate.ps1
# Linux/Mac: source venv/bin/activate

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 6: Verify Installation

- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health

## 📖 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/connect-wallet` - Connect Algorand wallet
- `GET /api/auth/profile` - Get user profile

### Tenders
- `POST /api/tenders/create` - Create new tender (Government)
- `GET /api/tenders` - List all tenders
- `GET /api/tenders/{id}` - Get tender details
- `POST /api/tenders/{id}/apply` - Apply for tender (Contractor)
- `POST /api/tenders/{id}/select/{application_id}` - Select contractor (Government)

### Contracts
- `POST /api/contracts/deploy` - Deploy smart contract
- `GET /api/contracts` - List contracts
- `GET /api/contracts/{id}` - Get contract details

### Milestones
- `POST /api/milestones/create` - Create milestone
- `GET /api/milestones/contract/{contract_id}` - Get contract milestones
- `POST /api/milestones/{id}/verify` - Verify milestone (Government)
- `POST /api/milestones/{id}/release` - Release payment (Government)

### Payments
- `GET /api/payments` - List payments
- `GET /api/payments/{tx_id}` - Get payment details with Lora explorer URL

### NFT
- `POST /api/nft/mint` - Mint ARC-3 NFT
- `POST /api/nft/burn` - Burn NFT
- `GET /api/nft/status/{nft_id}` - Get NFT status with Lora explorer URL

### Wallet
- `GET /api/wallet/balance` - Get wallet balance with explorer URL

### Blockchain
- `GET /api/blockchain/tx/status/{tx_id}` - Get transaction status with Lora explorer URL
- `GET /api/blockchain/info` - Get blockchain node information
- `GET /api/blockchain/app/{app_id}` - Get application info with Lora explorer URL

### Admin
- `GET /api/admin/stats` - Get admin statistics

## 🔗 Lora Explorer Integration

All blockchain transactions, applications, and assets include Lora Explorer URLs for verification:

**Example URLs:**
- Application: `https://lora.algokit.io/testnet/application/747673048`
- Transaction: `https://lora.algokit.io/testnet/transaction/{tx_id}`
- Asset: `https://lora.algokit.io/testnet/asset/{asset_id}`
- Account: `https://lora.algokit.io/testnet/account/{address}`

All API responses include `explorer_url` and `lora_url` fields for easy verification.

## 📦 Smart Contract Details

### Box Storage

The FairLens contract uses **Box Storage** for efficient milestone data storage:

- **Box Key Format**: `m_{milestone_index}` (e.g., "m_0", "m_1")
- **Box Data**: 17 bytes per milestone
  - Amount: 8 bytes (uint64)
  - Due Date: 8 bytes (uint64)
  - Status: 1 byte (0 = pending, 1 = verified, 2 = paid)

**Reference**: [Algorand Box Storage Documentation](https://dev.algorand.co/concepts/smart-contracts/storage/box/)

### Contract Methods

1. **add_milestone** (method_id = 1): Add a new milestone (owner only)
2. **verify_milestone** (method_id = 2): Verify milestone completion (verifier only)
3. **release_payment** (method_id = 3): Release payment for verified milestone (owner only)

### Global State

- `owner`: Owner address (byte slice)
- `contractor`: Contractor address (byte slice)
- `verifier`: Verifier address (byte slice)
- `total_amt`: Total contract amount (uint64)
- `m_count`: Milestone count (uint64)
- `curr_m`: Current milestone index (uint64)

## 🎨 NFT (ARC-3) Implementation

### ARC-3 Standard Compliance

All NFTs follow the ARC-3 standard:
- Total supply: 1 unit
- Decimals: 0 (non-divisible)
- Metadata URL: IPFS URL with `#arc3` suffix
- Metadata hash: SHA-256 hash of metadata JSON

### Metadata Structure

```json
{
  "name": "FairLens Contract #123",
  "description": "NFT representing milestone payment",
  "standard": "ARC3",
  "properties": {
    "contract_id": 123,
    "milestone_index": 1
  }
}
```

### IPFS Integration

- Metadata is uploaded to IPFS
- IPFS CID is stored in NFT URL
- ARC-3 compliant URL format: `https://ipfs.io/ipfs/{cid}#arc3`

## 🗄️ Database Schema

- **users**: User accounts with roles and wallet addresses
- **tenders**: Tender listings with blockchain hashes
- **applications**: Contractor applications for tenders
- **contracts**: Smart contracts with Algorand app IDs and addresses
- **milestones**: Project milestones with payment amounts
- **transactions**: Blockchain transactions with explorer URLs

## 🧪 Testing

### Unit Tests

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app
```

### Manual Testing

1. Register a user: `POST /api/auth/register`
2. Login: `POST /api/auth/login`
3. Connect wallet: `POST /api/auth/connect-wallet`
4. Create tender: `POST /api/tenders/create`
5. Deploy contract: `POST /api/contracts/deploy`
6. Mint NFT: `POST /api/nft/mint`

## 🐳 Docker Deployment

```bash
# Build image
docker build -t fairlens-backend .

# Run container
docker run -p 8000:8000 --env-file .env fairlens-backend
```

## 📝 Deployment Scripts

### Deploy Contract Manually

```bash
python scripts/deploy_contract.py
```

### Mint NFT Manually

```bash
python scripts/mint_nft.py
```

## 🔒 Security Notes

- Never commit `.env` file with real secrets
- Use strong `JWT_SECRET` in production
- Store `PRIVATE_KEY_MNEMONIC` securely
- Enable HTTPS in production
- Implement rate limiting for production
- Use environment-specific database credentials
- Validate all wallet addresses
- Never expose private keys

## 🐛 Troubleshooting

### Python 3.13 Issues

If you encounter pydantic-core compilation errors:
1. Use Python 3.11 instead (recommended)
2. Or install Rust toolchain: https://rustup.rs/

### Database Connection Issues

1. Make sure PostgreSQL is running
2. Check `DATABASE_URL` in `.env` file
3. Verify database exists: `psql -U postgres -l`

### Algorand Connection Issues

1. Check `ALGOD_API_URL` in `.env` file
2. Test connection: `curl https://testnet-api.algonode.network/v2/status`
3. Verify wallet has TestNet ALGO tokens

### IPFS Issues

1. Check IPFS credentials in `.env` file
2. Test IPFS connection
3. If IPFS fails, metadata will use placeholder URL

## 📚 Additional Resources

- **Algorand Developer Portal**: https://dev.algorand.co/
- **ARC Standards**: https://dev.algorand.co/arc-standards/
- **PyTeal Documentation**: https://pyteal.readthedocs.io/
- **Algorand Python SDK**: https://github.com/algorand/py-algorand-sdk
- **Lora Explorer**: https://lora.algokit.io/
- **AlgoDevs Community**: https://www.algodevs.site/

## 🎯 Next Steps

1. ✅ Backend is running
2. 🔄 Set up frontend (React + Wallet Connect)
3. 🔄 Connect Pera/MyAlgo wallet
4. 🔄 Test complete workflow (tender → contract → milestone → payment)
5. 🔄 Deploy to production

## 📄 License

MIT License

## 🤝 Support

For issues and questions:
- Check the [Troubleshooting](#-troubleshooting) section
- Review API documentation at http://localhost:8000/docs
- Visit AlgoDevs community: https://www.algodevs.site/
- Check Algorand Developer Portal: https://dev.algorand.co/

---

**Built with ❤️ using Algorand Blockchain**
