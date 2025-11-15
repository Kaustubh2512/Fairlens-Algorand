import React, { useState, useEffect } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';

// Create the PeraWalletConnect instance for TestNet - Following official documentation exactly
const peraWallet = new PeraWalletConnect({
  chainId: 416002, // TestNet
  shouldShowSignTxnToast: true
});

const PeraWalletTest: React.FC = () => {
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  // Check if app is connected with Pera Wallet
  const isConnectedToPeraWallet = !!accountAddress;

  useEffect(() => {
    // Reconnect to the session when the component is mounted (Step 5 from documentation)
    peraWallet.reconnectSession()
      .then((accounts) => {
        // Setup the disconnect event listener
        if (peraWallet.connector) {
          peraWallet.connector.on("disconnect", handleDisconnectWalletClick);
        }

        if (peraWallet.isConnected && accounts.length) {
          setAccountAddress(accounts[0]);
        }
      })
      .catch((error: any) => {
        console.log(error);
      });
  }, []);

  // Handle wallet connection (Step 4 from documentation)
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
          if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
            console.error("Connection error:", error);
            setResult('Connection failed: ' + (error.message || 'Unknown error'));
          }
        });
    } finally {
      setLoading(false);
    }
  };

  // Handle wallet disconnection (Step 4 from documentation)
  const handleDisconnectWalletClick = () => {
    peraWallet.disconnect();
    setAccountAddress(null);
    setResult('Wallet disconnected from TestNet');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pera Wallet Test</h1>
          <p className="text-gray-600">
            Simple test following official @perawallet/connect documentation
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Wallet Connection</h2>
          
          {!accountAddress ? (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">Connect your Pera Wallet to TestNet</p>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Network</p>
                  <p className="font-medium">TestNet (416002)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Platform</p>
                  <p className="font-medium capitalize">{peraWallet.platform || 'Unknown'}</p>
                </div>
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

        {/* Result Message */}
        {result && (
          <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <p className="text-sm text-gray-700">{result}</p>
          </div>
        )}

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>FairLens - Pera Wallet Test Implementation</p>
        </div>
      </div>
    </div>
  );
};

export default PeraWalletTest;