from pydantic import BaseModel, ConfigDict
from datetime import datetime
from decimal import Decimal
from app.models.contract import ContractStatus


class ContractCreate(BaseModel):
    tender_id: int
    contractor_id: int
    total_amount: Decimal


class ContractResponse(BaseModel):
    id: int
    tender_id: int
    contractor_id: int
    gov_id: int
    app_id: int | None
    app_address: str | None
    nft_id: int | None
    status: ContractStatus
    total_amount: Decimal
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

