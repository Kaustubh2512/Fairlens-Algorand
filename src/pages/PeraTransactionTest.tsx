import React, { useState } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';

// Create the PeraWalletConnect instance for TestNet
const peraWallet = new PeraWalletConnect({
  chainId: 416002, // TestNet
  shouldShowSignTxnToast: true
});

const PeraTransactionTest: React.FC = () => {
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleConnectWalletClick = async () => {
    setLoading(true);
    try {
      peraWallet
        .connect()
        .then((newAccounts) => {
          // Setup the disconnect event listener
          if (peraWallet.connector) {
            peraWallet.connector.on("disconnect", handleDisconnectWalletClick);
          }

          setAccountAddress(newAccounts[0]);
          setResult('Wallet connected successfully to TestNet!');
        })
        .catch((error: any) => {
          // You MUST handle the reject because once the user closes the modal, peraWallet.connect() promise will be rejected.
          // For the async/await syntax you MUST use try/catch
          if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
            console.error("Connection error:", error);
            setResult('Connection failed: ' + (error.message || 'Unknown error'));
          }
        });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectWalletClick = () => {
    peraWallet.disconnect();
    setAccountAddress(null);
    setResult('Wallet disconnected from TestNet');
  };

  const handleSendTransaction = async () => {
    if (!accountAddress) {
      setResult('Please connect your wallet first');
      return;
    }

    if (!receiver || !amount) {
      setResult('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      // Initialize Algod client for TestNet
      const algodClient = new algosdk.Algodv2(
        '',
        'https://testnet-api.algonode.cloud',
        443
      );

      // Get transaction parameters
      const params = await algodClient.getTransactionParams().do();

      // Create transaction using the correct method
      const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: accountAddress,
        receiver: receiver,
        amount: parseFloat(amount) * 1000000, // Convert ALGO to microAlgos
        suggestedParams: params
      });

      // Sign transaction
      const signedTxn = await peraWallet.signTransaction([[{txn: transaction, signers: [accountAddress]}]]);
      
      // Send transaction
      const response = await algodClient.sendRawTransaction(signedTxn).do();
      
      setResult(`Transaction sent successfully on TestNet! TxID: ${response.txid}`);
    } catch (error: any) {
      console.error('Transaction failed:', error);
      setResult(`Transaction failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pera Wallet Transaction Test</h1>
          <p className="text-gray-600">
            Test sending transactions with Pera Wallet on Algorand TestNet
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Wallet Connection</h2>
          
          {!accountAddress ? (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">Connect your Pera Wallet to send transactions</p>
              <button
                onClick={handleConnectWalletClick}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect to Pera Wallet'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">Connected to TestNet</p>
                <p className="font-mono text-xs break-all">{accountAddress}</p>
              </div>
              <button
                onClick={handleDisconnectWalletClick}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Disconnect Wallet
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Send Transaction</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="receiver" className="block text-sm font-medium text-gray-700 mb-1">
                Receiver Address
              </label>
              <input
                id="receiver"
                type="text"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                placeholder="Enter receiver address"
                disabled={!accountAddress || loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (ALGO)
              </label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount in ALGO"
                disabled={!accountAddress || loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={handleSendTransaction}
              disabled={loading || !accountAddress || !receiver || !amount}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Transaction on TestNet'}
            </button>
          </div>
        </div>

        {/* Result Message */}
        {result && (
          <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <p className="text-sm text-gray-700">{result}</p>
          </div>
        )}

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>FairLens - Pera Wallet Transaction Test on Algorand TestNet</p>
        </div>
      </div>
    </div>
  );
};

export default PeraTransactionTest;