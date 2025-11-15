from sqlalchemy import Column, Integer, String, Enum, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    GOVERNMENT = "government"
    CONTRACTOR = "contractor"
    CITIZEN = "citizen"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    wallet_address = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    tenders = relationship("Tender", back_populates="government_user", foreign_keys="Tender.gov_id")
    applications = relationship("Application", back_populates="contractor_user")
    contracts_as_gov = relationship("Contract", back_populates="government_user", foreign_keys="Contract.gov_id")
    contracts_as_contractor = relationship("Contract", back_populates="contractor_user", foreign_keys="Contract.contractor_id")


