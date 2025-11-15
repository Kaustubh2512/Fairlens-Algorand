"""
NFT Service for ARC-3 compliant NFT minting and burning
Reference: https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0003.md
"""

import algosdk
from algosdk import transaction, account, mnemonic
from algosdk.v2client import algod
from typing import Optional, Dict, Any
import json
import hashlib
import logging
from app.config import settings
from app.services.blockchain import blockchain_service
from app.utils.ipfs import ipfs_service
from app.utils.lora import get_asset_explorer_url, get_tx_explorer_url

logger = logging.getLogger(__name__)


class NFTService:
    """Service for NFT operations with ARC-3 compliance"""
    
    def __init__(self):
        self.algod_client = blockchain_service.algod_client
    
    async def create_arc3_metadata(
        self,
        name: str,
        description: str,
        contract_id: int,
        milestone_index: Optional[int] = None,
        image_url: Optional[str] = None,
        properties: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create ARC-3 compliant metadata for NFT
        
        Args:
            name: NFT name
            description: NFT description
            contract_id: Contract ID
            milestone_index: Milestone index (optional)
            image_url: Image URL (optional)
            properties: Additional properties
        
        Returns:
            Metadata dictionary and IPFS URL
        """
        # Create ARC-3 metadata
        metadata = ipfs_service.create_nft_metadata(
            name=name,
            description=description,
            image_url=image_url,
            properties={
                "contract_id": contract_id,
                "milestone_index": milestone_index,
                **(properties or {})
            }
        )
        
        # Upload to IPFS
        cid = ipfs_service.upload_json(metadata)
        
        if not cid:
            # Fallback: use placeholder URL
            logger.warning("IPFS upload failed, using placeholder URL")
            ipfs_url = f"https://fairlens.io/metadata/{contract_id}"
        else:
            # Get ARC-3 compliant URL
            ipfs_url = ipfs_service.get_arc3_url(cid)
        
        # Calculate metadata hash (sha256 of metadata JSON)
        metadata_json = json.dumps(metadata, sort_keys=True)
        metadata_hash = hashlib.sha256(metadata_json.encode()).digest()
        
        return {
            "metadata": metadata,
            "ipfs_url": ipfs_url,
            "ipfs_cid": cid,
            "metadata_hash": metadata_hash.hex(),
            "metadata_hash_bytes": metadata_hash
        }
    
    async def mint_nft(
        self,
        sender_address: str,
        name: str,
        unit_name: str,
        metadata: Dict[str, Any],
        metadata_url: str,
        metadata_hash: bytes
    ) -> Dict[str, Any]:
        """
        Mint an ARC-3 compliant NFT
        
        Args:
            sender_address: Address of the sender (will own the NFT)
            name: Asset name
            unit_name: Unit name (e.g., "FLNFT")
            metadata: Metadata dictionary
            metadata_url: IPFS URL with #arc3 suffix
            metadata_hash: SHA-256 hash of metadata
        
        Returns:
            Transaction details and asset ID
        """
        try:
            params = self.algod_client.suggested_params()
            
            # Create ASA transaction (ARC-3 NFT)
            txn = transaction.AssetCreateTxn(
                sender=sender_address,
                sp=params,
                total=1,  # NFT: only 1 unit
                decimals=0,  # NFT: non-divisible
                default_frozen=False,
                unit_name=unit_name[:8],  # Max 8 characters
                asset_name=name,
                url=metadata_url,
                metadata_hash=metadata_hash[:32],  # First 32 bytes
                manager=sender_address,
                reserve=sender_address,
                freeze=sender_address,
                clawback=sender_address
            )
            
            # Return unsigned transaction (to be signed by frontend wallet)
            return {
                "unsigned_txn": txn,
                "txn_dict": txn.dictify(),
                "note": "Transaction must be signed by sender's wallet"
            }
            
        except Exception as e:
            logger.error(f"Error creating NFT transaction: {e}")
            raise
    
    async def get_nft_info(self, asset_id: int) -> Dict[str, Any]:
        """
        Get NFT information from blockchain
        
        Args:
            asset_id: Asset ID
        
        Returns:
            NFT information including Lora explorer URL
        """
        try:
            asset_info = await blockchain_service.get_asset_info(asset_id)
            
            # Get Lora explorer URL
            explorer_url = get_asset_explorer_url(asset_id)
            
            return {
                **asset_info,
                "explorer_url": explorer_url,
                "lora_url": explorer_url
            }
        except Exception as e:
            logger.error(f"Error getting NFT info: {e}")
            raise
    
    async def burn_nft(
        self,
        asset_id: int,
        sender_address: str,
        receiver_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Burn an NFT by transferring it to a burn address or back to creator
        
        Args:
            asset_id: Asset ID to burn
            receiver_address: Address to send NFT (default: sender, effectively burning)
        
        Returns:
            Transaction details
        """
        try:
            params = self.algod_client.suggested_params()
            
            # Get asset info to find creator
            asset_info = self.algod_client.asset_info(asset_id)
            creator = asset_info.get("params", {}).get("creator", sender_address)
            
            # Transfer NFT back to creator (effectively burning if creator doesn't use it)
            receiver = receiver_address or creator
            
            txn = transaction.AssetTransferTxn(
                sender=sender_address,
                sp=params,
                receiver=receiver,
                amt=1,
                index=asset_id
            )
            
            return {
                "unsigned_txn": txn,
                "txn_dict": txn.dictify(),
                "note": "Transaction must be signed by sender's wallet"
            }
            
        except Exception as e:
            logger.error(f"Error creating burn transaction: {e}")
            raise


# Global instance
nft_service = NFTService()


