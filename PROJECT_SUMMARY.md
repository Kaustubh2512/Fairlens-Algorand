# FairLens - Project Summary

## Overview

FairLens is a production-ready blockchain-based transparent tender management system that ensures transparency and accountability in government-contractor relationships using Algorand blockchain.

## Features Implemented

### Backend (FastAPI)

1. **User Management**
   - JWT-based authentication
   - Role-based access control (Government/Contractor/Citizen)
   - Wallet connection (Algorand addresses)
   - User registration and login

2. **Tender Management**
   - Create tenders (Government only)
   - List all tenders (public)
   - Apply for tenders (Contractor)
   - Select contractors (Government)
   - Blockchain hash verification

3. **Smart Contract Deployment**
   - PyTeal smart contracts for milestone-based payments
   - Contract deployment on Algorand
   - Milestone verification and payment release
   - Inner transaction support for automatic payments

4. **NFT Management**
   - Mint NFTs (ARC-3 ASA) for project milestones
   - Burn NFTs after milestone completion
   - NFT status tracking
   - Metadata storage

5. **Payment Automation**
   - Milestone-based payment system
   - Automatic payment release via smart contracts
   - Payment history tracking
   - Transaction verification

6. **Blockchain Integration**
   - Algorand SDK integration
   - Wallet balance queries
   - Transaction status checking
   - Asset information retrieval

7. **Admin Dashboard**
   - Aggregated statistics
   - Total tenders and contracts
   - Payment tracking
   - NFT minting/burning stats

### Frontend (React + TypeScript)

1. **Authentication**
   - Government login
   - Contractor login
   - Citizen access
   - Wallet connection

2. **Government Dashboard**
   - Tender management
   - Project monitoring
   - Analytics and reporting
   - Blockchain verification

3. **Contractor Dashboard**
   - Tender discovery
   - Project management
   - Payment tracking
   - Performance metrics

4. **Citizen Dashboard**
   - Project transparency
   - Spending analytics
   - Issue reporting

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy (async)
- **Blockchain**: Algorand Python SDK
- **Smart Contracts**: PyTeal
- **Authentication**: JWT with bcrypt
- **API Documentation**: Auto-generated Swagger/OpenAPI

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Components**: Radix UI + Tailwind CSS
- **Charts**: Recharts
- **State Management**: React Hooks

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration
│   ├── database.py             # Database setup
│   ├── models/                 # SQLAlchemy models
│   ├── schemas/                # Pydantic schemas
│   ├── routes/                 # API routes
│   ├── services/               # Business logic
│   ├── contracts/              # PyTeal smart contracts
│   └── utils/                  # Utilities
├── scripts/                    # Deployment scripts
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Docker configuration
└── README.md                   # Backend documentation

frontend/
├── src/
│   ├── components/             # React components
│   ├── lib/                    # API client
│   ├── App.tsx                 # Main app
│   └── main.tsx                # Entry point
├── package.json                # Node dependencies
└── vite.config.ts              # Vite configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/connect-wallet` - Connect Algorand wallet
- `GET /api/auth/profile` - Get user profile

### Tenders
- `POST /api/tenders/create` - Create new tender
- `GET /api/tenders` - List all tenders
- `GET /api/tenders/{id}` - Get tender details
- `POST /api/tenders/{id}/apply` - Apply for tender
- `POST /api/tenders/{id}/select/{application_id}` - Select contractor

### Contracts
- `POST /api/contracts/deploy` - Deploy smart contract
- `GET /api/contracts` - List contracts
- `GET /api/contracts/{id}` - Get contract details

### Milestones
- `POST /api/milestones/create` - Create milestone
- `GET /api/milestones/contract/{contract_id}` - Get contract milestones
- `POST /api/milestones/{id}/verify` - Verify milestone
- `POST /api/milestones/{id}/release` - Release payment

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

- **users**: User accounts with roles and wallet addresses
- **tenders**: Tender listings with blockchain hashes
- **applications**: Contractor applications for tenders
- **contracts**: Smart contracts with Algorand app IDs
- **milestones**: Project milestones with payment amounts
- **transactions**: Blockchain transactions

## Smart Contract

The PyTeal smart contract (`FairLensContract`) includes:
- Owner, contractor, and verifier address storage
- Milestone verification logic
- Automatic payment release via inner transactions
- State management for milestone tracking

## Setup Instructions

### Backend

1. Install dependencies: `pip install -r requirements.txt`
2. Set up PostgreSQL database
3. Configure environment variables (see `env.example`)
4. Run: `uvicorn app.main:app --reload`

### Frontend

1. Install dependencies: `npm install`
2. Configure environment variables (see `.env.example`)
3. Run: `npm run dev`

## Deployment

See `backend/DEPLOYMENT.md` for detailed deployment instructions including:
- Docker deployment
- Production setup
- Security checklist
- Monitoring and logging

## Next Steps

1. **Testing**: Add comprehensive unit and integration tests
2. **Wallet Integration**: Complete Pera/MyAlgo wallet integration on frontend
3. **Smart Contract Deployment**: Implement actual contract deployment flow
4. **NFT Metadata**: Integrate IPFS for NFT metadata storage
5. **Payment Flow**: Complete end-to-end payment release flow
6. **Frontend Components**: Update remaining components to use real API
7. **Error Handling**: Enhance error handling and user feedback
8. **Security**: Add rate limiting, input validation, and security headers

## Documentation

- Backend API: http://localhost:8000/docs (Swagger UI)
- Backend README: `backend/README.md`
- Deployment Guide: `backend/DEPLOYMENT.md`
- Setup Guide: `backend/FAIRLENS_SETUP.md`

## License

MIT License

## Support

For issues and questions, please refer to the documentation or open an issue on the repository.


