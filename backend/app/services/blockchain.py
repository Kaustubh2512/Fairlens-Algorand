import algosdk
from algosdk import transaction, account, mnemonic
from algosdk.v2client import algod, indexer
from typing import Optional, Dict, Any
import json
import logging
import base64
from app.config import settings
from app.utils.lora import (
    get_app_explorer_url,
    get_tx_explorer_url,
    get_asset_explorer_url,
    get_account_explorer_url
)

logger = logging.getLogger(__name__)


class BlockchainService:
    def __init__(self):
        self.algod_client = algod.AlgodClient(
            settings.ALGOD_API_KEY,
            settings.ALGOD_API_URL
        )
        self.indexer_client = indexer.IndexerClient(
            settings.ALGOD_INDEXER_KEY,
            settings.ALGOD_INDEXER_URL
        ) if settings.ALGOD_INDEXER_KEY else None
        
        # Initialize account from mnemonic if provided
        self.account = None
        if settings.PRIVATE_KEY_MNEMONIC:
            try:
                self.account = account.address_from_private_key(
                    mnemonic.to_private_key(settings.PRIVATE_KEY_MNEMONIC)
                )
                logger.info(f"Initialized blockchain account: {self.account}")
            except Exception as e:
                logger.error(f"Failed to initialize account: {e}")

    async def get_account_balance(self, address: str) -> Dict[str, Any]:
        """Get account balance in Algos and assets"""
        try:
            account_info_raw = self.algod_client.account_info(address)
            # Convert bytes to dict if needed
            if isinstance(account_info_raw, bytes):
                account_info = json.loads(account_info_raw.decode('utf-8'))
            else:
                account_info = account_info_raw
                
            algo_balance = account_info.get("amount", 0) / 1_000_000  # Convert to Algos
            
            assets = []
            if "assets" in account_info:
                for asset in account_info["assets"]:
                    assets.append({
                        "asset_id": asset["asset-id"],
                        "amount": asset["amount"],
                    })
            
            return {
                "address": address,
                "algo_balance": algo_balance,
                "assets": assets
            }
        except Exception as e:
            logger.error(f"Error getting balance: {e}")
            raise

    async def get_transaction_status(self, tx_id: str) -> Dict[str, Any]:
        """Get transaction status from blockchain with Lora explorer URL"""
        try:
            tx_info = {}
            if self.indexer_client:
                tx_info_raw = self.indexer_client.transaction(tx_id)
                # Convert bytes to dict if needed
                if isinstance(tx_info_raw, bytes):
                    tx_info = json.loads(tx_info_raw.decode('utf-8'))
                else:
                    tx_info = tx_info_raw
            else:
                # Fallback to algod client
                pending = self.algod_client.pending_transaction_info(tx_id)
                if pending:
                    return {
                        "tx_id": tx_id,
                        "status": "pending",
                        "confirmed_round": None,
                        "explorer_url": get_tx_explorer_url(tx_id),
                        "lora_url": get_tx_explorer_url(tx_id)
                    }
                # Try to get from algod (may not work for old transactions)
                return {
                    "tx_id": tx_id,
                    "status": "unknown",
                    "explorer_url": get_tx_explorer_url(tx_id),
                    "lora_url": get_tx_explorer_url(tx_id)
                }
            
            explorer_url = get_tx_explorer_url(tx_id)
            
            return {
                "tx_id": tx_id,
                "status": "confirmed" if tx_info.get("confirmed-round") else "pending",
                "confirmed_round": tx_info.get("confirmed-round"),
                "sender": tx_info.get("sender"),
                "receiver": tx_info.get("payment-transaction", {}).get("receiver"),
                "amount": tx_info.get("payment-transaction", {}).get("amount", 0) / 1_000_000,
                "explorer_url": explorer_url,
                "lora_url": explorer_url
            }
        except Exception as e:
            logger.error(f"Error getting transaction status: {e}")
            return {
                "tx_id": tx_id,
                "status": "error",
                "error": str(e),
                "explorer_url": get_tx_explorer_url(tx_id),
                "lora_url": get_tx_explorer_url(tx_id)
            }

    async def mint_nft(
        self,
        sender_address: str,
        asset_name: str,
        unit_name: str,
        metadata_url: str,
        metadata_hash: Optional[bytes] = None
    ) -> Dict[str, Any]:
        """Mint an NFT (ARC-3 ASA) on Algorand"""
        try:
            params = self.algod_client.suggested_params()
            
            # Create ASA transaction
            txn = transaction.AssetCreateTxn(
                sender=sender_address,
                sp=params,
                total=1,  # NFT: only 1 unit
                decimals=0,  # NFT: non-divisible
                default_frozen=False,
                unit_name=unit_name,
                asset_name=asset_name,
                url=metadata_url,
                metadata_hash=metadata_hash,
                manager=sender_address,
                reserve=sender_address,
                freeze=sender_address,
                clawback=sender_address
            )
            
            # Note: In production, this transaction should be signed by the sender's wallet
            # For now, we return the unsigned transaction that needs to be signed by the frontend
            return {
                "unsigned_txn": txn,
                "txn_bytes": txn.dictify(),
            }
        except Exception as e:
            logger.error(f"Error minting NFT: {e}")
            raise

    async def compile_teal(self, teal_source: str) -> bytes:
        """
        Compile TEAL source code to bytecode
        
        Args:
            teal_source: TEAL source code as string
        
        Returns:
            Compiled bytecode
        """
        try:
            # Compile TEAL using algod client
            compile_response = self.algod_client.compile(teal_source)
            program_bytes = base64.b64decode(compile_response['result'])
            return program_bytes
        except Exception as e:
            logger.error(f"Error compiling TEAL: {e}")
            raise
    
    async def deploy_smart_contract(
        self,
        approval_teal: str,
        clear_teal: str,
        sender_address: str,
        global_schema: Optional[transaction.StateSchema] = None,
        local_schema: Optional[transaction.StateSchema] = None
    ) -> Dict[str, Any]:
        """
        Deploy a smart contract (stateful application) on Algorand
        
        Args:
            approval_teal: TEAL source code for approval program
            clear_teal: TEAL source code for clear program
            sender_address: Address of the sender
            global_schema: Global state schema
            local_schema: Local state schema
        
        Returns:
            Transaction details and app information
        """
        try:
            # Compile TEAL programs
            approval_program = await self.compile_teal(approval_teal)
            clear_program = await self.compile_teal(clear_teal)
            
            params = self.algod_client.suggested_params()
            
            # Define schema for global state (owner, contractor, verifier, etc.)
            # We need: 3 byte slices (addresses) + 3 uints (amounts, counts)
            schema = global_schema or transaction.StateSchema(
                num_uints=3,  # total_amount, milestone_count, current_milestone
                num_byte_slices=3  # owner, contractor, verifier
            )
            
            # Create application creation transaction
            txn = transaction.ApplicationCreateTxn(
                sender=sender_address,
                sp=params,
                on_complete=transaction.OnComplete.NoOpOC,
                approval_program=approval_program,
                clear_program=clear_program,
                global_schema=schema,
                local_schema=local_schema or transaction.StateSchema(num_uints=0, num_byte_slices=0)
            )
            
            # Calculate app address (before deployment)
            app_address = algosdk.logic.get_application_address(
                await self._get_next_app_id()  # This is approximate
            )
            
            # Note: In production, this should be signed by the sender's wallet
            # The actual app_id will be returned after the transaction is confirmed
            return {
                "unsigned_txn": txn,
                "txn_dict": txn.dictify(),
                "approval_program": base64.b64encode(approval_program).decode(),
                "clear_program": base64.b64encode(clear_program).decode(),
                "app_address": app_address,  # Approximate, will be confirmed after deployment
                "note": "Transaction must be signed by sender's wallet. App ID will be returned after confirmation."
            }
        except Exception as e:
            logger.error(f"Error deploying contract: {e}")
            raise
    
    async def _get_next_app_id(self) -> int:
        """Get next application ID (approximate)"""
        try:
            status_raw = self.algod_client.status()
            # Convert bytes to dict if needed
            if isinstance(status_raw, bytes):
                status = json.loads(status_raw.decode('utf-8'))
            else:
                status = status_raw
            # This is an approximation - actual ID comes from confirmed transaction
            return status.get("last-round", 0) * 1000  # Rough estimate
        except:
            return 0

    async def send_payment(
        self,
        sender_address: str,
        receiver_address: str,
        amount_microalgos: int,
        note: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a payment transaction"""
        try:
            params = self.algod_client.suggested_params()
            
            note_bytes = None
            if note:
                note_bytes = note.encode('utf-8')
            
            txn = transaction.PaymentTxn(
                sender=sender_address,
                sp=params,
                receiver=receiver_address,
                amt=amount_microalgos,
                note=note_bytes
            )
            
            return {
                "unsigned_txn": txn,
                "txn_bytes": txn.dictify(),
            }
        except Exception as e:
            logger.error(f"Error creating payment: {e}")
            raise

    async def get_asset_info(self, asset_id: int) -> Dict[str, Any]:
        """Get asset information with Lora explorer URL"""
        try:
            asset_info_raw = self.algod_client.asset_info(asset_id)
            # Convert bytes to dict if needed
            if isinstance(asset_info_raw, bytes):
                asset_info = json.loads(asset_info_raw.decode('utf-8'))
            else:
                asset_info = asset_info_raw
                
            explorer_url = get_asset_explorer_url(asset_id)
            
            return {
                "asset_id": asset_id,
                "name": asset_info.get("params", {}).get("name"),
                "unit_name": asset_info.get("params", {}).get("unit-name"),
                "total": asset_info.get("params", {}).get("total"),
                "decimals": asset_info.get("params", {}).get("decimals"),
                "url": asset_info.get("params", {}).get("url"),
                "creator": asset_info.get("params", {}).get("creator"),
                "manager": asset_info.get("params", {}).get("manager"),
                "explorer_url": explorer_url,
                "lora_url": explorer_url
            }
        except Exception as e:
            logger.error(f"Error getting asset info: {e}")
            raise
    
    async def get_application_info(self, app_id: int) -> Dict[str, Any]:
        """Get application information with Lora explorer URL"""
        try:
            app_info_raw = self.algod_client.application_info(app_id)
            # Convert bytes to dict if needed
            if isinstance(app_info_raw, bytes):
                app_info = json.loads(app_info_raw.decode('utf-8'))
            else:
                app_info = app_info_raw
                
            explorer_url = get_app_explorer_url(app_id)
            
            return {
                "app_id": app_id,
                "app_address": app_info.get("params", {}).get("creator"),
                "approval_program": app_info.get("params", {}).get("approval-program"),
                "clear_program": app_info.get("params", {}).get("clear-program"),
                "global_state": app_info.get("params", {}).get("global-state", []),
                "explorer_url": explorer_url,
                "lora_url": explorer_url
            }
        except Exception as e:
            logger.error(f"Error getting application info: {e}")
            raise
    
    async def get_blockchain_info(self) -> Dict[str, Any]:
        """Get blockchain node information"""
        try:
            status_raw = self.algod_client.status()
            # Convert bytes to dict if needed
            if isinstance(status_raw, bytes):
                status = json.loads(status_raw.decode('utf-8'))
            else:
                status = status_raw
                
            health = self.algod_client.health()
            
            return {
                "status": "healthy" if health else "unhealthy",
                "last_round": status.get("last-round"),
                "last_version": status.get("last-version"),
                "next_version": status.get("next-version"),
                "next_version_round": status.get("next-version-round"),
                "next_version_supported": status.get("next-version-supported"),
                "time_since_last_round": status.get("time-since-last-round"),
                "catchup_time": status.get("catchup-time"),
                "has_sync_wait": status.get("has-sync-wait")
            }
        except Exception as e:
            logger.error(f"Error getting blockchain info: {e}")
            raise


# Global instance
blockchain_service = BlockchainService()