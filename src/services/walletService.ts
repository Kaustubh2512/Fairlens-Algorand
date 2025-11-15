import apiClient from './apiClient';
import { Transaction } from 'algosdk';

export interface SignedTransactionRequest {
  transaction: string; // Base64 encoded signed transaction
  note?: string;
}

export const walletService = {
  async getBalance(address: string): Promise<number> {
    const response = await apiClient.get<number>(`/wallet/balance/${address}`);
    return response.data;
  },

  async connectWallet(address: string): Promise<any> {
    const response = await apiClient.post('/auth/connect-wallet', { address });
    return response.data;
  },

  async sendSignedTransaction(signedTransaction: Uint8Array, note?: string): Promise<any> {
    // Convert Uint8Array to Base64 string using browser APIs
    const transactionBase64 = btoa(String.fromCharCode(...signedTransaction));
    
    const request: SignedTransactionRequest = {
      transaction: transactionBase64,
      note: note
    };
    
    const response = await apiClient.post('/wallet/send-transaction', request);
    return response.data;
  }
};