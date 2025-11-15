"""
Contract Service - Wrapper for FairLens Contract
This service provides a simplified interface to the PyTeal contract
"""

from app.contracts.fairlens_contract import FairLensContract
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


def create_fairlens_contract(
    owner_address: str,
    contractor_address: str,
    verifier_address: str,
    total_amount: int = 0
) -> FairLensContract:
    """
    Factory function to create a FairLens contract
    
    Args:
        owner_address: Government/owner address
        contractor_address: Contractor address
        verifier_address: Verifier address (can be same as owner)
        total_amount: Total contract amount in microAlgos
    
    Returns:
        FairLensContract instance
    """
    return FairLensContract(
        owner_address=owner_address,
        contractor_address=contractor_address,
        verifier_address=verifier_address,
        total_amount=total_amount
    )


class ContractService:
    """Service for contract operations"""
    
    def __init__(self, contract: FairLensContract):
        self.contract = contract
    
    def compile(self) -> Dict[str, Any]:
        """
        Compile the contract to TEAL source code
        
        Returns:
            Dictionary with approval and clear TEAL source code
        """
        approval_teal = self.contract.approval_program()
        clear_teal = self.contract.clear_program()
        
        return {
            "approval_source": approval_teal,
            "clear_source": clear_teal
        }
    
    def add_milestone(
        self, 
        milestone_index: int, 
        amount: int, 
        due_date: int
    ) -> bytes:
        """
        Create transaction to add a milestone to the contract
        
        Args:
            milestone_index: Index of the milestone
            amount: Amount in microAlgos
            due_date: Due date timestamp
            
        Returns:
            Transaction bytes for adding milestone
        """
        # Method ID 1 for add_milestone
        method_id = 1
        return self._create_method_call(method_id, [milestone_index, amount, due_date])
    
    def verify_milestone(
        self, 
        milestone_index: int, 
        signature: bytes, 
        message: bytes,
        proof_hash: bytes = b""
    ) -> bytes:
        """
        Create transaction to verify a milestone
        
        Args:
            milestone_index: Index of the milestone
            signature: Ed25519 signature (64 bytes)
            message: Verification message
            proof_hash: SHA256 hash of proof document (optional)
            
        Returns:
            Transaction bytes for verifying milestone
        """
        # Method ID 2 for verify_milestone
        method_id = 2
        args = [milestone_index, signature, message]
        if proof_hash:
            args.append(proof_hash)
        return self._create_method_call(method_id, args)
    
    def release_payment(self, milestone_index: int) -> bytes:
        """
        Create transaction to release payment for a milestone
        
        Args:
            milestone_index: Index of the milestone
            
        Returns:
            Transaction bytes for releasing payment
        """
        # Method ID 3 for release_payment
        method_id = 3
        return self._create_method_call(method_id, [milestone_index])
    
    def emergency_pause(self) -> bytes:
        """
        Create transaction to pause the contract
        
        Returns:
            Transaction bytes for emergency pause
        """
        # Method ID 4 for emergency_pause
        method_id = 4
        return self._create_method_call(method_id, [])
    
    def resume_contract(self) -> bytes:
        """
        Create transaction to resume the contract
        
        Returns:
            Transaction bytes for resuming contract
        """
        # Method ID 5 for resume_contract
        method_id = 5
        return self._create_method_call(method_id, [])
    
    def update_verifier(self, new_verifier_address: str) -> bytes:
        """
        Create transaction to update the verifier address
        
        Args:
            new_verifier_address: New verifier address
            
        Returns:
            Transaction bytes for updating verifier
        """
        # Method ID 6 for update_verifier
        method_id = 6
        return self._create_method_call(method_id, [new_verifier_address.encode()])
    
    def _create_method_call(self, method_id: int, args: List[Any]) -> bytes:
        """
        Helper method to create a method call transaction
        
        Args:
            method_id: Method identifier
            args: List of arguments
            
        Returns:
            Transaction bytes
        """
        # This is a simplified implementation
        # In a real implementation, this would create an actual Algorand transaction
        return f"method_{method_id}_call".encode()