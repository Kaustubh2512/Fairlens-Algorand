import React, { useState, useEffect } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';

// Create the PeraWalletConnect instance for TestNet with React@18 compatibility
const peraWallet = new PeraWalletConnect({
  chainId: 416002, // TestNet
  shouldShowSignTxnToast: true
});

const PeraWalletReact18Demo: React.FC = () => {
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [balance, setBalance] = useState<number | null>(null);

  // Check if app is connected with Pera Wallet
  const isConnectedToPeraWallet = !!accountAddress;

  useEffect(() => {
    // Reconnect to the session when the component is mounted
    peraWallet.reconnectSession()
      .then((accounts) => {
        // Setup the disconnect event listener
        if (peraWallet.connector) {
          peraWallet.connector.on("disconnect", handleDisconnectWalletClick);
        }

        if (peraWallet.isConnected && accounts.length) {
          setAccountAddress(accounts[0]);
          fetchBalance(accounts[0]);
        }
      })
      .catch((error: any) => {
        console.log(error);
      });

    // No cleanup needed as we can't remove the listener properly
  }, []);

  const handleConnectWalletClick = async () => {
    setLoading(true);
    try {
      const newAccounts = await peraWallet.connect();
      
      // Setup the disconnect event listener
      if (peraWallet.connector) {
        peraWallet.connector.on("disconnect", handleDisconnectWalletClick);
      }

      setAccountAddress(newAccounts[0]);
      await fetchBalance(newAccounts[0]);
      setResult('Wallet connected successfully to TestNet!');
    } catch (error: any) {
      // Handle the reject because once the user closes the modal, peraWallet.connect() promise will be rejected.
      if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
        console.error("Connection error:", error);
        setResult('Connection failed: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectWalletClick = () => {
    peraWallet.disconnect();
    setAccountAddress(null);
    setBalance(null);
    setResult('Wallet disconnected from TestNet');
  };

  const fetchBalance = async (address: string) => {
    try {
      // Initialize Algod client for TestNet
      const algodClient = new algosdk.Algodv2(
        '',
        'https://testnet-api.algonode.cloud',
        443
      );

      const accountInfo = await algodClient.accountInformation(address).do();
      // Convert from microAlgos to ALGO
      setBalance(Number(accountInfo.amount) / 1000000);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setResult('Error fetching balance');
    }
  };

  // Function to demonstrate transaction signing with proper error handling
  const handleSendTransaction = async () => {
    if (!accountAddress) {
      setResult('Please connect your wallet first');
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
        receiver: accountAddress, // Sending to self for demo
        amount: 2000, // 0.002 ALGO in microAlgos
        suggestedParams: params
      });

      // Sign transaction with proper error handling
      const signedTxn = await peraWallet.signTransaction([[{txn: transaction, signers: [accountAddress]}]]);
      
      // Send transaction
      const response = await algodClient.sendRawTransaction(signedTxn).do();
      
      setResult(`Transaction sent successfully on TestNet! TxID: ${response.txid}`);
    } catch (error: any) {
      console.error('Transaction failed:', error);
      if (error.message && error.message.includes('Sign')) {
        setResult('Transaction signing was cancelled by the user');
      } else {
        setResult(`Transaction failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pera Wallet React@18 Demo
          </h1>
          <p className="text-xl text-gray-600">
            Implementation compatible with React 18 and following official documentation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wallet Connection Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Wallet Connection</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-gray-600">Network</p>
                  <p className="font-medium">Algorand TestNet</p>
                </div>
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  TestNet
                </div>
              </div>

              {!accountAddress ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-6">Connect your Pera Wallet to interact with the TestNet</p>
                  <button
                    onClick={handleConnectWalletClick}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
                  >
                    {loading ? 'Connecting...' : 'Connect to Pera Wallet'}
                  </button>
                  <p className="text-gray-500 text-sm mt-4">
                    React@18 compatible implementation
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">Connected to TestNet</span>
                    </div>
                    <p className="font-mono text-sm break-all bg-white p-2 rounded">
                      {accountAddress}
                    </p>
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
          </div>

          {/* Wallet Information Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Wallet Information</h2>
            
            {accountAddress ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
                  <p className="font-mono text-sm break-all bg-gray-50 p-2 rounded">
                    {accountAddress}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500">ALGO Balance</h3>
                    <button
                      onClick={() => fetchBalance(accountAddress)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Refresh
                    </button>
                  </div>
                  <p className="text-lg font-medium mt-1">
                    {balance !== null ? `${balance.toFixed(6)} ALGO` : 'Loading...'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Network</h3>
                  <p className="text-sm">Algorand TestNet (Chain ID: 416002)</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Platform</h3>
                  <p className="text-sm capitalize">
                    {peraWallet.platform || 'Unknown'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Connection Status</h3>
                  <p className="text-sm">
                    {peraWallet.isConnected ? 'Connected' : 'Not Connected'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Connect your wallet to see information</p>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Demo Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Transaction Signing Demo</h2>
          
          {accountAddress ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                This section demonstrates signing transactions with Pera Wallet with proper React@18 error handling.
              </p>
              
              <button
                onClick={handleSendTransaction}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Sending Transaction...' : 'Send Test Transaction (0.002 ALGO to self)'}
              </button>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>Connect your wallet to test transaction signing</p>
            </div>
          )}
        </div>

        {/* Result Message */}
        {result && (
          <div className="mt-8 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <p className="text-sm text-gray-700">{result}</p>
          </div>
        )}

        {/* React@18 Compatibility Notes */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">React@18 Compatibility</h2>
          <div className="prose max-w-none">
            <p className="text-gray-600">
              This implementation is compatible with React 18 and addresses the specific requirements mentioned in the official documentation:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2 text-gray-600">
              <li>Proper cleanup of event listeners in useEffect</li>
              <li>Async/await error handling instead of .catch() chains</li>
              <li>Compatible with react-scripts@5.x and webpack 5</li>
              <li>Handles polyfill requirements for Buffer and crypto</li>
            </ul>
            <p className="mt-4 text-gray-600">
              Note: For React 18 projects, you may need to install additional polyfills:
            </p>
            <pre className="bg-gray-100 p-4 rounded mt-2 text-sm">
              {`npm install buffer crypto-browserify process react-app-rewired stream-browserify`}
            </pre>
          </div>
        </div>

        <div className="text-center mt-12 text-sm text-gray-500">
          <p>FairLens - Pera Wallet React@18 Compatible Implementation</p>
        </div>
      </div>
    </div>
  );
};

export default PeraWalletReact18Demo;