import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

const TestWalletInfo: React.FC = () => {
  const { accountAddress, isConnected, connectWallet, disconnectWallet, getBalance } = useWallet();
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Add log messages
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };
  
  useEffect(() => {
    addLog('TestWalletInfo component mounted');
    addLog(`Initial state - isConnected: ${isConnected}, accountAddress: ${accountAddress}`);
  }, []);
  
  const handleConnect = async () => {
    try {
      addLog('Attempting to connect wallet...');
      setError(null);
      await connectWallet();
      addLog('Wallet connection attempt completed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Connection failed: ${errorMessage}`);
      addLog(`Connection failed: ${errorMessage}`);
      console.error('Connection error:', err);
    }
  };
  
  const handleDisconnect = async () => {
    try {
      addLog('Attempting to disconnect wallet...');
      setError(null);
      await disconnectWallet();
      addLog('Wallet disconnection completed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Disconnection failed: ${errorMessage}`);
      addLog(`Disconnection failed: ${errorMessage}`);
      console.error('Disconnection error:', err);
    }
  };

  const handleGetBalance = async () => {
    try {
      addLog('Attempting to get balance...');
      setError(null);
      const balance = await getBalance();
      addLog(`Balance retrieved: ${balance} microAlgos`);
      alert(`Account balance: ${balance} microAlgos`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Balance check failed: ${errorMessage}`);
      addLog(`Balance check failed: ${errorMessage}`);
      console.error('Balance error:', err);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Wallet Test Information</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="mb-4">
        <h3 className="font-medium mb-2">Connection Status:</h3>
        <p className={isConnected ? "text-green-600" : "text-red-600"}>
          {isConnected ? "✅ Connected" : "❌ Not Connected"}
        </p>
        
        {accountAddress && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">Connected Account:</p>
            <p className="font-mono text-sm break-all bg-gray-100 p-2 rounded">
              {accountAddress}
            </p>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
          >
            Connect Pera Wallet
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
          >
            Disconnect Wallet
          </button>
        )}
        
        <button
          onClick={handleGetBalance}
          disabled={!isConnected}
          className={`px-4 py-2 rounded text-sm ${
            isConnected 
              ? "bg-blue-500 hover:bg-blue-600 text-white" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Get Balance
        </button>
      </div>
      
      <div className="mt-4">
        <h3 className="font-medium mb-2">Debug Logs:</h3>
        <div className="bg-gray-100 p-3 rounded max-h-40 overflow-y-auto">
          {logs.length > 0 ? (
            <ul className="text-xs font-mono">
              {logs.map((log, index) => (
                <li key={index} className="mb-1">{log}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No logs yet...</p>
          )}
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <h4 className="font-medium text-yellow-800 mb-2">Troubleshooting Tips:</h4>
        <ul className="text-sm text-yellow-700 list-disc pl-5 space-y-1">
          <li>Make sure Pera Wallet extension is installed and enabled</li>
          <li>Check browser console for errors (F12)</li>
          <li>Ensure you're using a supported browser (Chrome, Firefox, Brave)</li>
          <li>Verify Pera Wallet is configured for the correct network</li>
        </ul>
      </div>
    </div>
  );
};

export default TestWalletInfo;