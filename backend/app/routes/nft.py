from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.database import get_db
from app.models.user import User, UserRole
from app.models.contract import Contract
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.schemas.nft import NFTMintRequest, NFTBurnRequest, NFTResponse
from app.utils.auth import get_current_active_user
from app.services.blockchain import blockchain_service
from app.services.nft_service import nft_service
from app.utils.lora import get_asset_explorer_url, get_tx_explorer_url
import json
import hashlib

router = APIRouter()


@router.post("/mint", response_model=NFTResponse)
async def mint_nft(
    nft_data: NFTMintRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Mint an NFT for a contract milestone"""
    # Verify contract access
    contract_result = await db.execute(select(Contract).where(Contract.id == nft_data.contract_id))
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
    
    if not current_user.wallet_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wallet not connected"
        )
    
    # Create ARC-3 compliant metadata
    try:
        metadata_result = await nft_service.create_arc3_metadata(
            name=f"FairLens Contract #{nft_data.contract_id}",
            description=f"NFT representing milestone payment for contract {nft_data.contract_id}",
            contract_id=nft_data.contract_id,
            milestone_index=nft_data.milestone_id,
            properties=nft_data.metadata
        )
        
        # Mint NFT (returns unsigned transaction)
        nft_result = await nft_service.mint_nft(
            sender_address=current_user.wallet_address,
            name=f"FairLens-{nft_data.contract_id}",
            unit_name="FLNFT",
            metadata=metadata_result["metadata"],
            metadata_url=metadata_result["ipfs_url"],
            metadata_hash=metadata_result["metadata_hash_bytes"]
        )
        
        # Store transaction in database (will be updated when confirmed)
        new_transaction = Transaction(
            contract_id=nft_data.contract_id,
            tx_id="pending",  # Will be updated after signing
            type=TransactionType.NFT_MINT,
            status=TransactionStatus.PENDING,
            note=json.dumps({
                "metadata": metadata_result["metadata"],
                "ipfs_cid": metadata_result["ipfs_cid"],
                "ipfs_url": metadata_result["ipfs_url"]
            })
        )
        db.add(new_transaction)
        await db.commit()
        
        return {
            "nft_id": 0,  # Will be set after confirmation
            "contract_id": nft_data.contract_id,
            "asset_name": f"FairLens-{nft_data.contract_id}",
            "metadata_url": metadata_result["ipfs_url"],
            "ipfs_cid": metadata_result["ipfs_cid"],
            "tx_id": "pending",
            "status": "pending",
            "unsigned_txn": nft_result.get("txn_dict"),
            "note": "Transaction must be signed by wallet. NFT ID will be returned after confirmation."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mint NFT: {str(e)}"
        )


@router.post("/burn", response_model=NFTResponse)
async def burn_nft(
    nft_data: NFTBurnRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Burn an NFT after milestone completion"""
    # Verify contract access
    contract_result = await db.execute(select(Contract).where(Contract.id == nft_data.contract_id))
    contract = contract_result.scalar_one_or_none()
    
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found"
        )
    
    if contract.nft_id != nft_data.nft_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="NFT ID does not match contract"
        )
    
    if current_user.role == UserRole.GOVERNMENT and contract.gov_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    if current_user.role == UserRole.CONTRACTOR and contract.contractor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    # Get asset info
    try:
        asset_info = await blockchain_service.get_asset_info(nft_data.nft_id)
        
        # Create burn transaction record
        new_transaction = Transaction(
            contract_id=nft_data.contract_id,
            tx_id="pending",
            type=TransactionType.NFT_BURN,
            status=TransactionStatus.PENDING,
            amount=str(nft_data.nft_id)
        )
        db.add(new_transaction)
        await db.commit()
        
        return NFTResponse(
            nft_id=nft_data.nft_id,
            contract_id=nft_data.contract_id,
            asset_name=asset_info.get("name", "Unknown"),
            metadata_url=None,
            tx_id="pending",
            status="pending"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to burn NFT: {str(e)}"
        )


@router.get("/status/{nft_id}", response_model=NFTResponse)
async def get_nft_status(
    nft_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get NFT status with Lora explorer URL"""
    try:
        asset_info = await nft_service.get_nft_info(nft_id)
        
        # Try to find contract from database
        contract_result = await db.execute(
            select(Contract).where(Contract.nft_id == nft_id)
        )
        contract = contract_result.scalar_one_or_none()
        
        return {
            "nft_id": nft_id,
            "contract_id": contract.id if contract else 0,
            "asset_name": asset_info.get("name", "Unknown"),
            "metadata_url": asset_info.get("url"),
            "tx_id": "",
            "status": "active",
            "explorer_url": asset_info.get("explorer_url"),
            "lora_url": asset_info.get("lora_url"),
            "creator": asset_info.get("creator"),
            "total": asset_info.get("total")
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"NFT not found: {str(e)}"
        )

