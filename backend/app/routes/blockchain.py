from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import User
from app.schemas.wallet import WalletBalanceResponse, AssetBalance
from app.utils.auth import get_current_active_user
from app.services.blockchain import blockchain_service
from app.utils.lora import get_account_explorer_url

router = APIRouter()


@router.get("/balance", response_model=WalletBalanceResponse)
async def get_wallet_balance(
    current_user: User = Depends(get_current_active_user)
):
    """Get wallet balance (Algo + NFTs) with explorer URL"""
    if not current_user.wallet_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wallet not connected"
        )
    
    try:
        balance = await blockchain_service.get_account_balance(current_user.wallet_address)
        
        # Get explorer URL
        explorer_url = get_account_explorer_url(current_user.wallet_address)
        
        # Convert assets to AssetBalance objects
        assets = []
        for asset in balance.get("assets", []):
            # Get asset info for name
            try:
                asset_info = await blockchain_service.get_asset_info(asset["asset_id"])
                assets.append(AssetBalance(
                    asset_id=asset["asset_id"],
                    amount=asset["amount"],
                    name=asset_info.get("name")
                ))
            except:
                assets.append(AssetBalance(
                    asset_id=asset["asset_id"],
                    amount=asset["amount"]
                ))
        
        return WalletBalanceResponse(
            address=current_user.wallet_address,
            algo_balance=balance["algo_balance"],
            assets=assets,
            explorer_url=explorer_url
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get balance: {str(e)}"
        )


@router.get("/tx/status/{tx_id}")
async def get_transaction_status(tx_id: str):
    """Get transaction status with Lora explorer URL"""
    try:
        tx_status = await blockchain_service.get_transaction_status(tx_id)
        return tx_status
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get transaction status: {str(e)}"
        )


@router.get("/info")
async def get_blockchain_info():
    """Get blockchain node information"""
    try:
        info = await blockchain_service.get_blockchain_info()
        return info
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get blockchain info: {str(e)}"
        )


@router.get("/app/{app_id}")
async def get_application_info(app_id: int):
    """Get application information with Lora explorer URL"""
    try:
        app_info = await blockchain_service.get_application_info(app_id)
        return app_info
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get application info: {str(e)}"
        )


