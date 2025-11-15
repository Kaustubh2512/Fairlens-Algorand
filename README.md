# FairLens - Blockchain-Based Transparent Tender Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Algorand](https://img.shields.io/badge/Algorand-TestNet-blue)](https://testnet.algorand.org/)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)

FairLens is a production-ready blockchain-based transparent tender management system that ensures transparency and accountability in government-contractor relationships using the Algorand blockchain. The platform enables governments to create tenders, contractors to apply, and milestone-based payments to be automatically released through smart contracts with full blockchain verification.

## 🎯 Key Features

### Core Functionality
- **Transparent Tender Management**: Create, view, and manage tenders on the blockchain with full audit trail
- **Smart Contract Payments**: Automated milestone-based payments using Algorand smart contracts with Inner Transactions
- **Wallet Integration**: Connect with Pera Wallet and MyAlgo Connect for secure blockchain transactions
- **Role-Based Dashboards**: Separate interfaces for government officials, contractors, and citizens
- **Real-time Tracking**: Monitor tender progress and payment status with blockchain verification
- **NFT Integration**: Mint and burn ARC-3 compliant NFTs for milestone verification and immutable proof of work

### Advanced Capabilities
- **Box Storage**: Efficient milestone data storage using Algorand Box Storage (TEAL v10)
- **Lora Explorer Integration**: Automatic generation of explorer URLs for all transactions and contracts
- **IPFS Metadata Storage**: Decentralized storage for NFT metadata
- **Admin Dashboard**: Aggregated statistics and analytics for system monitoring
- **JWT Authentication**: Secure role-based access control (Government/Contractor/Citizen)

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **UI Components**: Radix UI + Tailwind CSS
- **State Management**: React Hooks + Context API
- **Routing**: React Router
- **Charts**: Recharts for data visualization
- **API Communication**: Axios
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.8+)
- **Database**: PostgreSQL with SQLAlchemy (async) + SQLite for development
- **Blockchain**: Algorand Python SDK + PyTeal
- **Smart Contracts**: PyTeal with Box Storage (TEAL v10)
- **NFT Standard**: ARC-3 (Algorand Standard Asset)
- **Metadata Storage**: IPFS (Infura/Pinata)
- **Authentication**: JWT with bcrypt
- **API Documentation**: Auto-generated Swagger/OpenAPI

### Blockchain Integration
- **Network**: Algorand TestNet
- **Wallet Providers**: Pera Wallet (@perawallet/connect) + MyAlgo Connect (@randlabs/myalgo-connect)
- **Smart Contract Development**: PyTeal
- **SDK**: AlgoSDK for blockchain interactions
- **Explorer**: Lora Explorer integration

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)
- Git

### Manual Installation

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
# Windows: .\venv\Scripts\Activate.ps1
# Linux/Mac: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python init-db.py

# Start backend server
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔐 Test Wallets

The system comes with pre-configured test wallets for immediate testing:

### Maharashtra Government Wallet
- **Address**: `OV6WWA6GLWLOYVVUZ3JM4GCBDWN3JDPJ4O3MQWJHGWN4AQPIFUWQXGLZAI`

### Contractor Wallets
- **Contractor 1**: `Z5XKIA4ZTPPE3GVNT3JM4GCBDWN3JDPJ4O3MQWJHGWN4AQPIFUWQXGLZAI`
- **Contractor 2**: `6KAW3NT6B3RATHAQHFC7OOHUB3CAMZ3DACL4AULAEW65ZJY2MRPQZB2NO4`

> **Note**: These are TestNet wallets only. Never use with real funds.

## 📁 Project Structure

```
.
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── contracts/       # PyTeal smart contracts
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   ├── config.py        # Configuration
│   │   ├── database.py      # Database setup
│   │   └── main.py          # FastAPI app
│   ├── scripts/             # Deployment scripts
│   ├── venv/                # Virtual environment
│   ├── .env                 # Environment variables
│   ├── requirements.txt     # Python dependencies
│   └── init-db.py           # Database initialization
├── src/                     # React frontend
│   ├── components/          # React components
│   ├── pages/               # Page components
│   ├── services/            # API services
│   ├── contexts/            # React contexts
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── package.json             # Frontend dependencies
└── README.md                # This file
```

## 🎨 User Roles & Workflows

