import algosdk from 'algosdk';
import { useWallet } from '../contexts/WalletContext';
import apiClient from './apiClient';

// Helper function to encode uint64
function encodeUint64(num: number): Uint8Array {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  const bigNum = BigInt(num);
  view.setBigUint64(0, bigNum, false); // big-endian
  return new Uint8Array(buffer);
}

export interface ContractInfo {
  appId: number;
  appAddress: string;
  status: string;
  totalAmount: number;
  explorerUrl?: string;
}

export interface Milestone {
  index: number;
  amount: number;
  dueDate: number;
  status: 'pending' | 'verified' | 'paid';
  proofHash?: string;
}

export interface TransactionResult {
  transactionId: string;
  status: 'pending' | 'confirmed' | 'failed';
  explorerUrl?: string;
}

export class SmartContractService {
  private walletContext: ReturnType<typeof useWallet> | null = null;

  constructor() {
    // Wallet context will be set when needed
  }

  // Set wallet context (to be called from components)
  setWalletContext(walletContext: ReturnType<typeof useWallet>) {
    this.walletContext = walletContext;
  }

  /**
   * Deploy a new FairLens contract
   */
  async deployContract(
    tenderId: number,
    contractorId: number,
    totalAmount: number
  ): Promise<ContractInfo> {
    try {
      const response = await apiClient.post('/contracts/deploy', {
        tender_id: tenderId,
        contractor_id: contractorId,
        total_amount: totalAmount
      });
      
      return {
        appId: response.data.app_id,
        appAddress: response.data.app_address,
        status: response.data.status,
        totalAmount: response.data.total_amount,
        explorerUrl: response.data.explorer_url
      };
    } catch (error) {
      console.error('Error deploying contract:', error);
      throw new Error('Failed to deploy contract');
    }
  }

  /**
   * Add a milestone to the contract
   */
  async addMilestone(
    appId: number,
    milestoneIndex: number,
    amount: number,
    dueDate: number
  ): Promise<TransactionResult> {
    if (!this.walletContext || !this.walletContext.accountAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      // Create the application call transaction
      // Method ID 1 for add_milestone
      const methodId = new Uint8Array([1]);
      const indexBytes = encodeUint64(milestoneIndex);
      const amountBytes = encodeUint64(amount);
      const dueDateBytes = encodeUint64(dueDate);
      
      const appArgs = [
        methodId,
        indexBytes,
        amountBytes,
        dueDateBytes
      ];

      // Get suggested parameters
      const suggestedParams = await this.getSuggestedParams();

      // Create the transaction
      const transaction = algosdk.makeApplicationNoOpTxnFromObject({
        sender: this.walletContext.accountAddress!,
        suggestedParams: suggestedParams,
        appIndex: appId,
        appArgs: appArgs
      });

      // Sign the transaction
      const signedTxn = await this.walletContext.signTransaction([transaction]);
      
      // Send the transaction
      const result = await this.sendTransaction(signedTxn[0]);
      
      return result;
    } catch (error) {
      console.error('Error adding milestone:', error);
      throw new Error('Failed to add milestone');
    }
  }

  /**
   * Verify a milestone
   */
  async verifyMilestone(
    appId: number,
    milestoneIndex: number,
    signature: Uint8Array,
    message: Uint8Array,
    proofHash?: string
  ): Promise<TransactionResult> {
    if (!this.walletContext || !this.walletContext.accountAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      // Method ID 2 for verify_milestone
      const methodId = new Uint8Array([2]);
      const indexBytes = encodeUint64(milestoneIndex);
      
      const appArgs = [
        methodId,
        indexBytes,
        signature,
        message
      ];
      
      // Add proof hash if provided
      if (proofHash) {
        appArgs.push(new TextEncoder().encode(proofHash));
      }

      // Get suggested parameters
      const suggestedParams = await this.getSuggestedParams();

      // Create the transaction
      const transaction = algosdk.makeApplicationNoOpTxnFromObject({
        sender: this.walletContext.accountAddress!,
        suggestedParams: suggestedParams,
        appIndex: appId,
        appArgs: appArgs
      });

      // Sign the transaction
      const signedTxn = await this.walletContext.signTransaction([transaction]);
      
      // Send the transaction
      const result = await this.sendTransaction(signedTxn[0]);
      
      return result;
    } catch (error) {
      console.error('Error verifying milestone:', error);
      throw new Error('Failed to verify milestone');
    }
  }

  /**
   * Release payment for a milestone
   */
  async releasePayment(
    appId: number,
    milestoneIndex: number
  ): Promise<TransactionResult> {
    if (!this.walletContext || !this.walletContext.accountAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      // Method ID 3 for release_payment
      const methodId = new Uint8Array([3]);
      const indexBytes = encodeUint64(milestoneIndex);
      
      const appArgs = [
        methodId,
        indexBytes
      ];

      // Get suggested parameters
      const suggestedParams = await this.getSuggestedParams();

      // Create the transaction
      const transaction = algosdk.makeApplicationNoOpTxnFromObject({
        sender: this.walletContext.accountAddress!,
        suggestedParams: suggestedParams,
        appIndex: appId,
        appArgs: appArgs
      });

      // Sign the transaction
      const signedTxn = await this.walletContext.signTransaction([transaction]);
      
      // Send the transaction
      const result = await this.sendTransaction(signedTxn[0]);
      
      return result;
    } catch (error) {
      console.error('Error releasing payment:', error);
      throw new Error('Failed to release payment');
    }
  }

