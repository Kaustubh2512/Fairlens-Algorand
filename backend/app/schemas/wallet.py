from pydantic import BaseModel
from typing import List, Optional


class AssetBalance(BaseModel):
    asset_id: int
    amount: int
    name: str | None = None


class WalletBalanceResponse(BaseModel):
    address: str
    algo_balance: float
    assets: List[AssetBalance] = []
    explorer_url: Optional[str] = None
    lora_url: Optional[str] = None

