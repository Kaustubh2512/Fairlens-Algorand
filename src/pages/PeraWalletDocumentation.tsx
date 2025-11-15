import React from 'react';
import { Link } from 'react-router-dom';

const PeraWalletDocumentation: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pera Wallet Integration Documentation
          </h1>
          <p className="text-xl text-gray-600">
            Complete guide to Pera Wallet integration with Algorand TestNet
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="text-gray-600 mb-4">
            This documentation provides multiple implementations of Pera Wallet integration following the official 
            <code className="bg-gray-100 px-1 rounded">@perawallet/connect</code> documentation. Each implementation 
            demonstrates different aspects and use cases of the Pera Wallet integration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">1. Wallet Connection Demo</h3>
            <p className="text-gray-600 mb-4">
              Basic implementation showing wallet connection and account information retrieval.
            </p>
            <Link 
              to="/pera-showcase" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              View Demo
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-3 text-green-700">2. Transaction Test</h3>
            <p className="text-gray-600 mb-4">
              Demonstrates signing and sending transactions using Pera Wallet.
            </p>
            <Link 
              to="/pera-transaction-test" 
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              View Demo
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-3 text-purple-700">3. Complete Demo</h3>
            <p className="text-gray-600 mb-4">
              Full implementation following all steps from the official documentation.
            </p>
            <Link 
              to="/pera-complete-demo" 
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              View Demo
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-3 text-yellow-700">4. Simple Test</h3>
            <p className="text-gray-600 mb-4">
              Minimal implementation for quick testing and verification.
            </p>
            <Link 
              to="/pera-test" 
              className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              View Demo
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
            <h3 className="text-xl font-semibold mb-3 text-indigo-700">5. React@18 Demo</h3>
            <p className="text-gray-600 mb-4">
              Implementation compatible with React 18, including proper error handling and async/await patterns.
            </p>
            <Link 
              to="/pera-react18-demo" 
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              View Demo
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Key Implementation Details</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">1. Installation</h3>
              <pre className="bg-gray-100 p-4 rounded">
                npm install --save @perawallet/connect
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">2. Instance Creation</h3>
              <pre className="bg-gray-100 p-4 rounded">
{`import { PeraWalletConnect } from "@perawallet/connect";

const peraWallet = new PeraWalletConnect({
  chainId: 416002, // TestNet
  shouldShowSignTxnToast: true
});`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">3. Connection Handler</h3>
              <pre className="bg-gray-100 p-4 rounded">
{`function handleConnectWalletClick() {
  peraWallet
    .connect()
    .then((newAccounts) => {
      // Setup the disconnect event listener
      peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
      setAccountAddress(newAccounts[0]);
    })
    .catch((error) => {
      if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
        console.error("Connection error:", error);
      }
    });
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">4. Disconnection Handler</h3>
              <pre className="bg-gray-100 p-4 rounded">
{`function handleDisconnectWalletClick() {
  peraWallet.disconnect();
  setAccountAddress(null);
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">5. Session Reconnection</h3>
              <pre className="bg-gray-100 p-4 rounded">
{`useEffect(() => {
  peraWallet.reconnectSession().then((accounts) => {
    peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
    if (peraWallet.isConnected && accounts.length) {
      setAccountAddress(accounts[0]);
    }
  }).catch(error) {
    console.log(error);
  };
}, []);`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">6. Transaction Signing</h3>
              <pre className="bg-gray-100 p-4 rounded">
{`const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  sender: accountAddress,
  receiver: receiver,
  amount: parseFloat(amount) * 1000000,
  suggestedParams: params
});

const signedTxn = await peraWallet.signTransaction([[{txn: transaction, signers: [accountAddress]}]]);`}
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">React@18 Specific Considerations</h2>
          <p className="text-gray-600 mb-4">
            When using @perawallet/connect with React 18, you may need to install additional polyfills due to 
            changes in react-scripts@5.x:
          </p>
          <pre className="bg-gray-100 p-4 rounded">
{`npm install buffer crypto-browserify process react-app-rewired stream-browserify

// Create config-overrides.js
const webpack = require('webpack');

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
  });
  config.resolve.fallback = fallback;
  config.ignoreWarnings = [/Failed to parse source map/];
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);
  return config;
};`}
          </pre>
          <p className="text-gray-600 mt-4">
            Update your package.json scripts to use react-app-rewired:
          </p>
          <pre className="bg-gray-100 p-4 rounded">
{`{
  "scripts": {
    "start": "react-app-rewired start",
    "build": "react-app-rewired build"
  }
}`}
          </pre>
        </div>

        <div className="text-center mt-12 text-sm text-gray-500">
          <p>FairLens - Pera Wallet Integration Documentation</p>
        </div>
      </div>
    </div>
  );
};

export default PeraWalletDocumentation;