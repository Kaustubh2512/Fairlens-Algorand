"""
Wallet utilities for Algorand address validation and management
"""

import algosdk
from algosdk import encoding
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def validate_algorand_address(address: str) -> bool:
    """
    Validate an Algorand address using checksum verification
    
    Args:
        address: Algorand address string
    
    Returns:
        True if address is valid, False otherwise
    """
    try:
        # Use algosdk's encoding module to validate address
        encoding.decode_address(address)
        return True
    except Exception as e:
        logger.error(f"Invalid Algorand address: {e}")
        return False


def is_valid_address(address: str) -> bool:
    """Alias for validate_algorand_address"""
    return validate_algorand_address(address)


def generate_mnemonic() -> str:
    """
    Generate a new 25-word mnemonic for Algorand wallet
    
    Returns:
        25-word mnemonic string
    """
    return algosdk.mnemonic.from_private_key(algosdk.account.generate_account()[0])


def get_address_from_mnemonic(mnemonic_phrase: str) -> Optional[str]:
    """
    Get Algorand address from mnemonic phrase
    
    Args:
        mnemonic_phrase: 25-word mnemonic phrase
    
    Returns:
        Algorand address or None if invalid
    """
    try:
        private_key = algosdk.mnemonic.to_private_key(mnemonic_phrase)
        address = algosdk.account.address_from_private_key(private_key)
        return address
    except Exception as e:
        logger.error(f"Failed to derive address from mnemonic: {e}")
        return None


def format_address(address: str) -> str:
    """
    Format Algorand address for display (first 6 and last 4 characters)
    
    Args:
        address: Algorand address
    
    Returns:
        Formatted address string
    """
    if len(address) < 10:
        return address
    return f"{address[:6]}...{address[-4]}"

