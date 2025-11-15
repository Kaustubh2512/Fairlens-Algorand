from pydantic import BaseModel, ConfigDict
from datetime import datetime
from decimal import Decimal
from app.models.application import ApplicationStatus


class ApplicationCreate(BaseModel):
    tender_id: int
    bid_amount: Decimal
    technical_proposal: str | None = None
    timeline_months: int | None = None
    proposal_link: str | None = None


class ApplicationResponse(BaseModel):
    id: int
    tender_id: int
    contractor_id: int
    bid_amount: Decimal
    proposal_link: str | None
    technical_proposal: str | None
    timeline_months: int | None
    status: ApplicationStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

