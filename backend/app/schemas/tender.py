from pydantic import BaseModel, ConfigDict
from datetime import datetime
from decimal import Decimal
from app.models.tender import TenderStatus


class TenderCreate(BaseModel):
    title: str
    description: str
    location: str
    category: str
    budget: Decimal
    deadline: datetime
    start_date: datetime | None = None
    duration_months: int | None = None
    technical_specs: str | None = None
    quality_standards: str | None = None


class TenderUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: TenderStatus | None = None
    budget: Decimal | None = None
    deadline: datetime | None = None


class TenderResponse(BaseModel):
    id: int
    title: str
    description: str
    location: str
    category: str
    budget: Decimal
    deadline: datetime
    start_date: datetime | None
    duration_months: int | None
    status: TenderStatus
    gov_id: int
    blockchain_hash: str | None
    created_at: datetime
    applications_count: int = 0

    model_config = ConfigDict(from_attributes=True)

