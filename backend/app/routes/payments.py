from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List
from app.database import get_db
from app.models.user import User, UserRole
from app.models.contract import Contract
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.schemas.payment import PaymentResponse
from app.utils.auth import get_current_active_user
from app.utils.lora import get_tx_explorer_url
from app.services.blockchain import blockchain_service
from sqlalchemy import select, and_

router = APIRouter()


@router.get("/", response_model=List[PaymentResponse])
async def list_payments(
    contract_id: int | None = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """List payments for the current user"""
    query = select(Transaction).where(Transaction.type == TransactionType.PAYMENT)
    
    if contract_id:
        query = query.where(Transaction.contract_id == contract_id)
        # Verify contract access
        contract_result = await db.execute(select(Contract).where(Contract.id == contract_id))
        contract = contract_result.scalar_one_or_none()
        if contract:
            if current_user.role == UserRole.GOVERNMENT and contract.gov_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
            if current_user.role == UserRole.CONTRACTOR and contract.contractor_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    else:
        # Filter by user's contracts
        if current_user.role == UserRole.GOVERNMENT:
            contracts_result = await db.execute(
                select(Contract.id).where(Contract.gov_id == current_user.id)
            )
            contract_ids = [c[0] for c in contracts_result.all()]
            if contract_ids:
                query = query.where(Transaction.contract_id.in_(contract_ids))
            else:
                return []
        elif current_user.role == UserRole.CONTRACTOR:
            contracts_result = await db.execute(
                select(Contract.id).where(Contract.contractor_id == current_user.id)
            )
            contract_ids = [c[0] for c in contracts_result.all()]
            if contract_ids:
                query = query.where(Transaction.contract_id.in_(contract_ids))
            else:
                return []
    
    result = await db.execute(query.order_by(Transaction.created_at.desc()))
    transactions = result.scalars().all()
    return transactions


@router.get("/{tx_id}", response_model=PaymentResponse)
async def get_payment(
    tx_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get payment details by transaction ID with Lora explorer URL"""
    result = await db.execute(select(Transaction).where(Transaction.tx_id == tx_id))
    db_transaction = result.scalar_one_or_none()
    
    if not db_transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Verify access
    if db_transaction.contract_id:
        contract_result = await db.execute(
            select(Contract).where(Contract.id == db_transaction.contract_id)
        )
        contract = contract_result.scalar_one_or_none()
        if contract:
            if current_user.role == UserRole.GOVERNMENT and contract.gov_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
            if current_user.role == UserRole.CONTRACTOR and contract.contractor_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    # Get blockchain transaction status and explorer URL
    try:
        tx_status = await blockchain_service.get_transaction_status(tx_id)
        explorer_url = tx_status.get("explorer_url") or get_tx_explorer_url(tx_id)
    except:
        explorer_url = get_tx_explorer_url(tx_id)
    
    # Convert to response with explorer URL
    payment_dict = {
        "id": db_transaction.id,
        "contract_id": db_transaction.contract_id,
        "tx_id": db_transaction.tx_id,
        "type": db_transaction.type,
        "status": db_transaction.status,
        "amount": db_transaction.amount,
        "note": db_transaction.note,
        "confirmed_round": db_transaction.confirmed_round,
        "created_at": db_transaction.created_at,
        "explorer_url": explorer_url,
        "lora_url": explorer_url
    }
    
    return payment_dict

