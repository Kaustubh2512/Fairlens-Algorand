# FairLens Test Wallets

This document contains the pre-configured test wallets for the FairLens platform. These wallets are funded with TestNet ALGOs and can be used to test the complete tender management workflow.

## Test Wallet Information

### 1. Maharashtra Government Wallet
- **Address**: `OV6WWA6GLWLOYVVUZ3JM4GCBDWN3JDPJ4O3MQWJHGWN4AQPIFUWQXGLZAI`
- **Mnemonic**: `degree rather found bundle tip interest hill ginger guard crack traffic exit impose acquire exclude actress iron oak spell tornado digital juice because above list`

### 2. Contractor 1 Wallet
- **Address**: `Z5XKIA4ZTPPE3GVNT353MPOBY7QDR2KVTAZBN4LTVX3QVQNCM5VS47M4HU`
- **Mnemonic**: `couple fun cheese episode artwork mutual swear era boat rare learn cargo guide tackle profit reopen dash perfect faint river rug december comic absorb dog`

### 3. Contractor 2 Wallet
- **Address**: `6KAW3NT6B3RATHAQHFC7OOHUB3CAMZ3DACL4AULAEW65ZJY2MRPQZB2NO4`
- **Mnemonic**: `crawl medal hint abstract now cover palace solar huge job critic border silver review come runway pen bulk burger item flock skull turn able black`

## How to Use These Wallets

1. **For Government Operations**:
   - Use the Maharashtra Government wallet to create tenders and select contractors
   - This wallet acts as the "government official" in the system

2. **For Contractor Operations**:
   - Use Contractor 1 or Contractor 2 wallets to apply for tenders
   - These wallets act as "contractors" in the system

3. **Wallet Connection**:
   - In the frontend, connect to these wallets using Pera Wallet or MyAlgo Connect
   - Enter the mnemonic phrases when prompted by the wallet provider

## Important Notes

- **TestNet Only**: These wallets are for TestNet use only - never use with real funds
- **Pre-funded**: Each wallet has been pre-funded with 100 TestNet ALGOs
- **Workflow Testing**: Use these accounts to test the full tender workflow:
  1. Government creates tender
  2. Contractors apply for tender
  3. Government selects contractor
  4. Smart contract is deployed
  5. Milestones are verified
  6. Payments are released
- **Security**: Never share your real wallet mnemonics in code or documentation

## Funding Additional Test ALGOs

If you need more TestNet ALGOs, you can use the faucet at:
- https://bank.testnet.algorand.network/

Or run the funding script:
```bash
cd backend
python scripts/fund_test_wallets.py
```

## Verification

You can verify these wallets are working correctly by:
1. Checking balances using the wallet dashboard
2. Running the test script: `python scripts/test_wallets.py`
3. Using the Algorand Block Explorer: https://testnet.algoexplorer.io/