from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Numeric, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class ContractStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    TERMINATED = "terminated"
    SUSPENDED = "suspended"


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False)
    contractor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    gov_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    app_id = Column(Integer, nullable=True)  # Algorand application ID
    app_address = Column(String, nullable=True)  # Algorand application address
    nft_id = Column(Integer, nullable=True)  # Algorand ASA ID for NFT
    status = Column(Enum(ContractStatus), default=ContractStatus.ACTIVE)
    total_amount = Column(Numeric(15, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    tender = relationship("Tender", back_populates="contracts")
    contractor_user = relationship("User", back_populates="contracts_as_contractor", foreign_keys=[contractor_id])
    government_user = relationship("User", back_populates="contracts_as_gov", foreign_keys=[gov_id])
    milestones = relationship("Milestone", back_populates="contract", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="contract", cascade="all, delete-orphan")


