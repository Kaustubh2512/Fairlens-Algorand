import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';
import apiClient from '../services/apiClient';
import { blockchainService } from '../services/blockchainService';

interface WalletContextType {
  accountAddress: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  signTransaction: (transactions: algosdk.Transaction[]) => Promise<Uint8Array[]>;
  getBalance: () => Promise<{ algoBalance: number; assets: any[] }>;
  sendTransaction: (signedTxn: Uint8Array) => Promise<string>;
  createPaymentTransaction: (receiver: string, amount: number, note?: string) => Promise<algosdk.Transaction>;
  createAssetTransferTransaction: (receiver: string, assetId: number, amount: number, note?: string) => Promise<algosdk.Transaction>;
  transactionSigner: algosdk.TransactionSigner | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Initialize Pera Wallet
const peraWallet = new PeraWalletConnect();

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Reconnect to the session when the component is mounted
    peraWallet.reconnectSession()
      .then((accounts) => {
        if (accounts.length > 0) {
          setAccountAddress(accounts[0]);
          setIsConnected(true);
          localStorage.setItem('walletAddress', accounts[0]);
          // Connect wallet to backend
          connectWalletToBackend(accounts[0]);
        }
      })
      .catch((error: any) => {
        console.error('Error reconnecting to Pera Wallet:', error);
        // Handle the case when the user wasn't connected before
        if (error?.data?.type !== 'CONNECT_MODAL_CLOSED') {
          console.error(error);
        }
      });

    // Setup event listeners
    return () => {
      peraWallet.disconnect();
    };
  }, []);

  const connectWalletToBackend = async (address: string) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await apiClient.post('/auth/connect-wallet', { wallet_address: address });
        console.log('Wallet connected to backend');
      }
    } catch (error) {
      console.error('Error connecting wallet to backend:', error);
    }
  };

  const connectWallet = async () => {
    try {
      const newAccounts = await peraWallet.connect();
      if (newAccounts.length > 0) {
        setAccountAddress(newAccounts[0]);
        setIsConnected(true);
        localStorage.setItem('walletAddress', newAccounts[0]);
        // Connect wallet to backend
        await connectWalletToBackend(newAccounts[0]);
      }
    } catch (error: any) {
      console.error('Error connecting to Pera Wallet:', error);
      // Handle the case when the user closes the modal
      if (error?.data?.type !== 'CONNECT_MODAL_CLOSED') {
        console.error(error);
      }
    }
  };

  const disconnectWallet = async () => {
    try {
      await peraWallet.disconnect();
      setAccountAddress(null);
      setIsConnected(false);
      localStorage.removeItem('walletAddress');
    } catch (error) {
      console.error('Error disconnecting from Pera Wallet:', error);
    }
  };

  const signTransaction = async (transactions: algosdk.Transaction[]): Promise<Uint8Array[]> => {
    try {
      if (!accountAddress) {
        throw new Error('No account connected');
      }
      
      // Convert transactions to the format expected by Pera Wallet
      const signerTransactions = transactions.map(txn => ({
        txn: txn,
        signers: [accountAddress]
      }));
      
      const signedTransactions = await peraWallet.signTransaction([signerTransactions]);
      return signedTransactions;
    } catch (error) {
      console.error('Error signing transactions with Pera Wallet:', error);
      throw error;
    }
  };

  // Create a transaction signer function that can be used with algokit
  const transactionSigner: algosdk.TransactionSigner = async (transactions: algosdk.Transaction[], indexesToSign: number[]) => {
    try {
      if (!accountAddress) {
        throw new Error('No account connected');
      }
      
      // Filter transactions that need to be signed
      const transactionsToSign = transactions.filter((_, index) => indexesToSign.includes(index));
      
      // Convert transactions to the format expected by Pera Wallet
      const signerTransactions = transactionsToSign.map(txn => ({
        txn: txn,
        signers: [accountAddress]
      }));
      
      const signedTransactions = await peraWallet.signTransaction([signerTransactions]);
      return signedTransactions;
    } catch (error) {
      console.error('Error signing transactions with Pera Wallet:', error);
      throw error;
    }
  };

  const getBalance = async (): Promise<{ algoBalance: number; assets: any[] }> => {
    if (!accountAddress) {
      return { algoBalance: 0, assets: [] };
    }
    
    try {
      return await blockchainService.getAccountBalance(accountAddress);
    } catch (error) {
      console.error('Error getting account balance:', error);
      return { algoBalance: 0, assets: [] };
    }
  };

  return (
    <WalletContext.Provider
      value={{
        accountAddress,
        isConnected,
        connectWallet,
        disconnectWallet,
        signTransaction,
        getBalance,
        sendTransaction: blockchainService.sendTransaction,
        createPaymentTransaction: async (receiver: string, amount: number, note?: string) => {
          if (!accountAddress) throw new Error('No account connected');
          return blockchainService.createPaymentTransaction(accountAddress, receiver, amount, note);
        },
        createAssetTransferTransaction: async (receiver: string, assetId: number, amount: number, note?: string) => {
          if (!accountAddress) throw new Error('No account connected');
          return blockchainService.createAssetTransferTransaction(accountAddress, receiver, assetId, amount, note);
        },
        transactionSigner: isConnected && accountAddress ? transactionSigner : null
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};