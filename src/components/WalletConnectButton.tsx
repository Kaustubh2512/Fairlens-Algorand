import React, { useState } from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { useWallet } from '@txnlab/use-wallet-react';

const WalletConnectButton: React.FC = () => {
  const { activeAddress } = useWallet();
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  if (activeAddress) {
    return (
      <div className="flex items-center space-x-2">
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          <Wallet className="h-4 w-4 inline mr-1" />
          {activeAddress.substring(0, 6)}...{activeAddress.substring(activeAddress.length - 4)}
        </div>
        <button
          onClick={toggleModal}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      <button
        onClick={toggleModal}
        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
      >
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </button>
    </div>
  );
};

export default WalletConnectButton;