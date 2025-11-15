# FairLens - Complete Setup Guide

## Overview

FairLens is a blockchain-based transparent tender management system built with FastAPI (backend) and React (frontend), using Algorand blockchain for smart contracts and NFT-based milestone payments.

## Architecture

- **Backend**: FastAPI + PostgreSQL + Algorand SDK
- **Frontend**: React + TypeScript + Vite
- **Blockchain**: Algorand (TestNet/MainNet)
- **Smart Contracts**: PyTeal
- **Authentication**: JWT
- **Database**: PostgreSQL with SQLAlchemy (async)

## Quick Start

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Database Setup**
```bash
# Create PostgreSQL database
createdb fairlens
```

3. **Environment Configuration**
```bash
cp env.example .env
# Edit .env with your configuration
```

4. **Run Backend**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:8000
```

3. **Run Frontend**
```bash
npm run dev
```

## API Endpoints

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
- `GET /api/payments/{tx_id}` - Get payment details

### NFT
- `POST /api/nft/mint` - Mint NFT
- `POST /api/nft/burn` - Burn NFT
- `GET /api/nft/status/{nft_id}` - Get NFT status

### Wallet
- `GET /api/wallet/balance` - Get wallet balance

### Admin
- `GET /api/admin/stats` - Get admin statistics

## Database Schema

- **users**: User accounts (government, contractor, citizen)
- **tenders**: Tender listings
- **applications**: Contractor applications for tenders
- **contracts**: Smart contracts deployed on Algorand
- **milestones**: Project milestones with payment amounts
- **transactions**: Blockchain transactions (payments, NFT mint/burn)

## Smart Contract Deployment

The backend includes PyTeal smart contracts for milestone-based payments. To deploy:

```bash
python backend/scripts/deploy_contract.py
```

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

See `backend/DEPLOYMENT.md` for detailed deployment instructions.

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql+asyncpg://user:password@localhost/fairlens
JWT_SECRET=your-secret-key
ALGOD_API_URL=https://testnet-api.algonode.network
ALGOD_API_KEY=
ALGOD_INDEXER_URL=https://testnet-idx.algonode.network
ALGOD_INDEXER_KEY=
PRIVATE_KEY_MNEMONIC=your-wallet-mnemonic
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000
```

## Security Notes

- Never commit `.env` files with real secrets
- Use strong `JWT_SECRET` in production
- Store `PRIVATE_KEY_MNEMONIC` securely
- Enable HTTPS in production
- Implement rate limiting
- Use environment-specific database credentials

## Support

For issues and questions, please refer to the documentation or open an issue on the repository.


