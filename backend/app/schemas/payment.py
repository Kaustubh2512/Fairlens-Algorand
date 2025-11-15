from pydantic import BaseModel, ConfigDict
from datetime import datetime
from decimal import Decimal
from typing import Optional
from app.models.transaction import TransactionStatus, TransactionType


class PaymentResponse(BaseModel):
    id: int
    contract_id: int | None
    tx_id: str
    type: TransactionType
    status: TransactionStatus
    amount: str | None
    note: str | None
    confirmed_round: int | None
    created_at: datetime
    explorer_url: Optional[str] = None
    lora_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

