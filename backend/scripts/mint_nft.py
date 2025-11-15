#!/usr/bin/env python3
"""
Script to mint NFT manually
"""

import asyncio
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.blockchain import blockchain_service
from app.config import settings
import algosdk
from algosdk import mnemonic
import json


async def mint_nft():
    """Mint a sample NFT"""
    
    if not settings.PRIVATE_KEY_MNEMONIC:
        print("Error: PRIVATE_KEY_MNEMONIC not set in environment variables")
        return
    
    try:
        # Get account from mnemonic
        private_key = mnemonic.to_private_key(settings.PRIVATE_KEY_MNEMONIC)
        account_address = algosdk.account.address_from_private_key(private_key)
        
        print(f"Minting NFT from account: {account_address}")
        
        # Create metadata
        metadata = {
            "name": "FairLens Contract NFT",
            "description": "NFT for FairLens tender management",
            "contract_id": 1,
        }
        
        metadata_json = json.dumps(metadata, sort_keys=True)
        import hashlib
        metadata_hash = hashlib.sha256(metadata_json.encode()).hexdigest()
        metadata_url = f"https://fairlens.io/metadata/{metadata_hash}"
        
        # Mint NFT
        result = await blockchain_service.mint_nft(
            sender_address=account_address,
            asset_name="FairLens-NFT",
            unit_name="FLNFT",
            metadata_url=metadata_url,
            metadata_hash=bytes.fromhex(metadata_hash[:64])
        )
        
        print("NFT minting transaction created")
        print("Note: This creates an unsigned transaction.")
        print("In production, the transaction should be signed by the user's wallet.")
        print("\nTo complete the minting:")
        print("1. Sign the transaction with the user's private key")
        print("2. Submit the signed transaction to the network")
        print("3. Wait for confirmation")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(mint_nft())


