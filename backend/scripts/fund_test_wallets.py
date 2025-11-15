#!/usr/bin/env python3
"""
Script to fund test wallets with TestNet ALGOs
Note: This script requires a funded account to send ALGOs from
"""

import asyncio
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings
from app.services.blockchain import blockchain_service
import algosdk
from algosdk import transaction, mnemonic


async def fund_wallet(sender_mnemonic: str, recipient_address: str, amount_algo: float):
    """Fund a wallet with TestNet ALGOs"""
    try:
        # Get sender details
        sender_private_key = mnemonic.to_private_key(sender_mnemonic)
        sender_address = algosdk.account.address_from_private_key(sender_private_key)
        
        print(f"Funding {recipient_address} with {amount_algo} ALGOs from {sender_address}")
        
        # Get account balance
        account_info = blockchain_service.algod_client.account_info(sender_address)
        balance = account_info.get('amount', 0) / 1_000_000
        print(f"Sender balance: {balance} ALGOs")
        
        if balance < amount_algo + 0.1:  # Need extra for fees
            print(f"Insufficient balance. Need at least {amount_algo + 0.1} ALGOs")
            return False
        
        # Create payment transaction
        params = blockchain_service.algod_client.suggested_params()
        amount_microalgo = int(amount_algo * 1_000_000)
        
        txn = transaction.PaymentTxn(
            sender=sender_address,
            sp=params,
            receiver=recipient_address,
            amt=amount_microalgo,
            note=b"FairLens TestNet Funding"
        )
        
        # Sign transaction
        signed_txn = txn.sign(sender_private_key)
        
        # Send transaction
        txid = blockchain_service.algod_client.send_transaction(signed_txn)
        print(f"Transaction ID: {txid}")
        
        # Wait for confirmation
        print("Waiting for confirmation...")
        confirmed_txn = transaction.wait_for_confirmation(blockchain_service.algod_client, txid, 4)
        print(f"Transaction confirmed in round {confirmed_txn['confirmed-round']}")
        
        return True
        
    except Exception as e:
        print(f"Error funding wallet: {e}")
        return False


async def fund_all_test_wallets():
    """Fund all test wallets with TestNet ALGOs"""
    print("FairLens Test Wallet Funding Script")
    print("=" * 50)
    
    # You need to provide a funded account mnemonic here
    # This should be an account with sufficient TestNet ALGOs
    funded_account_mnemonic = settings.PRIVATE_KEY_MNEMONIC
    
    if not funded_account_mnemonic:
        print("Error: No funded account mnemonic provided in settings")
        print("Please set PRIVATE_KEY_MNEMONIC in your .env file")
        return
    
    # Fund each test wallet with 10 ALGOs
    test_wallets = [
        ("Maharashtra Government", "OV6WWA6GLWLOYVVUZ3JM4GCBDWN3JDPJ4O3MQWJHGWN4AQPIFUWQXGLZAI"),
        ("Contractor 1", "Z5XKIA4ZTPPE3GVNT353MPOBY7QDR2KVTAZBN4LTVX3QVQNCM5VS47M4HU"),
        ("Contractor 2", "6KAW3NT6B3RATHAQHFC7OOHUB3CAMZ3DACL4AULAEW65ZJY2MRPQZB2NO4")
    ]
    
    for wallet_name, wallet_address in test_wallets:
        print(f"\nFunding {wallet_name} wallet...")
        success = await fund_wallet(funded_account_mnemonic, wallet_address, 10.0)
        if success:
            print(f"✓ Successfully funded {wallet_name}")
        else:
            print(f"✗ Failed to fund {wallet_name}")


if __name__ == "__main__":
    asyncio.run(fund_all_test_wallets())