### Government Officials
1. Register/Login to the system
2. Create new tenders with detailed specifications
3. Review contractor applications
4. Select contractors for tenders
5. Deploy smart contracts for selected tenders
6. Verify milestone completion with Ed25519 signatures
7. Release payments through smart contracts

### Contractors
1. Register/Login to the system
2. Browse available tenders
3. Submit applications with proposals
4. Connect Algorand wallet
5. Upload proof of work for milestones
6. Track payment status
7. View NFTs for completed milestones

### Citizens
1. View public projects on interactive map
2. Report issues with ongoing projects
3. Analyze government spending patterns
4. Access transparency dashboard

## ⚡ Smart Contract Architecture

### Box Storage Implementation
- **Box Key Format**: `m_{milestone_index}` (e.g., "m_0", "m_1")
- **Box Data**: 17 bytes per milestone
  - Amount: 8 bytes (uint64)
  - Due Date: 8 bytes (uint64)
  - Status: 1 byte (0 = pending, 1 = verified, 2 = paid)

### Contract Methods
1. `add_milestone` - Add a new milestone (owner only)
2. `verify_milestone` - Verify milestone completion with signature (verifier only)
3. `release_payment` - Release payment for verified milestone (owner only)

### Global State
- `owner`: Owner address (byte slice)
- `contractor`: Contractor address (byte slice)
- `verifier`: Verifier address (byte slice)
- `total_amt`: Total contract amount (uint64)
- `m_count`: Milestone count (uint64)
- `curr_m`: Current milestone index (uint64)

## 🔗 Wallet Integration

### Pera Wallet Features
- One-click wallet connection
- Automatic session restoration
- Secure transaction signing
- Real-time balance retrieval
- Wallet disconnection handling

### Transaction Flow
1. Application creates transaction using algosdk
2. Transaction is sent to Pera Wallet for signing
3. User confirms transaction in Pera Wallet
4. Signed transaction is sent to backend
5. Backend sends transaction to Algorand blockchain

## 🖼️ NFT (ARC-3) Implementation

### Standard Compliance
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

## 🌐 API Endpoints

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

### Payments & NFTs
- `GET /api/payments` - List payments
- `GET /api/payments/{tx_id}` - Get payment details with Lora explorer URL
- `POST /api/nft/mint` - Mint ARC-3 NFT
- `POST /api/nft/burn` - Burn NFT
- `GET /api/nft/status/{nft_id}` - Get NFT status with Lora explorer URL

### Wallet & Blockchain
- `GET /api/wallet/balance` - Get wallet balance with explorer URL
- `GET /api/blockchain/tx/status/{tx_id}` - Get transaction status with Lora explorer URL
- `GET /api/blockchain/app/{app_id}` - Get application info with Lora explorer URL

### Admin
- `GET /api/admin/stats` - Get admin statistics

## 🛠️ Development

### Backend Development
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
npm run dev
```

### Building for Production
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend
npm run build
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
npm run test
```

## 🐳 Deployment

### Docker Deployment
```bash
docker-compose up --build
```

### Environment Variables
Create a `.env` file in the `backend` directory:
```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost/fairlens

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Algorand
ALGOD_API_URL=https://testnet-api.algonode.network
ALGOD_API_KEY=
ALGOD_INDEXER_URL=https://testnet-idx.algonode.network
ALGOD_INDEXER_KEY=
PRIVATE_KEY_MNEMONIC=your-25-word-testnet-wallet-mnemonic-here
ALGORAND_NETWORK=testnet

# IPFS (for NFT metadata)
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

## 🔒 Security Features

- **JWT tokens** for authentication with secure expiration
- **Role-based access control** (Government/Contractor/Citizen)
- **Wallet address validation** with backend verification
- **Secure password hashing** using bcrypt
- **CORS protection** with origin whitelisting
- **Input validation and sanitization** for all API endpoints
- **Rate limiting** for production deployments
- **HTTPS enforcement** for production environments

## 📚 Documentation

- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Lora Explorer**: https://lora.algokit.io/
- **Algorand Developer Portal**: https://dev.algorand.co/

## 🤝 Support

For issues and questions:
- Check the API documentation at http://localhost:8000/docs
- Visit Algorand Developer Portal: https://dev.algorand.co/
- Open an issue on the GitHub repository

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Algorand Blockchain**
