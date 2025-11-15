# Wallet Usage in FairLens Platform

This document explains how to use the provided test wallets in the FairLens platform for testing the complete tender management workflow.

## Test Wallets Overview

The FairLens platform comes with three pre-configured test wallets:

1. **Maharashtra Government** - For creating tenders and acting as the government entity
2. **Contractor 1** - For applying to tenders as the first contractor
3. **Contractor 2** - For applying to tenders as the second contractor

## Connecting Wallets in the Frontend

### Step 1: Access the Platform
1. Start the FairLens platform using `run-all.bat` (Windows) or `run-all.sh` (Mac/Linux)
2. Open your browser to `http://localhost:5173`
3. Register or login to the platform

### Step 2: Connect Your Wallet
1. Click on the "Connect Wallet" button in the top right corner
2. Select either "Pera Wallet" or "MyAlgo" 
3. When prompted, enter one of the test mnemonics:
   - For Government operations: Use the Maharashtra Government mnemonic
   - For Contractor operations: Use either Contractor 1 or Contractor 2 mnemonic

### Step 3: Verify Connection
1. After successful connection, you should see a truncated version of your wallet address in the top right corner
2. The wallet address will be saved in your user profile

## Testing the Tender Workflow

### Government User Flow
1. Login with the Maharashtra Government account
2. Navigate to the Tenders page
3. Create a new tender by clicking "Create Tender"
4. Fill in the tender details and submit
5. Review applications from contractors
6. Select a contractor for your tender
7. Deploy the smart contract for the selected tender

### Contractor User Flow
1. Login with either Contractor 1 or Contractor 2 account
2. Navigate to the Tenders page
3. Browse available tenders
4. Apply to a tender by clicking "Apply" and submitting your bid
5. Wait for government selection
6. Once selected, connect your wallet to interact with the smart contract
7. Submit milestone completion proofs
8. Track payment status

## Smart Contract Interactions

### Deploying Contracts
- Only government users can deploy smart contracts
- Deployment happens automatically when a contractor is selected for a tender
- The smart contract will be deployed to Algorand TestNet

### Milestone Management
- Contractors submit milestone completion proofs
- Government verifies milestones through the platform
- Payments are automatically released via the smart contract

### NFT Integration
- NFTs are minted for verified milestones
- NFTs are burned when payments are released
- Track your NFTs in the wallet dashboard

## Troubleshooting

### Wallet Connection Issues
1. Ensure you're using the correct mnemonic for the role you want to test
2. Make sure you're on the TestNet network in your wallet
3. Refresh the page if the connection doesn't appear to work

### Transaction Failures
1. Check that your wallet has sufficient TestNet ALGOs (each wallet has 100)
2. Verify you're using the correct wallet for your role
3. Check the browser console for error messages

### Smart Contract Issues
1. Ensure the backend is running properly
2. Check that the Algorand TestNet is accessible
3. Verify the contract deployment script in the backend

## Getting More TestNet ALGOs

If you need more TestNet ALGOs:

1. Visit the Algorand TestNet faucet: https://bank.testnet.algorand.network/
2. Or run the funding script:
   ```bash
   cd backend
   python scripts/fund_test_wallets.py
   ```

## Security Notes

- These are TestNet wallets only - never use with real funds
- The mnemonics are provided for testing purposes only
- Never share your real wallet mnemonics in code or documentation
- Always use TestNet for development and testing