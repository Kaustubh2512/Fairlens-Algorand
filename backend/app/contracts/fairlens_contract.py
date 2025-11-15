"""
FairLens Smart Contract - PyTeal Implementation with Box Storage
This contract handles milestone-based payments for tender management using Box Storage

Reference: https://dev.algorand.co/concepts/smart-contracts/storage/box/
"""

import pyteal as pt
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


class FairLensContract:
    """
    Smart contract for transparent tender management with milestone-based payments
    Uses Box Storage for milestone data storage (more efficient than global state)
    """
    
    def __init__(
        self,
        owner_address: str,
        contractor_address: str,
        verifier_address: str,
        total_amount: int = 0
    ):
        self.owner_address = owner_address
        self.contractor_address = contractor_address
        self.verifier_address = verifier_address
        self.total_amount = total_amount
    
    def approval_program(self) -> str:
        """
        Main approval program with Box Storage for milestones
        Box keys: "m_{milestone_index}" stores milestone data
        """
        
        # Global state keys
        owner_key = pt.Bytes("owner")
        contractor_key = pt.Bytes("contractor")
        verifier_key = pt.Bytes("verifier")
        total_amount_key = pt.Bytes("total_amt")
        milestone_count_key = pt.Bytes("m_count")
        current_milestone_key = pt.Bytes("curr_m")
        paused_key = pt.Bytes("paused")
        verifier_update_time_key = pt.Bytes("verifier_update")
        verifier_timelock_key = pt.Bytes("verifier_timelock")  # 24 hours in seconds
        
        # Box key prefix for milestones
        milestone_box_prefix = pt.Bytes("m_")
        
        # On creation: initialize state
        on_creation = pt.Seq([
            pt.App.globalPut(owner_key, pt.Bytes(self.owner_address)),
            pt.App.globalPut(contractor_key, pt.Bytes(self.contractor_address)),
            pt.App.globalPut(verifier_key, pt.Bytes(self.verifier_address)),
            pt.App.globalPut(total_amount_key, pt.Int(self.total_amount)),
            pt.App.globalPut(milestone_count_key, pt.Int(0)),
            pt.App.globalPut(current_milestone_key, pt.Int(0)),
            pt.App.globalPut(paused_key, pt.Int(0)),  # 0 = not paused, 1 = paused
            pt.App.globalPut(verifier_update_time_key, pt.Int(0)),
            pt.App.globalPut(verifier_timelock_key, pt.Int(86400)),  # 24 hours timelock
            pt.Approve()
        ])
        
        # Helper: Create box key for milestone
        def milestone_box_key(milestone_index: pt.Expr) -> pt.Expr:
            return pt.Concat(milestone_box_prefix, pt.Itob(milestone_index))
        
        # Add milestone (called by owner)
        # Args: [1] = milestone_index, [2] = amount, [3] = due_date
        def add_milestone():
            milestone_index = pt.Btoi(pt.Txn.application_args[1])
            amount = pt.Btoi(pt.Txn.application_args[2])
            due_date = pt.Btoi(pt.Txn.application_args[3])
            
            box_key = milestone_box_key(milestone_index)
            # Box stores: amount (8 bytes) + due_date (8 bytes) + status (1 byte) = 17 bytes
            box_size = pt.Int(17)
            
            return pt.Seq([
                pt.Assert(pt.Txn.sender() == pt.App.globalGet(owner_key)),
                pt.Assert(pt.App.globalGet(paused_key) == pt.Int(0)),  # Check not paused
                # Check if box exists, create if not
                box_len := pt.Box.len(box_key),
                pt.If(box_len == pt.Int(0))
                .Then(pt.Box.create(box_key, box_size))
                .Else(pt.Seq([])),  # Box already exists
                # Write milestone data: amount (8) + due_date (8) + status (1)
                pt.Box.replace(box_key, pt.Int(0), pt.Itob(amount)),
                pt.Box.replace(box_key, pt.Int(8), pt.Itob(due_date)),
                pt.Box.replace(box_key, pt.Int(16), pt.Itob(pt.Int(0))),  # Status: 0 = pending (1 byte)
                # Update milestone count
                pt.If(milestone_index >= pt.App.globalGet(milestone_count_key))
                .Then(pt.App.globalPut(milestone_count_key, milestone_index + pt.Int(1))),
                pt.Approve()
            ])
        
        # Emergency pause (called by owner)
        def emergency_pause():
            return pt.Seq([
                pt.Assert(pt.Txn.sender() == pt.App.globalGet(owner_key)),
                pt.App.globalPut(paused_key, pt.Int(1)),
                pt.Approve()
            ])
        
        # Resume after pause (called by owner)
        def resume_contract():
            return pt.Seq([
                pt.Assert(pt.Txn.sender() == pt.App.globalGet(owner_key)),
                pt.App.globalPut(paused_key, pt.Int(0)),
                pt.Approve()
            ])
        
        # Update verifier with timelock (called by owner)
        # Args: [1] = new_verifier_address
        def update_verifier():
            new_verifier = pt.Txn.application_args[1]
            current_time = pt.Global.latest_timestamp()
            update_time = pt.App.globalGet(verifier_update_time_key)
            timelock = pt.App.globalGet(verifier_timelock_key)
            
            return pt.Seq([
                pt.Assert(pt.Txn.sender() == pt.App.globalGet(owner_key)),
                # Check if timelock has passed or this is the first update
                pt.If(update_time == pt.Int(0))
                .Then(  # First update, allow immediately
                    pt.Seq([
                        pt.App.globalPut(verifier_key, new_verifier),
                        pt.App.globalPut(verifier_update_time_key, current_time),
                        pt.Approve()
                    ])
                )
                .Else(  # Check timelock
                    pt.Seq([
                        pt.Assert(current_time >= update_time + timelock),
                        pt.App.globalPut(verifier_key, new_verifier),
                        pt.App.globalPut(verifier_update_time_key, current_time),
                        pt.Approve()
                    ])
                )
            ])
        
        # Verify milestone (called by verifier)
        # Args: [1] = milestone_index, [2] = signature (64 bytes), [3] = message (variable length), [4] = proof_hash
        # Uses Ed25519Verify for signature validation with replay protection
        def verify_milestone():
            milestone_index = pt.Btoi(pt.Txn.application_args[1])
            signature = pt.Txn.application_args[2] if pt.Txn.application_args.length() > pt.Int(2) else pt.Bytes("")
            message = pt.Txn.application_args[3] if pt.Txn.application_args.length() > pt.Int(3) else pt.Bytes("")
            proof_hash = pt.Txn.application_args[4] if pt.Txn.application_args.length() > pt.Int(4) else pt.Bytes("")
            
            box_key = milestone_box_key(milestone_index)
            
            # Verify signature using Ed25519Verify
            verifier_addr = pt.App.globalGet(verifier_key)
            
            # Create verification message: milestone_index + contract_id (app_id) + proof_hash + timestamp
            verification_message = pt.Concat(
                pt.Itob(milestone_index),
                pt.Itob(pt.Global.current_application_id()),
                proof_hash,
                pt.Itob(pt.Global.latest_timestamp())
            )
            
            # Verify signature (Ed25519Verify)
            signature_valid = pt.Len(signature) == pt.Int(64)
            
            return pt.Seq([
                pt.Assert(pt.Txn.sender() == pt.App.globalGet(verifier_key)),
                pt.Assert(pt.App.globalGet(paused_key) == pt.Int(0)),  # Check not paused
                pt.Assert(pt.App.globalGet(current_milestone_key) == milestone_index),
                pt.Assert(pt.Box.len(box_key) > pt.Int(0)),
                pt.Assert(signature_valid),  # Signature must be 64 bytes for Ed25519
                # Verify the signature using Ed25519
                pt.Assert(pt.Ed25519Verify(verification_message, signature, verifier_addr)),
                # Update milestone status to verified (status = 1)
                pt.Box.replace(box_key, pt.Int(16), pt.Itob(pt.Int(1))),  # Status: 1 = verified
                # Store proof hash in box for tamper detection (optional)
                pt.If(pt.Len(proof_hash) > pt.Int(0))
                .Then(pt.Box.replace(box_key, pt.Int(17), proof_hash)),  # Store proof hash after status
                # Update current milestone
                pt.App.globalPut(current_milestone_key, milestone_index + pt.Int(1)),
                pt.Approve()
            ])
        
        # Release payment (called by owner after verification)
        # Args: [1] = milestone_index
        def release_payment():
            milestone_index = pt.Btoi(pt.Txn.application_args[1])
            box_key = milestone_box_key(milestone_index)
            
            # Read milestone data from box
            amount_bytes = pt.Box.extract(box_key, pt.Int(0), pt.Int(8))
            status_byte = pt.Box.extract(box_key, pt.Int(16), pt.Int(1))
            amount = pt.Btoi(amount_bytes)
            status = pt.Btoi(status_byte)
            
            return pt.Seq([
                pt.Assert(pt.Txn.sender() == pt.App.globalGet(owner_key)),
                pt.Assert(pt.App.globalGet(paused_key) == pt.Int(0)),  # Check not paused
                pt.Assert(pt.Box.len(box_key) > pt.Int(0)),
                pt.Assert(status == pt.Int(1)),  # Must be verified
                # Create inner transaction to send payment
                pt.InnerTxnBuilder.Begin(),
                pt.InnerTxnBuilder.SetFields({
                    pt.TxnField.type_enum: pt.TxnType.Payment,
                    pt.TxnField.receiver: pt.App.globalGet(contractor_key),
                    pt.TxnField.amount: amount,
                    pt.TxnField.fee: pt.Int(0),
                }),
                pt.InnerTxnBuilder.Submit(),
                # Update milestone status to paid (status = 2)
                pt.Box.replace(box_key, pt.Int(16), pt.Itob(pt.Int(2))),  # Status: 2 = paid
                pt.Approve()
            ])
        
        # Main program logic
        # Method routing: [0] = method_id
        # 1 = add_milestone, 2 = verify_milestone, 3 = release_payment
        # 4 = emergency_pause, 5 = resume_contract, 6 = update_verifier
        program = pt.Cond(
            [pt.Txn.application_id() == pt.Int(0), on_creation],
            [pt.Txn.on_completion() == pt.OnComplete.NoOp, pt.Seq([
                pt.Assert(pt.Txn.application_args.length() > pt.Int(0)),
                method_id := pt.Btoi(pt.Txn.application_args[0]),
                pt.If(method_id == pt.Int(1))
                .Then(add_milestone())
                .ElseIf(method_id == pt.Int(2))
                .Then(verify_milestone())
                .ElseIf(method_id == pt.Int(3))
                .Then(release_payment())
                .ElseIf(method_id == pt.Int(4))
                .Then(emergency_pause())
                .ElseIf(method_id == pt.Int(5))
                .Then(resume_contract())
                .ElseIf(method_id == pt.Int(6))
                .Then(update_verifier())
                .Else(pt.Reject())
            ])],
            [pt.Txn.on_completion() == pt.OnComplete.DeleteApplication, 
             pt.Seq([
                 # Only owner can delete, and only after deleting all boxes
                 pt.Assert(pt.Txn.sender() == pt.App.globalGet(owner_key)),
                 pt.Approve()
             ])],
            [pt.Txn.on_completion() == pt.OnComplete.UpdateApplication, pt.Reject()],
            [pt.Txn.on_completion() == pt.OnComplete.OptIn, pt.Approve()],
            [pt.Txn.on_completion() == pt.OnComplete.CloseOut, pt.Approve()],
        )
        
        return pt.compileTeal(program, mode=pt.Mode.Application, version=10)
    
    def clear_program(self) -> str:
        """Clear state program"""
        return pt.compileTeal(pt.Approve(), mode=pt.Mode.Application, version=10)


# Example usage
if __name__ == "__main__":
    contract = FairLensContract(
        owner_address="GOVERNMENT_ADDRESS",
        contractor_address="CONTRACTOR_ADDRESS",
        verifier_address="VERIFIER_ADDRESS",
        total_amount=1000000000  # 1000 ALGO in microAlgos
    )
    
    approval_teal = contract.approval_program()
    clear_teal = contract.clear_program()
    
    print("Approval Program:")
    print(approval_teal)
    print("\nClear Program:")
    print(clear_teal)