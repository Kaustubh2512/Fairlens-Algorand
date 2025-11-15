#!/usr/bin/env python3
"""
Test script to verify wallet addresses and demonstrate wallet functionality
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings
import algosdk
from algosdk import mnemonic


def get_address_from_mnemonic(mnemonic_phrase: str) -> str:
    """Get Algorand address from mnemonic phrase"""
    try:
        private_key = mnemonic.to_private_key(mnemonic_phrase)
        address = algosdk.account.address_from_private_key(private_key)
        return address
    except Exception as e:
        print(f"Error deriving address: {e}")
        return ""


def test_wallets():
    """Test all provided wallets"""
    print("FairLens Wallet Test Script")
    print("=" * 50)
    
    # Test Maharashtra Government Wallet
    if hasattr(settings, 'MAHARASHTRA_GOV_MNEMONIC') and settings.MAHARASHTRA_GOV_MNEMONIC:
        print("\n1. Maharashtra Government Wallet:")
        gov_address = get_address_from_mnemonic(settings.MAHARASHTRA_GOV_MNEMONIC)
        print(f"   Address: {gov_address}")
        print(f"   Expected: OV6WWA6GLWLOYVVUZ3JM4GCBDWN3JDPJ4O3MQWJHGWN4AQPIFUWQXGLZAI")
        print(f"   Match: {gov_address == 'OV6WWA6GLWLOYVVUZ3JM4GCBDWN3JDPJ4O3MQWJHGWN4AQPIFUWQXGLZAI'}")
    
    # Test Contractor 1 Wallet
    if hasattr(settings, 'CONTRACTOR_1_MNEMONIC') and settings.CONTRACTOR_1_MNEMONIC:
        print("\n2. Contractor 1 Wallet:")
        contractor1_address = get_address_from_mnemonic(settings.CONTRACTOR_1_MNEMONIC)
        print(f"   Address: {contractor1_address}")
        print(f"   Expected: Z5XKIA4ZTPPE3GVNT353MPOBY7QDR2KVTAZBN4LTVX3QVQNCM5VS47M4HU")
        print(f"   Match: {contractor1_address == 'Z5XKIA4ZTPPE3GVNT353MPOBY7QDR2KVTAZBN4LTVX3QVQNCM5VS47M4HU'}")
    
    # Test Contractor 2 Wallet
    if hasattr(settings, 'CONTRACTOR_2_MNEMONIC') and settings.CONTRACTOR_2_MNEMONIC:
        print("\n3. Contractor 2 Wallet:")
        contractor2_address = get_address_from_mnemonic(settings.CONTRACTOR_2_MNEMONIC)
        print(f"   Address: {contractor2_address}")
        print(f"   Expected: 6KAW3NT6B3RATHAQHFC7OOHUB3CAMZ3DACL4AULAEW65ZJY2MRPQZB2NO4")
        print(f"   Match: {contractor2_address == '6KAW3NT6B3RATHAQHFC7OOHUB3CAMZ3DACL4AULAEW65ZJY2MRPQZB2NO4'}")
    
    print("\n" + "=" * 50)
    print("Wallet testing complete!")


if __name__ == "__main__":
    test_wallets()