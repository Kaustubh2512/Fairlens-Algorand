#!/usr/bin/env python3
"""
Script to deploy FairLens smart contract manually
"""

import asyncio
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.blockchain import blockchain_service
from app.contracts.fairlens_contract import FairLensContract
from app.config import settings
import algosdk
from algosdk import transaction, mnemonic


async def deploy_contract():
    """Deploy a sample FairLens contract"""
    
    if not settings.PRIVATE_KEY_MNEMONIC:
        print("Error: PRIVATE_KEY_MNEMONIC not set in environment variables")
        return
    
    try:
        # Get account from mnemonic
        private_key = mnemonic.to_private_key(settings.PRIVATE_KEY_MNEMONIC)
        account_address = algosdk.account.address_from_private_key(private_key)
        
        print(f"Deploying contract from account: {account_address}")
        
        # Check account balance
        account_info = blockchain_service.algod_client.account_info(account_address)
        balance = account_info.get('amount', 0)
        print(f"Account balance: {balance} microAlgos")
        
        if balance < 1000000:  # Need at least 1 ALGO for fees
            print("Warning: Low account balance. Please fund the account.")
            return
        
        # Create contract instance
        contract = FairLensContract(
            owner_address=account_address,
            contractor_address=account_address,  # For demo, use same address
            verifier_address=account_address
        )
        
        # Compile contract
        compiled = contract.compile()
        approval_teal = compiled["approval_source"]
        clear_teal = compiled["clear_source"]
        
        print("Contract compiled successfully")
        print(f"Approval program length: {len(approval_teal)} bytes")
        print(f"Clear program length: {len(clear_teal)} bytes")
        
        # Compile TEAL to bytecode using algod
        approval_result = blockchain_service.algod_client.compile(approval_teal)
        clear_result = blockchain_service.algod_client.compile(clear_teal)
        
        approval_program = approval_result['result']
        clear_program = clear_result['result']
        
        print(f"Approval program bytecode: {len(approval_program)} bytes")
        print(f"Clear program bytecode: {len(clear_program)} bytes")
        
        # Create application creation transaction
        global_schema = transaction.StateSchema(num_uints=7, num_byte_slices=4)
        local_schema = transaction.StateSchema(num_uints=0, num_byte_slices=0)
        
        params = blockchain_service.algod_client.suggested_params()
        
        # Create the application creation transaction
        txn = transaction.ApplicationCreateTxn(
            sender=account_address,
            sp=params,
            on_complete=transaction.OnComplete.NoOpOC.real,
            approval_program=approval_program,
            clear_program=clear_program,
            global_schema=global_schema,
            local_schema=local_schema,
            extra_pages=1  # For larger contracts
        )
        
        # Sign transaction
        signed_txn = txn.sign(private_key)
        
        # Submit transaction
        txid = blockchain_service.algod_client.send_transaction(signed_txn)
        print(f"Transaction ID: {txid}")
        
        # Wait for confirmation
        print("Waiting for transaction confirmation...")
        confirmed_txn = transaction.wait_for_confirmation(blockchain_service.algod_client, txid, 4)
        
        app_id = confirmed_txn["application-index"]
        print(f"Contract deployed successfully!")
        print(f"Application ID: {app_id}")
        
        # Save TEAL files
        teal_dir = Path(__file__).parent.parent / "contracts" / "teal"
        teal_dir.mkdir(parents=True, exist_ok=True)
        
        approval_file = teal_dir / "fairlens_approval.teal"
        clear_file = teal_dir / "fairlens_clear.teal"
        
        approval_file.write_text(approval_teal)
        clear_file.write_text(clear_teal)
        
        print(f"\nTEAL files saved to:")
        print(f"  - {approval_file}")
        print(f"  - {clear_file}")
        
        # Save deployment info
        deployment_info = {
            "app_id": app_id,
            "app_address": algosdk.logic.get_application_address(app_id),
            "creator": account_address,
            "txid": txid,
            "timestamp": confirmed_txn.get("confirmed-round", 0)
        }
        
        deployment_file = teal_dir / "deployment_info.json"
        import json
        deployment_file.write_text(json.dumps(deployment_info, indent=2))
        print(f"\nDeployment info saved to: {deployment_file}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(deploy_contract())