import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import WalletConnectButton from './WalletConnectButton';
import ConnectWallet from './ConnectWallet';

const Navbar: React.FC = () => {
  const [showWalletModal, setShowWalletModal] = useState(false);

  const toggleWalletModal = () => {
    setShowWalletModal(!showWalletModal);
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="bg-blue-600 text-white font-bold text-xl w-10 h-10 rounded-lg flex items-center justify-center">
                FL
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">FairLens</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link 
                to="/dashboard" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium text-gray-900"
              >
                Dashboard
              </Link>
              <Link 
                to="/tenders" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Tenders
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <WalletConnectButton />
          </div>
        </div>
      </div>
      <ConnectWallet openModal={showWalletModal} closeModal={toggleWalletModal} />
    </nav>
  );
};

export default Navbar;