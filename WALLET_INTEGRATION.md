# Wallet Integration Guide

This document explains how the Pera Wallet integration works in the FairLens application.

## Overview

The FairLens application integrates with Pera Wallet to provide secure blockchain transactions for tender management. The integration includes:

1. Wallet connection and disconnection
2. Transaction signing
3. Balance retrieval
4. Secure communication with the backend

## Architecture

### Frontend Components

1. **WalletContext** - Global state management for wallet connection
2. **WalletConnectButton** - UI component for connecting/disconnecting wallet
3. **WalletService** - Service layer for wallet-related API calls
4. **Page Components** - All pages show wallet connection status

### Backend Components

1. **Wallet Routes** - API endpoints for wallet operations
2. **Blockchain Service** - Interaction with Algorand blockchain
3. **Authentication** - Wallet address verification

## Implementation Details

### Wallet Connection Flow

1. User clicks "Connect Pera Wallet" button
2. PeraWalletConnect SDK opens wallet connection modal
3. User approves connection in Pera Wallet
4. Wallet address is sent to backend for verification
5. Wallet context is updated with connection status

### Transaction Signing Flow

1. Application creates transaction using algosdk
2. Transaction is sent to Pera Wallet for signing
3. User confirms transaction in Pera Wallet
4. Signed transaction is sent to backend
5. Backend sends transaction to Algorand blockchain

### Balance Retrieval

1. Wallet address is used to call backend API
2. Backend queries Algorand blockchain for account balance
3. Balance is returned to frontend and displayed

## Key Files

- `src/contexts/WalletContext.tsx` - Wallet state management
- `src/components/WalletConnectButton.tsx` - Connection UI
- `src/services/walletService.ts` - API communication
- `backend/app/routes/wallet.py` - Wallet API endpoints
- `backend/app/services/blockchain.py` - Blockchain interaction

## Usage

### Connecting Wallet

```typescript
import { useWallet } from '../contexts/WalletContext';

const MyComponent = () => {
  const { isConnected, connectWallet, disconnectWallet } = useWallet();
  
  return (
    <button onClick={connectWallet}>
      Connect Wallet
    </button>
  );
};
```

### Signing Transactions

```typescript
import { useWallet } from '../contexts/WalletContext';
import algosdk from 'algosdk';

const MyComponent = () => {
  const { signTransaction, accountAddress } = useWallet();
  
  const handleTransaction = async () => {
    // Create transaction using algosdk
    const transaction = new algosdk.Transaction(params);
    
    // Sign transaction
    const signedTxn = await signTransaction([transaction]);
    
    // Send to backend
    // ...
  };
};
```

## Security Considerations

1. All wallet interactions are handled by Pera Wallet SDK
2. Private keys never leave the user's wallet
3. Transactions must be signed by the user
4. Backend verifies wallet ownership before processing transactions