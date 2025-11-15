from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List
from app.database import get_db
from app.models.user import User, UserRole
from app.models.contract import Contract
from app.models.milestone import Milestone, MilestoneStatus
from app.schemas.milestone import MilestoneCreate, MilestoneResponse, MilestoneUpdate
from pydantic import BaseModel
from app.utils.auth import get_current_active_user
import hashlib

router = APIRouter()


class VerifyMilestoneRequest(BaseModel):
    proof_hash: str


@router.post("/create", response_model=MilestoneResponse, status_code=status.HTTP_201_CREATED)
async def create_milestone(
    milestone_data: MilestoneCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a milestone for a contract (Government only)"""
    if current_user.role != UserRole.GOVERNMENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only government users can create milestones"
        )
    
    # Verify contract belongs to user
    contract_result = await db.execute(
        select(Contract).where(
            and_(Contract.id == milestone_data.contract_id, Contract.gov_id == current_user.id)
        )
    )
    contract = contract_result.scalar_one_or_none()
    
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found"
        )
    
    # Create milestone
    milestone_dict = milestone_data.model_dump()
    new_milestone = Milestone(**milestone_dict)
    db.add(new_milestone)
    await db.commit()
    await db.refresh(new_milestone)
    
    return new_milestone


@router.get("/contract/{contract_id}", response_model=List[MilestoneResponse])
async def get_contract_milestones(
    contract_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all milestones for a contract"""
    # Verify contract access
    contract_result = await db.execute(select(Contract).where(Contract.id == contract_id))
    contract = contract_result.scalar_one_or_none()
    
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found"
        )
    
    if current_user.role == UserRole.GOVERNMENT and contract.gov_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    if current_user.role == UserRole.CONTRACTOR and contract.contractor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    # Get milestones
    result = await db.execute(
        select(Milestone).where(Milestone.contract_id == contract_id).order_by(Milestone.index)
    )
    milestones = result.scalars().all()
    return milestones


@router.post("/{milestone_id}/verify", response_model=MilestoneResponse)
async def verify_milestone(
    milestone_id: int,
    proof_data: VerifyMilestoneRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Verify a milestone completion (Government only)"""
    proof_hash = proof_data.proof_hash
    if current_user.role != UserRole.GOVERNMENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only government users can verify milestones"
        )
    
    # Get milestone
    result = await db.execute(select(Milestone).where(Milestone.id == milestone_id))
    milestone = result.scalar_one_or_none()
    
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )
    
    # Verify contract belongs to user
    contract_result = await db.execute(
        select(Contract).where(Contract.id == milestone.contract_id)
    )
    contract = contract_result.scalar_one_or_none()
    
    if contract.gov_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to verify this milestone"
        )
    
    # Update milestone
    milestone.status = MilestoneStatus.VERIFIED
    milestone.proof_hash = proof_hash
    from datetime import datetime
    milestone.verified_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(milestone)
    
    return milestone


@router.post("/{milestone_id}/release", response_model=MilestoneResponse)
async def release_payment(
    milestone_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Release payment for a verified milestone (Government only)"""
    if current_user.role != UserRole.GOVERNMENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only government users can release payments"
        )
    
    # Get milestone
    result = await db.execute(select(Milestone).where(Milestone.id == milestone_id))
    milestone = result.scalar_one_or_none()
    
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )
    
    if milestone.status != MilestoneStatus.VERIFIED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Milestone must be verified before payment release"
        )
    
    # Get contract
    contract_result = await db.execute(
        select(Contract).where(Contract.id == milestone.contract_id)
    )
    contract = contract_result.scalar_one_or_none()
    
    if contract.gov_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    # Update milestone status
    milestone.status = MilestoneStatus.PAID
    from datetime import datetime
    milestone.paid_at = datetime.utcnow()
    
    # Note: In production, this would trigger the smart contract to release payment
    # For now, we just update the status
    
    await db.commit()
    await db.refresh(milestone)
    
    return milestone

