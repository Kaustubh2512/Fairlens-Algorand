import algosdk from 'algosdk';

// Algorand TestNet configuration
const ALGOD_SERVER = 'https://testnet-api.algonode.network';
const ALGOD_PORT = '';
const ALGOD_TOKEN = '';

// Initialize Algod client
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

export const blockchainService = {
  // Get account balance
  async getAccountBalance(address: string): Promise<{ algoBalance: number; assets: any[] }> {
    try {
      const accountInfo: any = await algodClient.accountInformation(address).do();
      const algoBalance = Number(accountInfo.amount) / 1_000_000; // Convert from microAlgos to Algos
      
      const assets = accountInfo.assets ? accountInfo.assets.map((asset: any) => ({
        assetId: asset['asset-id'],
        amount: asset.amount,
        frozen: asset['is-frozen']
      })) : [];
      
      return { algoBalance, assets };
    } catch (error) {
      console.error('Error getting account balance:', error);
      throw error;
    }
  },

  // Create payment transaction
  async createPaymentTransaction(
    sender: string,
    receiver: string,
    amount: number, // in ALGO
    note?: string
  ): Promise<algosdk.Transaction> {
    try {
      const params = await algodClient.getTransactionParams().do();
      
      const noteBytes = note ? new TextEncoder().encode(note) : undefined;
      
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: sender,
        to: receiver,
        amount: BigInt(amount * 1_000_000), // Convert to microAlgos
        note: noteBytes,
        suggestedParams: params
      } as any);
      
      return txn;
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      throw error;
    }
  },

  // Create asset transfer transaction
  async createAssetTransferTransaction(
    sender: string,
    receiver: string,
    assetId: number,
    amount: number,
    note?: string
  ): Promise<algosdk.Transaction> {
    try {
      const params = await algodClient.getTransactionParams().do();
      
      const noteBytes = note ? new TextEncoder().encode(note) : undefined;
      
      const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: sender,
        to: receiver,
        assetIndex: assetId,
        amount: BigInt(amount),
        note: noteBytes,
        suggestedParams: params
      } as any);
      
      return txn;
    } catch (error) {
      console.error('Error creating asset transfer transaction:', error);
      throw error;
    }
  },

  // Create application call transaction
  async createApplicationCallTransaction(
    sender: string,
    appId: number,
    appArgs: Uint8Array[],
    accounts?: string[],
    foreignApps?: number[],
    foreignAssets?: number[],
    note?: string
  ): Promise<algosdk.Transaction> {
    try {
      const params = await algodClient.getTransactionParams().do();
      
      const noteBytes = note ? new TextEncoder().encode(note) : undefined;
      
      const txn = algosdk.makeApplicationNoOpTxnFromObject({
        sender: sender,
        appIndex: appId,
        appArgs: appArgs,
        accounts: accounts,
        foreignApps: foreignApps,
        foreignAssets: foreignAssets,
        note: noteBytes,
        suggestedParams: params
      });
      
      return txn;
    } catch (error) {
      console.error('Error creating application call transaction:', error);
      throw error;
    }
  },

  // Send signed transaction to network
  async sendTransaction(signedTxn: Uint8Array): Promise<string> {
    try {
      const response: any = await algodClient.sendRawTransaction(signedTxn).do();
      return response.txId;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  },

  // Wait for transaction confirmation
  async waitForConfirmation(txId: string, timeout = 10): Promise<any> {
    try {
      return await algosdk.waitForConfirmation(algodClient, txId, timeout);
    } catch (error) {
      console.error('Error waiting for transaction confirmation:', error);
      throw error;
    }
  },

  // Get transaction information
  async getTransactionInfo(txId: string): Promise<any> {
    try {
      return await algodClient.pendingTransactionInformation(txId).do();
    } catch (error) {
      console.error('Error getting transaction info:', error);
      throw error;
    }
  }
};