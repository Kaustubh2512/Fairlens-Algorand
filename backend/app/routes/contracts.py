from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List
from app.database import get_db
from app.models.user import User, UserRole
from app.models.tender import Tender
from app.models.application import Application, ApplicationStatus
from app.models.contract import Contract, ContractStatus
from app.models.milestone import Milestone
from app.schemas.contract import ContractResponse, ContractCreate
from app.utils.auth import get_current_active_user
from app.services.blockchain import blockchain_service
from app.services.contract_service import create_fairlens_contract
from app.utils.lora import get_app_explorer_url
import algosdk
from algosdk import transaction
import base64

router = APIRouter()


@router.post("/deploy", response_model=ContractResponse, status_code=status.HTTP_201_CREATED)
async def deploy_contract(
    contract_data: ContractCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Deploy smart contract when tender is awarded (Government only)"""
    if current_user.role != UserRole.GOVERNMENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only government users can deploy contracts"
        )
    
    # Verify tender and application
    tender_result = await db.execute(
        select(Tender).where(and_(Tender.id == contract_data.tender_id, Tender.gov_id == current_user.id))
    )
    tender = tender_result.scalar_one_or_none()
    
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )
    
    app_result = await db.execute(
        select(Application).where(
            and_(
                Application.tender_id == contract_data.tender_id,
                Application.contractor_id == contract_data.contractor_id,
                Application.status == ApplicationStatus.ACCEPTED
            )
        )
    )
    application = app_result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Accepted application not found"
        )
    
    # Get contractor user
    contractor_result = await db.execute(select(User).where(User.id == contract_data.contractor_id))
    contractor = contractor_result.scalar_one_or_none()
    
    if not contractor or not contractor.wallet_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contractor wallet not connected"
        )
    
    if not current_user.wallet_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Government wallet not connected"
        )
    
    # Get contractor wallet address
    if not contractor.wallet_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contractor must have a connected wallet"
        )
    
    # Create contract instance
    from app.services.contract_service import ContractService
    
    # Convert total_amount to microAlgos (if it's in Algos)
    # Check if amount is likely in Algos (less than 1M) or microAlgos (>= 1M)
    total_amount_microalgos = int(contract_data.total_amount)
    if contract_data.total_amount < 1_000_000:  # Assume it's in Algos if less than 1M
        total_amount_microalgos = int(contract_data.total_amount * 1_000_000)
    
    fairlens_contract = create_fairlens_contract(
        owner_address=current_user.wallet_address,
        contractor_address=contractor.wallet_address,
        verifier_address=current_user.wallet_address,  # Government is verifier
        total_amount=total_amount_microalgos
    )
    
    # Compile contract
    contract_service = ContractService(fairlens_contract)
    compiled = contract_service.compile()
    
    # Deploy contract (returns unsigned transaction)
    # In production, this would be signed by the government's wallet
    deployment_result = await blockchain_service.deploy_smart_contract(
        approval_teal=compiled["approval_source"],
        clear_teal=compiled["clear_source"],
        sender_address=current_user.wallet_address
    )
    
    # Create contract record
    new_contract = Contract(
        tender_id=contract_data.tender_id,
        contractor_id=contract_data.contractor_id,
        gov_id=current_user.id,
        total_amount=contract_data.total_amount,
        status=ContractStatus.ACTIVE,
        app_address=deployment_result.get("app_address"),
        # app_id will be set after transaction confirmation
    )
    
    db.add(new_contract)
    await db.commit()
    await db.refresh(new_contract)
    
    # Add deployment information to response
    contract_dict = {
        "id": new_contract.id,
        "tender_id": new_contract.tender_id,
        "contractor_id": new_contract.contractor_id,
        "gov_id": new_contract.gov_id,
        "app_id": new_contract.app_id,
        "app_address": new_contract.app_address,
        "status": new_contract.status,
        "total_amount": new_contract.total_amount,
        "created_at": new_contract.created_at,
        "deployment_txn": deployment_result.get("txn_dict"),
        "note": "Contract deployment transaction created. Sign and submit to deploy.",
    }
    
    # Add Lora explorer URL if app_id is available
    if new_contract.app_id:
        contract_dict["explorer_url"] = get_app_explorer_url(new_contract.app_id)
        contract_dict["lora_url"] = get_app_explorer_url(new_contract.app_id)
    
    return contract_dict


@router.get("/", response_model=List[ContractResponse])
async def list_contracts(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """List contracts for the current user"""
    if current_user.role == UserRole.GOVERNMENT:
        result = await db.execute(
            select(Contract).where(Contract.gov_id == current_user.id)
        )
    elif current_user.role == UserRole.CONTRACTOR:
        result = await db.execute(
            select(Contract).where(Contract.contractor_id == current_user.id)
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Citizens cannot view contracts"
        )
    
    contracts = result.scalars().all()
    return contracts


@router.get("/{contract_id}", response_model=ContractResponse)
async def get_contract(
    contract_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get contract details"""
    result = await db.execute(select(Contract).where(Contract.id == contract_id))
    contract = result.scalar_one_or_none()
    
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found"
        )
    
    # Verify access
    if current_user.role == UserRole.GOVERNMENT and contract.gov_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    if current_user.role == UserRole.CONTRACTOR and contract.contractor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    return contract

