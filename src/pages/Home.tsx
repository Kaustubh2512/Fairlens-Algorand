import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { blockchainService } from '../services/blockchainService';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { activeAddress } = useWallet();
  const [balance, setBalance] = useState<{ algoBalance: number; assets: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeAddress) {
      fetchBalance();
    }
  }, [activeAddress]);

  const fetchBalance = async () => {
    if (!activeAddress) return;
    
    setLoading(true);
    try {
      const balanceData = await blockchainService.getAccountBalance(activeAddress);
      setBalance(balanceData);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            FairLens - Transparent Tender Management
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Blockchain-powered platform for transparent government tendering and construction project management
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Wallet Connection Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Wallet Connection</h2>
            
            {activeAddress ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Connected Wallet:</p>
                    <p className="font-mono text-lg break-all bg-gray-100 p-2 rounded mt-1">
                      {activeAddress}
                    </p>
                  </div>
                </div>

                {/* Balance Information */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-xl font-medium mb-3">Account Balance</h3>
                  
                  {loading ? (
                    <p>Loading balance...</p>
                  ) : balance ? (
                    <div className="space-y-2">
                      <p className="text-lg">
                        <span className="font-medium">ALGO Balance:</span> {balance.algoBalance.toFixed(6)} ALGO
                      </p>
                      {balance.assets.length > 0 && (
                        <div>
                          <p className="font-medium">Assets:</p>
                          <ul className="list-disc pl-5 mt-1">
                            {balance.assets.map((asset, index) => (
                              <li key={index}>
                                Asset ID: {asset.assetId} - Amount: {asset.amount}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={fetchBalance}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Refresh Balance
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Connect your wallet to get started</p>
                <p className="text-gray-500 text-sm mb-4">Supported wallets: Pera, Defly, Exodus</p>
              </div>
            )}
          </div>

          {/* Pera Wallet Showcase Links */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Pera Wallet TestNet Showcase</h2>
            <p className="text-gray-600 mb-6">
              Test the Pera Wallet integration with Algorand TestNet
            </p>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <Link 
                to="/pera-showcase" 
                className="block bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-center transition-colors"
              >
                <h3 className="font-medium text-blue-800">Wallet Connection Demo</h3>
                <p className="text-sm text-blue-600 mt-1">Connect and view wallet information</p>
              </Link>
              <Link 
                to="/pera-transaction-test" 
                className="block bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-center transition-colors"
              >
                <h3 className="font-medium text-green-800">Transaction Test</h3>
                <p className="text-sm text-green-600 mt-1">Send transactions on TestNet</p>
              </Link>
              <Link 
                to="/pera-complete-demo" 
                className="block bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-center transition-colors"
              >
                <h3 className="font-medium text-purple-800">Complete Demo</h3>
                <p className="text-sm text-purple-600 mt-1">Full implementation following official docs</p>
              </Link>
              <Link 
                to="/pera-test" 
                className="block bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg p-4 text-center transition-colors"
              >
                <h3 className="font-medium text-yellow-800">Simple Test</h3>
                <p className="text-sm text-yellow-600 mt-1">Minimal implementation test</p>
              </Link>
              <Link 
                to="/pera-react18-demo" 
                className="block bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg p-4 text-center transition-colors"
              >
                <h3 className="font-medium text-indigo-800">React@18 Demo</h3>
                <p className="text-sm text-indigo-600 mt-1">React 18 compatible implementation</p>
              </Link>
              <Link 
                to="/pera-documentation" 
                className="block bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 text-center transition-colors"
              >
                <h3 className="font-medium text-gray-800">Documentation</h3>
                <p className="text-sm text-gray-600 mt-1">Complete integration guide</p>
              </Link>
            </div>
          </div>

          {/* System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Government</h3>
              <p className="text-gray-600">
                Create and manage tenders with transparent processes
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Contractors</h3>
              <p className="text-gray-600">
                Apply for tenders and track project milestones
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Transparency</h3>
              <p className="text-gray-600">
                Real-time tracking of all transactions and milestones
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">For Government Officials</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Create new tender opportunities</li>
                  <li>Review contractor proposals</li>
                  <li>Deploy smart contracts</li>
                  <li>Verify milestone completion</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">For Contractors</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Browse available tenders</li>
                  <li>Submit competitive bids</li>
                  <li>Complete project milestones</li>
                  <li>Receive automated payments</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;