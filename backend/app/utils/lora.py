"""
Lora Explorer URL utilities
Lora Explorer: https://lora.algokit.io/
"""

from typing import Optional
from app.config import settings


def get_lora_explorer_url(
    network: str = "testnet",
    resource_type: str = "application",
    resource_id: Optional[int] = None,
    tx_id: Optional[str] = None
) -> Optional[str]:
    """
    Generate Lora Explorer URL for Algorand resources
    
    Args:
        network: Network type (testnet, mainnet, localnet)
        resource_type: Type of resource (application, transaction, asset, account)
        resource_id: Resource ID (app_id, asset_id, etc.)
        tx_id: Transaction ID
    
    Returns:
        Lora Explorer URL or None
    """
    base_url = "https://lora.algokit.io"
    
    # Determine network from settings
    if "testnet" in settings.ALGOD_API_URL.lower():
        network = "testnet"
    elif "mainnet" in settings.ALGOD_API_URL.lower():
        network = "mainnet"
    else:
        network = "localnet"
    
    if resource_type == "application" and resource_id is not None:
        return f"{base_url}/{network}/application/{resource_id}"
    elif resource_type == "transaction" and tx_id:
        return f"{base_url}/{network}/transaction/{tx_id}"
    elif resource_type == "asset" and resource_id is not None:
        return f"{base_url}/{network}/asset/{resource_id}"
    elif resource_type == "account" and resource_id:  # account address
        return f"{base_url}/{network}/account/{resource_id}"
    
    return None


def get_app_explorer_url(app_id: int) -> Optional[str]:
    """Get Lora Explorer URL for application"""
    return get_lora_explorer_url(resource_type="application", resource_id=app_id)


def get_tx_explorer_url(tx_id: str) -> Optional[str]:
    """Get Lora Explorer URL for transaction"""
    return get_lora_explorer_url(resource_type="transaction", tx_id=tx_id)


def get_asset_explorer_url(asset_id: int) -> Optional[str]:
    """Get Lora Explorer URL for asset"""
    return get_lora_explorer_url(resource_type="asset", resource_id=asset_id)


def get_account_explorer_url(address: str) -> Optional[str]:
    """Get Lora Explorer URL for account"""
    return get_lora_explorer_url(resource_type="account", resource_id=address)


