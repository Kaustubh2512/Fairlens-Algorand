from pydantic import BaseModel, ConfigDict
from datetime import datetime
from decimal import Decimal
from app.models.milestone import MilestoneStatus


class MilestoneCreate(BaseModel):
    contract_id: int
    index: int
    title: str
    description: str | None = None
    amount: Decimal
    deadline: datetime


class MilestoneUpdate(BaseModel):
    status: MilestoneStatus | None = None
    proof_hash: str | None = None


class MilestoneResponse(BaseModel):
    id: int
    contract_id: int
    index: int
    title: str
    description: str | None
    amount: Decimal
    deadline: datetime
    status: MilestoneStatus
    proof_hash: str | None
    completed_at: datetime | None
    verified_at: datetime | None
    paid_at: datetime | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

