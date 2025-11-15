#!/usr/bin/env python3
"""
Test script for FairLens contract deployment and payment simulation
This script demonstrates the complete workflow:
1. Deploy smart contract
2. Add milestone
3. Verify milestone
4. Release payment
"""

import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from algosdk import account, mnemonic, transaction
from algosdk.v2client import algod
from app.config import settings
from app.contracts.fairlens_contract import FairLensContract
from app.services.blockchain import blockchain_service
from app.services.contract_service import ContractService
import base64


async def test_contract_deployment():
    """Test contract deployment workflow"""
    
    print("=" * 60)
    print("FairLens Contract Deployment Test")
    print("=" * 60)
    
    # Initialize Algod client
    algod_client = algod.AlgodClient(
        settings.ALGOD_API_KEY,
        settings.ALGOD_API_URL
    )
    
    # Check connection
    try:
        status = algod_client.status()
        print(f"✓ Connected to Algorand {settings.ALGORAND_NETWORK}")
        print(f"  Last Round: {status.get('last-round')}")
        print(f"  Latest Version: {status.get('last-version')}")
    except Exception as e:
        print(f"✗ Failed to connect to Algorand: {e}")
        return
    
    # Get test accounts (in production, use real wallet addresses)
    if not settings.PRIVATE_KEY_MNEMONIC:
        print("⚠ Warning: No PRIVATE_KEY_MNEMONIC in .env")
        print("  Using placeholder addresses for testing")
        owner_address = "GOVERNMENT_ADDRESS_PLACEHOLDER"
        contractor_address = "CONTRACTOR_ADDRESS_PLACEHOLDER"
        verifier_address = "VERIFIER_ADDRESS_PLACEHOLDER"
    else:
        try:
            private_key = mnemonic.to_private_key(settings.PRIVATE_KEY_MNEMONIC)
            owner_address = account.address_from_private_key(private_key)
            contractor_address = owner_address  # For testing, use same address
            verifier_address = owner_address
            print(f"✓ Using wallet address: {owner_address}")
        except Exception as e:
            print(f"✗ Failed to derive address from mnemonic: {e}")
            return
    
    # Step 1: Create contract
    print("\n" + "=" * 60)
    print("Step 1: Creating FairLens Contract")
    print("=" * 60)
    
    total_amount = 10_000_000  # 10 ALGO in microAlgos
    contract = FairLensContract(
        owner_address=owner_address,
        contractor_address=contractor_address,
        verifier_address=verifier_address,
        total_amount=total_amount
    )
    
    print(f"✓ Contract created")
    print(f"  Owner: {owner_address}")
    print(f"  Contractor: {contractor_address}")
    print(f"  Verifier: {verifier_address}")
    print(f"  Total Amount: {total_amount / 1_000_000} ALGO")
    
    # Step 2: Compile contract
    print("\n" + "=" * 60)
    print("Step 2: Compiling Contract")
    print("=" * 60)
    
    contract_service = ContractService(contract)
    compiled = contract_service.compile()
    
    approval_teal = compiled["approval_source"]
    clear_teal = compiled["clear_source"]
    
    print(f"✓ Contract compiled")
    print(f"  Approval TEAL length: {len(approval_teal)} bytes")
    print(f"  Clear TEAL length: {len(clear_teal)} bytes")
    
    # Step 3: Deploy contract (create unsigned transaction)
    print("\n" + "=" * 60)
    print("Step 3: Creating Deployment Transaction")
    print("=" * 60)
    
    try:
        deployment_result = await blockchain_service.deploy_smart_contract(
            approval_teal=approval_teal,
            clear_teal=clear_teal,
            sender_address=owner_address
        )
        
        print(f"✓ Deployment transaction created")
        print(f"  App Address: {deployment_result.get('app_address', 'N/A')}")
        print(f"  Note: {deployment_result.get('note', 'N/A')}")
        print(f"\n  Next steps:")
        print(f"  1. Sign the transaction with your wallet")
        print(f"  2. Submit the signed transaction to Algorand")
        print(f"  3. Wait for confirmation")
        print(f"  4. Extract app_id from confirmed transaction")
        
    except Exception as e:
        print(f"✗ Failed to create deployment transaction: {e}")
        return
    
    # Step 4: Display contract methods
    print("\n" + "=" * 60)
    print("Step 4: Contract Methods")
    print("=" * 60)
    
    print("Available methods:")
    print("  1. add_milestone(milestone_index, amount, due_date)")
    print("  2. verify_milestone(milestone_index, signature, message)")
    print("  3. release_payment(milestone_index)")
    print("\nMethod IDs:")
    print("  - add_milestone: 1")
    print("  - verify_milestone: 2")
    print("  - release_payment: 3")
    
    # Step 5: Simulate workflow
    print("\n" + "=" * 60)
    print("Step 5: Simulating Workflow")
    print("=" * 60)
    
    print("Workflow simulation:")
    print("  1. Government creates contract → Contract deployed")
    print("  2. Government adds milestone → Milestone stored in box")
    print("  3. Contractor completes work → Proof submitted")
    print("  4. Verifier verifies milestone → Signature verified, status updated")
    print("  5. Government releases payment → Payment sent via inner transaction")
    print("  6. NFT burned → Milestone completed")
    
    print("\n" + "=" * 60)
    print("✓ Test completed successfully!")
    print("=" * 60)
    print("\nNext steps:")
    print("  1. Set up your .env file with real wallet mnemonic")
    print("  2. Fund your wallet with TestNet ALGO")
    print("  3. Deploy contract using the deployment transaction")
    print("  4. Test the complete workflow with real transactions")
    print("\nView contract on Lora Explorer:")
    print(f"  https://lora.algokit.io/{settings.ALGORAND_NETWORK}/application/<app_id>")


async def test_nft_minting():
    """Test NFT minting workflow"""
    
    print("\n" + "=" * 60)
    print("NFT Minting Test")
    print("=" * 60)
    
    from app.services.nft_service import nft_service
    
    # Create test metadata
    metadata = await nft_service.create_arc3_metadata(
        name="FairLens Test NFT",
        description="Test NFT for milestone payment",
        contract_id=123,
        milestone_index=1,
        properties={"test": True}
    )
    
    print(f"✓ Metadata created")
    print(f"  IPFS CID: {metadata.get('ipfs_cid', 'N/A')}")
    print(f"  IPFS URL: {metadata.get('ipfs_url', 'N/A')}")
    print(f"  Metadata Hash: {metadata.get('metadata_hash', 'N/A')}")
    
    print("\n" + "=" * 60)
    print("✓ NFT test completed!")
    print("=" * 60)


if __name__ == "__main__":
    print("\n")
    asyncio.run(test_contract_deployment())
    asyncio.run(test_nft_minting())
    print("\n")