  /**
   * Emergency pause the contract
   */
  async emergencyPause(appId: number): Promise<TransactionResult> {
    if (!this.walletContext || !this.walletContext.accountAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      // Method ID 4 for emergency_pause
      const methodId = new Uint8Array([4]);
      
      const appArgs = [methodId];

      // Get suggested parameters
      const suggestedParams = await this.getSuggestedParams();

      // Create the transaction
      const transaction = algosdk.makeApplicationNoOpTxnFromObject({
        sender: this.walletContext.accountAddress!,
        suggestedParams: suggestedParams,
        appIndex: appId,
        appArgs: appArgs
      });

      // Sign the transaction
      const signedTxn = await this.walletContext.signTransaction([transaction]);
      
      // Send the transaction
      const result = await this.sendTransaction(signedTxn[0]);
      
      return result;
    } catch (error) {
      console.error('Error pausing contract:', error);
      throw new Error('Failed to pause contract');
    }
  }

  /**
   * Resume the contract
   */
  async resumeContract(appId: number): Promise<TransactionResult> {
    if (!this.walletContext || !this.walletContext.accountAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      // Method ID 5 for resume_contract
      const methodId = new Uint8Array([5]);
      
      const appArgs = [methodId];

      // Get suggested parameters
      const suggestedParams = await this.getSuggestedParams();

      // Create the transaction
      const transaction = algosdk.makeApplicationNoOpTxnFromObject({
        sender: this.walletContext.accountAddress!,
        suggestedParams: suggestedParams,
        appIndex: appId,
        appArgs: appArgs
      });

      // Sign the transaction
      const signedTxn = await this.walletContext.signTransaction([transaction]);
      
      // Send the transaction
      const result = await this.sendTransaction(signedTxn[0]);
      
      return result;
    } catch (error) {
      console.error('Error resuming contract:', error);
      throw new Error('Failed to resume contract');
    }
  }

  /**
   * Update verifier address
   */
  async updateVerifier(appId: number, newVerifierAddress: string): Promise<TransactionResult> {
    if (!this.walletContext || !this.walletContext.accountAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      // Method ID 6 for update_verifier
      const methodId = new Uint8Array([6]);
      const addressBytes = new TextEncoder().encode(newVerifierAddress);
      
      const appArgs = [
        methodId,
        addressBytes
      ];

      // Get suggested parameters
      const suggestedParams = await this.getSuggestedParams();

      // Create the transaction
      const transaction = algosdk.makeApplicationNoOpTxnFromObject({
        sender: this.walletContext.accountAddress!,
        suggestedParams: suggestedParams,
        appIndex: appId,
        appArgs: appArgs
      });

      // Sign the transaction
      const signedTxn = await this.walletContext.signTransaction([transaction]);
      
      // Send the transaction
      const result = await this.sendTransaction(signedTxn[0]);
      
      return result;
    } catch (error) {
      console.error('Error updating verifier:', error);
      throw new Error('Failed to update verifier');
    }
  }

  /**
   * Get contract information
   */
  async getContractInfo(appId: number): Promise<any> {
    try {
      const response = await apiClient.get(`/contracts/${appId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting contract info:', error);
      throw new Error('Failed to get contract information');
    }
  }

  /**
   * Get contract milestones
   */
  async getContractMilestones(appId: number): Promise<Milestone[]> {
    try {
      const response = await apiClient.get(`/contracts/${appId}/milestones`);
      return response.data;
    } catch (error) {
      console.error('Error getting contract milestones:', error);
      throw new Error('Failed to get contract milestones');
    }
  }

  /**
   * Get suggested transaction parameters
   */
  private async getSuggestedParams(): Promise<algosdk.SuggestedParams> {
    // In a real implementation, you would get this from an algod client
    // For now, we'll return mock parameters
    return {
      flatFee: false,
      fee: 1000,
      minFee: 1000,
      firstValid: 1000000n,
      lastValid: 1001000n,
      genesisID: 'testnet-v1.0',
      genesisHash: new Uint8Array([72, 99, 181, 24, 164, 179, 200, 78, 200, 16, 242, 45, 79, 16, 129, 203, 15, 113, 240, 89, 167, 172, 32, 222, 198, 47, 127, 112, 229, 9, 58, 34]),
    };
  }

  /**
   * Send a signed transaction to the network
   */
  private async sendTransaction(signedTxn: Uint8Array): Promise<TransactionResult> {
    try {
      // In a real implementation, you would send this to the algod client
      // For now, we'll simulate sending and return a mock result
      const mockTxId = 'MOCK_TRANSACTION_ID_' + Math.random().toString(36).substr(2, 9);
      
      return {
        transactionId: mockTxId,
        status: 'pending',
        explorerUrl: `https://testnet.algoexplorer.io/tx/${mockTxId}`
      };
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw new Error('Failed to send transaction');
    }
  }
}

// Export a singleton instance
export const smartContractService = new SmartContractService();