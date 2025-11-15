from pydantic import BaseModel


class AdminStatsResponse(BaseModel):
    total_tenders: int
    active_tenders: int
    active_contracts: int
    payments_completed: int
    nfts_minted: int
    nfts_burned: int
    total_budget: float
    total_spent: float


