"""
IPFS integration for NFT metadata storage
Supports Infura IPFS and Pinata
"""

import json
import requests
import logging
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)


class IPFSService:
    """IPFS service for storing metadata"""
    
    def __init__(self):
        self.ipfs_api_url = getattr(settings, 'IPFS_API_URL', 'https://ipfs.infura.io:5001')
        self.ipfs_project_id = getattr(settings, 'IPFS_PROJECT_ID', '')
        self.ipfs_project_secret = getattr(settings, 'IPFS_PROJECT_SECRET', '')
        self.ipfs_gateway = getattr(settings, 'IPFS_GATEWAY', 'https://ipfs.io/ipfs/')
    
    def upload_json(self, data: Dict[str, Any]) -> Optional[str]:
        """
        Upload JSON data to IPFS and return CID
        
        Args:
            data: Dictionary to upload as JSON
        
        Returns:
            IPFS CID (Content Identifier) or None
        """
        try:
            # Convert to JSON string
            json_data = json.dumps(data, sort_keys=True)
            
            # Prepare request
            files = {
                'file': ('metadata.json', json_data, 'application/json')
            }
            
            headers = {}
            if self.ipfs_project_id and self.ipfs_project_secret:
                # Infura IPFS authentication
                import base64
                auth = base64.b64encode(
                    f"{self.ipfs_project_id}:{self.ipfs_project_secret}".encode()
                ).decode()
                headers['Authorization'] = f'Basic {auth}'
            
            # Upload to IPFS
            response = requests.post(
                f"{self.ipfs_api_url}/api/v0/add",
                files=files,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                cid = result.get('Hash')
                logger.info(f"Uploaded to IPFS with CID: {cid}")
                return cid
            else:
                logger.error(f"IPFS upload failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error uploading to IPFS: {e}")
            return None
    
    def get_ipfs_url(self, cid: str) -> str:
        """
        Get IPFS URL for a CID
        
        Args:
            cid: IPFS Content Identifier
        
        Returns:
            IPFS URL
        """
        return f"{self.ipfs_gateway}{cid}"
    
    def get_arc3_url(self, cid: str) -> str:
        """
        Get ARC-3 compliant URL (with #arc3 suffix)
        
        Args:
            cid: IPFS Content Identifier
        
        Returns:
            ARC-3 compliant URL
        """
        return f"{self.get_ipfs_url(cid)}#arc3"
    
    def create_nft_metadata(
        self,
        name: str,
        description: str,
        image_url: Optional[str] = None,
        properties: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Create ARC-3 compliant NFT metadata
        
        Args:
            name: NFT name
            description: NFT description
            image_url: Image URL (optional)
            properties: Additional properties
            **kwargs: Additional metadata fields
        
        Returns:
            ARC-3 compliant metadata dictionary
        """
        metadata = {
            "name": name,
            "description": description,
            "standard": "ARC3",
            **kwargs
        }
        
        if image_url:
            metadata["image"] = image_url
        
        if properties:
            metadata["properties"] = properties
        
        return metadata


# Global instance
ipfs_service = IPFSService()


