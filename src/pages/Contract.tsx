import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contractService, Milestone } from '../services/contractService';
import type { Contract } from '../services/contractService';
import { blockchainService } from '../services/blockchainService';
import { useWallet } from '@txnlab/use-wallet-react';
import { toast } from 'sonner';

const Contract: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  const { activeAddress } = useWallet();
  
  // Form states for milestone actions
  const [proofHash, setProofHash] = useState('');
  const [verifyingMilestone, setVerifyingMilestone] = useState<number | null>(null);
  const [releasingPayment, setReleasingPayment] = useState<number | null>(null);

  useEffect(() => {
    const loadContractData = async () => {
      if (!id) return;
      
      try {
        // Load user data
        const userData = await fetch('/api/auth/profile').then(res => res.json());
        setUser(userData);
        
        const contractData = await contractService.getContract(Number(id));
        setContract(contractData);
        
        const milestoneData = await contractService.getMilestones(Number(id));
        setMilestones(milestoneData);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load contract data');
      } finally {
        setLoading(false);
      }
    };

    loadContractData();
  }, [id]);

  const handleViewOnAlgoExplorer = (appId?: number) => {
    if (appId) {
      const url = `https://testnet.algoexplorer.io/application/${appId}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contract details...</p>
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
            <h3 className="text-xl font-medium text-gray-900 mb-2">Error Loading Contract</h3>
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

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">Contract Not Found</h3>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Go Back
          </button>
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
              <h1 className="text-xl font-bold text-gray-900">Contract #{contract.id}</h1>
            </div>
            
            <div className="flex space-x-2">
              {contract.app_id && (
                <button
                  onClick={() => handleViewOnAlgoExplorer(contract.app_id)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Smart Contract
                </button>
              )}
              
              <button
                onClick={() => navigate(`/contracts/${contract.id}/nft`)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Manage NFT
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contract Overview */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Contract Overview</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Details</h3>
                <dl className="grid grid-cols-1 gap-4">
                  <div className="border-b border-gray-100 pb-4">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        contract.status === 'active' ? 'bg-green-100 text-green-800' :
                        contract.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                      </span>
                    </dd>
                  </div>
                  <div className="border-b border-gray-100 pb-4">
                    <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                    <dd className="mt-1 text-sm text-gray-900">₹{contract.total_amount.toLocaleString()}</dd>
                  </div>
                  <div className="border-b border-gray-100 pb-4">
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(contract.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Blockchain Information</h3>
                <dl className="grid grid-cols-1 gap-4">
                  <div className="border-b border-gray-100 pb-4">
                    <dt className="text-sm font-medium text-gray-500">Smart Contract</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {contract.app_id ? (
                        <span className="font-mono text-blue-600">
                          App ID: {contract.app_id}
                        </span>
                      ) : (
                        <span className="text-gray-500">Not deployed</span>
                      )}
                    </dd>
                  </div>
                  <div className="border-b border-gray-100 pb-4">
                    <dt className="text-sm font-medium text-gray-500">Application Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {contract.app_address ? (
                        <span className="font-mono break-all text-xs">
                          {contract.app_address}
                        </span>
                      ) : (
                        <span className="text-gray-500">Not available</span>
                      )}
                    </dd>
                  </div>
                  {contract.nft_id && (
                    <div className="border-b border-gray-100 pb-4">
                      <dt className="text-sm font-medium text-gray-500">NFT Asset</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <span className="font-mono text-blue-600">
                          Asset ID: {contract.nft_id}
                        </span>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
            
            {activeAddress && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Connected Wallet</h3>
                    <div className="mt-1 text-sm text-blue-700">
                      <p className="font-mono text-xs break-all">{activeAddress}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Milestones</h2>
          </div>
          <div className="p-6">
            {milestones.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No milestones</h3>
                <p className="mt-1 text-sm text-gray-500">
                  This contract doesn't have any milestones yet.
                </p>
              </div>
            ) : (
              <div className="flow-root">
                <ul className="divide-y divide-gray-200">
                  {milestones.map((milestone, index) => (
                    <li key={milestone.id} className="py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            milestone.status === 'paid' ? 'bg-green-100' :
                            milestone.status === 'verified' ? 'bg-blue-100' :
                            milestone.status === 'completed' ? 'bg-yellow-100' :
                            'bg-gray-100'
                          }`}>
                            <span className={`text-sm font-medium ${
                              milestone.status === 'paid' ? 'text-green-800' :
                              milestone.status === 'verified' ? 'text-blue-800' :
                              milestone.status === 'completed' ? 'text-yellow-800' :
                              'text-gray-800'
                            }`}>
                              {index + 1}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {milestone.title}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                milestone.status === 'paid' ? 'bg-green-100 text-green-800' :
                                milestone.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                                milestone.status === 'completed' ? 'bg-yellow-100 text-yellow-800' :
                                milestone.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {milestone.status.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                            <div className="flex items-center text-sm text-gray-500">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              ₹{milestone.amount.toLocaleString()}
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <time dateTime={milestone.deadline}>
                                Due: {new Date(milestone.deadline).toLocaleDateString()}
                              </time>
                            </div>
                          </div>
                          {milestone.proof_hash && (
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              <span className="font-mono text-xs truncate">{milestone.proof_hash}</span>
                            </div>
                          )}
                          
                          {/* Milestone Actions */}
                          <div className="mt-3 flex space-x-2">
                            {/* Contractor Actions */}
                            {user?.role === 'contractor' && contract?.contractor_id === user?.id && (
                              <>
                                {milestone.status === 'pending' && (
                                  <button
                                    onClick={() => {
                                      const hash = prompt('Enter proof hash:');
                                      if (hash) {
                                        setProofHash(hash);
                                        // In a real implementation, you would submit the proof to the backend
                                        toast.success('Proof submitted successfully!');
                                        // Update milestone status locally
                                        setMilestones(prev => prev.map(m => 
                                          m.id === milestone.id ? {...m, status: 'completed', proof_hash: hash} : m
                                        ));
                                      }
                                    }}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                  >
                                    Submit Proof
                                  </button>
                                )}
                              </>
                            )}
                            
                            {/* Government Actions */}
                            {user?.role === 'government' && contract?.gov_id === user?.id && (
                              <>
                                {milestone.status === 'completed' && (
                                  <button
                                    onClick={async () => {
                                      setVerifyingMilestone(milestone.id);
                                      try {
                                        // In a real implementation, you would call the backend API
                                        // await contractService.verifyMilestone({
                                        //   milestone_id: milestone.id,
                                        //   signature: '', // Would be generated by signing
                                        //   message: '', // Verification message
                                        //   proof_hash: milestone.proof_hash || ''
                                        // });
                                        
                                        // Update milestone status locally
                                        setMilestones(prev => prev.map(m => 
                                          m.id === milestone.id ? {...m, status: 'verified'} : m
                                        ));
                                        toast.success('Milestone verified successfully!');
                                      } catch (err: any) {
                                        toast.error(err.response?.data?.detail || 'Failed to verify milestone');
                                      } finally {
                                        setVerifyingMilestone(null);
                                      }
                                    }}
                                    disabled={verifyingMilestone === milestone.id}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                  >
                                    {verifyingMilestone === milestone.id ? (
                                      <>
                                        <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying...
                                      </>
                                    ) : 'Verify'}
                                  </button>
                                )}
                                
                                {milestone.status === 'verified' && (
                                  <button
                                    onClick={async () => {
                                      setReleasingPayment(milestone.id);
                                      try {
                                        // In a real implementation, you would call the backend API
                                        // await contractService.releasePayment({
                                        //   milestone_id: milestone.id
                                        // });
                                        
                                        // Update milestone status locally
                                        setMilestones(prev => prev.map(m => 
                                          m.id === milestone.id ? {...m, status: 'paid'} : m
                                        ));
                                        toast.success('Payment released successfully!');
                                      } catch (err: any) {
                                        toast.error(err.response?.data?.detail || 'Failed to release payment');
                                      } finally {
                                        setReleasingPayment(null);
                                      }
                                    }}
                                    disabled={releasingPayment === milestone.id}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                                  >
                                    {releasingPayment === milestone.id ? (
                                      <>
                                        <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Releasing...
                                      </>
                                    ) : 'Release Payment'}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contract;