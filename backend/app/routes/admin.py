from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.database import get_db
from app.models.user import User, UserRole
from app.models.tender import Tender, TenderStatus
from app.models.contract import Contract, ContractStatus
from app.models.milestone import Milestone, MilestoneStatus
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.schemas.admin import AdminStatsResponse
from app.utils.auth import get_current_active_user

router = APIRouter()


@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get aggregated statistics for admin dashboard"""
    # Only government users can access admin stats
    if current_user.role != UserRole.GOVERNMENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only government users can access admin stats"
        )
    
    # Total tenders
    total_tenders_result = await db.execute(select(func.count(Tender.id)))
    total_tenders = total_tenders_result.scalar() or 0
    
    # Active tenders
    active_tenders_result = await db.execute(
        select(func.count(Tender.id)).where(Tender.status == TenderStatus.ACTIVE)
    )
    active_tenders = active_tenders_result.scalar() or 0
    
    # Active contracts
    active_contracts_result = await db.execute(
        select(func.count(Contract.id)).where(Contract.status == ContractStatus.ACTIVE)
    )
    active_contracts = active_contracts_result.scalar() or 0
    
    # Payments completed
    payments_completed_result = await db.execute(
        select(func.count(Transaction.id)).where(
            and_(
                Transaction.type == TransactionType.PAYMENT,
                Transaction.status == TransactionStatus.CONFIRMED
            )
        )
    )
    payments_completed = payments_completed_result.scalar() or 0
    
    # NFTs minted
    nfts_minted_result = await db.execute(
        select(func.count(Transaction.id)).where(
            and_(
                Transaction.type == TransactionType.NFT_MINT,
                Transaction.status == TransactionStatus.CONFIRMED
            )
        )
    )
    nfts_minted = nfts_minted_result.scalar() or 0
    
    # NFTs burned
    nfts_burned_result = await db.execute(
        select(func.count(Transaction.id)).where(
            and_(
                Transaction.type == TransactionType.NFT_BURN,
                Transaction.status == TransactionStatus.CONFIRMED
            )
        )
    )
    nfts_burned = nfts_burned_result.scalar() or 0
    
    # Total budget (sum of all tender budgets)
    total_budget_result = await db.execute(select(func.sum(Tender.budget)))
    total_budget = float(total_budget_result.scalar() or 0)
    
    # Total spent (sum of paid milestones)
    total_spent_result = await db.execute(
        select(func.sum(Milestone.amount)).where(Milestone.status == MilestoneStatus.PAID)
    )
    total_spent = float(total_spent_result.scalar() or 0)
    
    return AdminStatsResponse(
        total_tenders=total_tenders,
        active_tenders=active_tenders,
        active_contracts=active_contracts,
        payments_completed=payments_completed,
        nfts_minted=nfts_minted,
        nfts_burned=nfts_burned,
        total_budget=total_budget,
        total_spent=total_spent
    )


