import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { nftService } from '../services/nftService';
import { contractService } from '../services/contractService';
import type { NFT } from '../services/nftService';
import { useWallet } from '@txnlab/use-wallet-react';
import { toast } from 'sonner';

const NFTManagement: React.FC = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  
  const [nft, setNft] = useState<NFT | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minting, setMinting] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [burning, setBurning] = useState(false);
  
  const { activeAddress } = useWallet();
  
  // Form states
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!contractId) return;
      
      try {
        const contractData = await contractService.getContract(Number(contractId));
        setContract(contractData);
        
        // Check if NFT already exists for this contract
        if (contractData.nft_id) {
          try {
            const nftData = await nftService.getNFTByAssetId(contractData.nft_id);
            setNft(nftData);
          } catch (err) {
            // NFT might not be in our database but exists on chain
            console.log('NFT not found in database');
          }
        }
        
        // Set default values for NFT creation
        setNftName(`FairLens Contract #${contractId}`);
        setNftDescription(`NFT representing milestone payment for contract ${contractId}`);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load contract data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [contractId]);

  const handleMintNFT = async () => {
    if (!contractId || !activeAddress) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!nftName.trim() || !nftDescription.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setMinting(true);
    
    try {
      const newNft = await nftService.mintNFT({
        contract_id: Number(contractId),
        name: nftName,
        unit_name: 'FLNFT',
        description: nftDescription
      });
      
      setNft(newNft);
      toast.success('NFT minted successfully!');
    } catch (err: any) {
      console.error('Error minting NFT:', err);
      toast.error(err.response?.data?.detail || 'Failed to mint NFT');
    } finally {
      setMinting(false);
    }
  };

  const handleTransferNFT = async () => {
    if (!nft || !receiverAddress.trim()) {
      toast.error('Please enter receiver address');
      return;
    }
    
    if (!isConnected || !accountAddress) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setTransferring(true);
    
    try {
      const updatedNft = await nftService.transferNFT(nft.id, receiverAddress);
      setNft(updatedNft);
      toast.success('NFT transferred successfully!');
      setReceiverAddress('');
    } catch (err: any) {
      console.error('Error transferring NFT:', err);
      toast.error(err.response?.data?.detail || 'Failed to transfer NFT');
    } finally {
      setTransferring(false);
    }
  };

  const handleBurnNFT = async () => {
    if (!nft) return;
    
    if (!isConnected || !accountAddress) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!window.confirm('Are you sure you want to burn this NFT? This action cannot be undone.')) {
      return;
    }
    
    setBurning(true);
    
    try {
      const updatedNft = await nftService.burnNFT(nft.id);
      setNft(updatedNft);
      toast.success('NFT burned successfully!');
    } catch (err: any) {
      console.error('Error burning NFT:', err);
      toast.error(err.response?.data?.detail || 'Failed to burn NFT');
    } finally {
      setBurning(false);
    }
  };

  const handleViewOnAlgoExplorer = (assetId: number) => {
    const url = `https://testnet.algoexplorer.io/asset/${assetId}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading NFT details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto bg-red-100 text-red-600 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Error Loading NFT</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">NFT Management</h1>
            </div>
            
            {nft && nft.asset_id && (
              <button
                onClick={() => handleViewOnAlgoExplorer(nft.asset_id)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View on AlgoExplorer
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contract Info */}
        {contract && (
          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Contract #{contract.id}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{contract.status}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
                  <p className="mt-1 text-sm text-gray-900">₹{contract.total_amount.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(contract.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NFT Management */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">NFT Management</h2>
          </div>
          <div className="p-6">
            {!nft ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No NFT Created</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Mint an NFT for this contract to track milestone payments.
                </p>
                
                {!isConnected && (
                  <div className="mt-4 rounded-md bg-yellow-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Wallet Connection Required</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>Please connect your wallet to mint an NFT.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label htmlFor="nftName" className="block text-sm font-medium text-gray-700">
                      NFT Name
                    </label>
                    <input
                      type="text"
                      name="nftName"
                      id="nftName"
                      value={nftName}
                      onChange={(e) => setNftName(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="FairLens Contract #123"
                    />
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="nftDescription" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="nftDescription"
                      id="nftDescription"
                      rows={3}
                      value={nftDescription}
                      onChange={(e) => setNftDescription(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="NFT representing milestone payment for contract..."
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleMintNFT}
                    disabled={minting || !isConnected}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {minting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Minting...
                      </>
                    ) : (
                      'Mint NFT'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* NFT Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">NFT Details</h3>
                    <dl className="grid grid-cols-1 gap-4">
                      <div className="border-b border-gray-100 pb-4">
                        <dt className="text-sm font-medium text-gray-500">Asset ID</dt>
                        <dd className="mt-1 text-sm text-gray-900 font-mono">{nft.asset_id}</dd>
                      </div>
                      <div className="border-b border-gray-100 pb-4">
                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{nft.name}</dd>
                      </div>
                      <div className="border-b border-gray-100 pb-4">
                        <dt className="text-sm font-medium text-gray-500">Unit Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{nft.unit_name}</dd>
                      </div>
                      <div className="border-b border-gray-100 pb-4">
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            nft.status === 'minted' ? 'bg-green-100 text-green-800' :
                            nft.status === 'transferred' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {nft.status.charAt(0).toUpperCase() + nft.status.slice(1)}
                          </span>
                        </dd>
                      </div>
                      <div className="border-b border-gray-100 pb-4">
                        <dt className="text-sm font-medium text-gray-500">Created</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Date(nft.created_at).toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                    <div className="space-y-4">
                      {/* Transfer NFT */}
                      <div>
                        <label htmlFor="receiverAddress" className="block text-sm font-medium text-gray-700">
                          Transfer to Address
                        </label>
                        <div className="mt-1 flex">
                          <input
                            type="text"
                            name="receiverAddress"
                            id="receiverAddress"
                            value={receiverAddress}
                            onChange={(e) => setReceiverAddress(e.target.value)}
                            className="block w-full rounded-l-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Algorand address"
                          />
                          <button
                            type="button"
                            onClick={handleTransferNFT}
                            disabled={transferring || !isConnected}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {transferring ? 'Transferring...' : 'Transfer'}
                          </button>
                        </div>
                      </div>
                      
                      {/* Burn NFT */}
                      <div>
                        <button
                          type="button"
                          onClick={handleBurnNFT}
                          disabled={burning || !isConnected || nft.status === 'burned'}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          {burning ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Burning...
                            </>
                          ) : (
                            'Burn NFT'
                          )}
                        </button>
                        <p className="mt-2 text-xs text-gray-500">
                          Burning an NFT permanently removes it from circulation. This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Metadata */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Metadata</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="text-sm text-gray-900">
                      <p className="font-medium">Metadata URL:</p>
                      <p className="font-mono break-all text-blue-600 hover:underline cursor-pointer" 
                         onClick={() => nft.metadata_url && window.open(nft.metadata_url, '_blank')}>
                        {nft.metadata_url || 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NFTManagement;