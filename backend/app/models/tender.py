from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class TenderStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    REVIEW = "review"
    CLOSED = "closed"
    COMPLETED = "completed"


class Tender(Base):
    __tablename__ = "tenders"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=False)
    category = Column(String, nullable=False)
    budget = Column(Numeric(15, 2), nullable=False)  # In rupees
    deadline = Column(DateTime(timezone=True), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=True)
    duration_months = Column(Integer, nullable=True)
    technical_specs = Column(Text, nullable=True)
    quality_standards = Column(String, nullable=True)
    status = Column(Enum(TenderStatus), default=TenderStatus.DRAFT)
    gov_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    blockchain_hash = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    government_user = relationship("User", back_populates="tenders", foreign_keys=[gov_id])
    applications = relationship("Application", back_populates="tender", cascade="all, delete-orphan")
    contracts = relationship("Contract", back_populates="tender", cascade="all, delete-orphan")


