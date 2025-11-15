from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import User
from app.schemas.wallet import WalletBalanceResponse, AssetBalance
from app.utils.auth import get_current_active_user
from app.services.blockchain import blockchain_service
from pydantic import BaseModel
from typing import List

class SignedTransactionRequest(BaseModel):
    transaction: str  # Base64 encoded signed transaction
    note: str = None

router = APIRouter()


@router.get("/balance", response_model=WalletBalanceResponse)
async def get_wallet_balance(
    current_user: User = Depends(get_current_active_user)
):
    """Get wallet balance (Algo + NFTs)"""
    if not current_user.wallet_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wallet not connected"
        )
    
    try:
        balance = await blockchain_service.get_account_balance(current_user.wallet_address)
        
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
            assets=assets
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get balance: {str(e)}"
        )


@router.post("/send-transaction")
async def send_signed_transaction(
    request: SignedTransactionRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Send a signed transaction to the blockchain"""
    if not current_user.wallet_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wallet not connected"
        )
    
    try:
        # In a real implementation, you would:
        # 1. Verify the transaction is properly signed
        # 2. Ensure the transaction is from the user's wallet
        # 3. Send the transaction to the blockchain
        # 4. Return the transaction ID
        
        # For now, we'll return a mock response
        # TODO: Implement real transaction sending
        return {
            "transaction_id": "MOCK_TX_ID",
            "status": "pending",
            "message": "Transaction sent successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send transaction: {str(e)}"
        )