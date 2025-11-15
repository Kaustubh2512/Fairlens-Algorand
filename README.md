# FairLens - Transparent Tender Management System

FairLens is a blockchain-based transparent tender management system built on the Algorand blockchain. It enables governments to create tenders, contractors to apply, and milestone-based payments to be automatically released through smart contracts.

## Features

- **Transparent Tender Management**: Create, view, and manage tenders on the blockchain
- **Smart Contract Payments**: Automated milestone-based payments using Algorand smart contracts
- **Wallet Integration**: Connect with Pera Wallet and MyAlgo Connect
- **Role-Based Dashboards**: Separate interfaces for government officials and contractors
- **Real-time Tracking**: Monitor tender progress and payment status
- **NFT Integration**: Mint and burn NFTs for milestone verification

## Tech Stack

### Frontend
- React + TypeScript + Vite
- TailwindCSS for styling
- React Router for navigation
- Axios for API communication
- Lucide React for icons
- Recharts for data visualization

### Backend
- FastAPI (Python)
- SQLite database (with aiosqlite)
- SQLAlchemy for ORM
- Pydantic for data validation
- JWT for authentication

### Blockchain
- Algorand TestNet
- PyTeal for smart contract development
- AlgoSDK for blockchain interactions
- ARC-3 compliant NFTs

### Wallet Integration
- Pera Wallet (@perawallet/connect)
- MyAlgo Connect (@randlabs/myalgo-connect)

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)
- Git

## Installation

### Option 1: Quick Start (Recommended)

Run the complete system with one command:

**On Windows:**
```cmd
run-all.bat
```

**On Mac/Linux:**
```bash
chmod +x run-all.sh
./run-all.sh
```

### Option 2: Manual Installation

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   # On Windows
   python -m venv venv
   venv\Scripts\activate
   
   # On Mac/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Initialize the database:
   ```bash
   python init-db.py
   ```

5. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

#### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

## Environment Variables

### Backend (.env)
Create a `.env` file in the `backend` directory:
```env
# Database
DATABASE_URL=sqlite+aiosqlite:///./fairlens.db

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Algorand
ALGOD_API_URL=https://testnet-api.algonode.network
ALGOD_API_KEY=
ALGOD_INDEXER_URL=https://testnet-idx.algonode.network
ALGOD_INDEXER_KEY=
PRIVATE_KEY_MNEMONIC=your-test-mnemonic-here

# IPFS (for NFT metadata)
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_PROJECT_ID=your-ipfs-project-id
IPFS_PROJECT_SECRET=your-ipfs-project-secret
IPFS_GATEWAY=https://ipfs.io/ipfs/

# Network
ALGORAND_NETWORK=testnet

# Application
ENVIRONMENT=development
DEBUG=True
```

### Frontend (.env)
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:8000/api
VITE_NETWORK=testnet
```

## Project Structure

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
│   ├── run.sh               # Linux/Mac run script
│   ├── run.bat              # Windows run script
│   └── init-db.py           # Database initialization
├── src/                     # React frontend
│   ├── components/          # React components
│   ├── pages/               # Page components
│   ├── services/            # API services
│   ├── assets/              # Static assets
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── package.json             # Frontend dependencies
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── run-all.sh               # Linux/Mac complete system run script
├── run-all.bat              # Windows complete system run script
└── README.md                # This file
```

## Usage

### For Government Officials
1. Register/Login to the system
2. Create new tenders with detailed specifications
3. Review contractor applications
4. Select contractors for tenders
5. Deploy smart contracts for selected tenders
6. Verify milestone completion
7. Release payments through smart contracts

### For Contractors
1. Register/Login to the system
2. Browse available tenders
3. Submit applications with proposals
4. Connect Algorand wallet
5. Upload proof of work for milestones
6. Track payment status
7. View NFTs for completed milestones

## Smart Contract Functionality

The FairLens smart contract is written in PyTeal and provides:

- **Milestone Management**: Track project milestones with deadlines and amounts
- **Proof Verification**: Verify milestone completion with Ed25519 signatures
- **Automated Payments**: Release payments automatically upon verification
- **Emergency Controls**: Pause/resume contract functionality
- **Verifier Management**: Update verifier with timelock protection
- **Box Storage**: Efficient storage for milestone data

### Contract Methods
1. `add_milestone` - Add a new milestone
2. `verify_milestone` - Verify milestone completion with signature
3. `release_payment` - Release payment for verified milestone
4. `emergency_pause` - Pause contract operations
5. `resume_contract` - Resume contract operations
6. `update_verifier` - Update verifier address with timelock

## Wallet Integration

Connect your Algorand wallet to:
- Pera Wallet
- MyAlgo Connect

The frontend provides wallet connection components that:
- Connect to user's Algorand wallet
- Save wallet address to localStorage
- Send wallet address to backend for user linking
- Display truncated wallet address in UI

## NFT Integration

FairLens uses ARC-3 compliant NFTs for:
- Representing milestone completion
- Providing immutable proof of work
- Tracking project progress on-chain

NFTs are minted when milestones are verified and burned when payments are released.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/connect-wallet` - Connect Algorand wallet

### Tenders
- `POST /api/tenders/create` - Create new tender
- `GET /api/tenders` - List all tenders
- `GET /api/tenders/{id}` - Get tender details
- `POST /api/tenders/{id}/apply` - Apply for tender
- `POST /api/tenders/{id}/select/{application_id}` - Select contractor

### Contracts
- `POST /api/contracts/deploy` - Deploy smart contract
- `GET /api/contracts` - List user contracts
- `GET /api/contracts/{id}` - Get contract details

### Milestones
- `POST /api/milestones/create` - Create milestone
- `GET /api/milestones/contract/{contract_id}` - Get contract milestones
- `POST /api/milestones/{id}/verify` - Verify milestone
- `POST /api/milestones/{id}/release` - Release payment

### NFTs
- `POST /api/nft/mint` - Mint NFT for milestone
- `POST /api/nft/burn` - Burn NFT after payment
- `GET /api/nft/status/{nft_id}` - Get NFT status

### Wallet
- `GET /api/wallet/balance` - Get wallet balance

## Development

### Backend Development
```bash
cd backend
uvicorn app.main:app --reload
```

### Frontend Development
```bash
npm run dev
```

### Building for Production

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
npm run build
```

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
npm run test
```

## Deployment

The application can be deployed using Docker:

```bash
docker-compose up --build
```

Or using the provided run scripts:
- `run-all.sh` (Linux/Mac)
- `run-all.bat` (Windows)

## Security

- JWT tokens for authentication
- Role-based access control
- Wallet address validation
- Secure password hashing
- CORS protection
- Input validation and sanitization

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on the GitHub repository or contact the development team.