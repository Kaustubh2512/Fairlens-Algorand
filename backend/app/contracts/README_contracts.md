# FairLens Smart Contracts

This directory contains the PyTeal smart contracts for the FairLens platform.

## Overview

The FairLens smart contract handles milestone-based payments for tender management using Algorand's Box Storage for efficient data management.

## Contract Features

1. **Milestone Management**: Store and track milestone data using Box Storage
2. **Role-Based Access**: Owner, Contractor, and Verifier roles with specific permissions
3. **Payment Processing**: Automatic payments via Inner Transactions after verification
4. **Signature Verification**: Ed25519 signature verification for milestone approvals
5. **State Management**: Efficient state management using global state and boxes
6. **Security Features**: Emergency pause, verifier rotation with timelock, replay protection
7. **Proof Tamper Detection**: Store proof hashes on-chain for verification

## Contract Methods

### 1. Add Milestone (Method ID: 1)
- **Caller**: Owner only
- **Parameters**: 
  - milestone_index (int)
  - amount (int, microAlgos)
  - due_date (int, timestamp)
- **Description**: Adds a new milestone to the contract

### 2. Verify Milestone (Method ID: 2)
- **Caller**: Verifier only
- **Parameters**: 
  - milestone_index (int)
  - signature (64 bytes, Ed25519 signature)
  - message (bytes, verification message)
  - proof_hash (bytes, SHA256 hash of proof document)
- **Description**: Verifies milestone completion with signature validation and proof tamper detection

### 3. Release Payment (Method ID: 3)
- **Caller**: Owner only
- **Parameters**: 
  - milestone_index (int)
- **Description**: Releases payment to contractor via Inner Transaction

### 4. Emergency Pause (Method ID: 4)
- **Caller**: Owner only
- **Description**: Pauses all contract operations for emergency situations

### 5. Resume Contract (Method ID: 5)
- **Caller**: Owner only
- **Description**: Resumes contract operations after emergency pause

### 6. Update Verifier (Method ID: 6)
- **Caller**: Owner only
- **Parameters**: 
  - new_verifier_address (bytes, Algorand address)
- **Description**: Updates the verifier address with a 24-hour timelock for security

## Box Storage Structure

Milestones are stored in boxes with the key format: `m_{milestone_index}`

Each box contains:
- Amount (8 bytes)
- Due date (8 bytes)
- Status (1 byte): 0=pending, 1=verified, 2=paid
- Proof hash (optional, variable length): SHA256 hash of proof document

## Global State

- `owner`: Contract owner address
- `contractor`: Contractor address
- `verifier`: Verifier address
- `total_amt`: Total contract amount
- `m_count`: Number of milestones
- `curr_m`: Current milestone index
- `paused`: Emergency pause flag (0=not paused, 1=paused)
- `verifier_update`: Last verifier update timestamp
- `verifier_timelock`: Timelock duration for verifier updates (default 24 hours)

## Security Features

### 1. Emergency Pause
The owner can pause all contract operations in case of emergency. All methods except resume are blocked when paused.

### 2. Verifier Rotation with Timelock
The owner can update the verifier address, but changes are subject to a 24-hour timelock to prevent instant hijacking.

### 3. Replay Protection
All verification messages include a timestamp to prevent replay attacks.

### 4. Proof Tamper Detection
SHA256 hashes of proof documents are stored on-chain to detect tampering.

### 5. Signature Verification
Uses Ed25519 for secure attestation verification with on-chain validation.

## Deployment

The contract is deployed through the backend service when a tender is awarded to a contractor.

## Testing

Run the contract locally:
```bash
python fairlens_contract.py
```

This will output the compiled TEAL code for both approval and clear programs.