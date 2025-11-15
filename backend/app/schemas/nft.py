from pydantic import BaseModel
from typing import Optional, Dict, Any


class NFTMintRequest(BaseModel):
    contract_id: int
    milestone_id: int | None = None
    metadata: dict | None = None


class NFTBurnRequest(BaseModel):
    nft_id: int
    contract_id: int


class NFTResponse(BaseModel):
    nft_id: int
    contract_id: int
    asset_name: str
    metadata_url: str | None
    tx_id: str
    status: str
    explorer_url: Optional[str] = None
    lora_url: Optional[str] = None
    ipfs_cid: Optional[str] = None
    creator: Optional[str] = None
    total: Optional[int] = None

