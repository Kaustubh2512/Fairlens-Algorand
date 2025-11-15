import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tenderService, Tender, Application } from '../services/tenderService';
import { authService } from '../services/authService';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'sonner';

const TenderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [tender, setTender] = useState<Tender | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  
  const [applicationData, setApplicationData] = useState({
    bid_amount: 0,
    proposal_link: '',
    technical_proposal: '',
    timeline_months: 6
  });
  
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationErrors, setApplicationErrors] = useState<Record<string, string>>({});
  
  const { isConnected } = useWallet();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [tenderData, userData] = await Promise.all([
          tenderService.getTender(Number(id)),
          authService.getProfile()
        ]);
        
        setTender(tenderData);
        setUser(userData);
        
        // Load applications if user is government
        if (userData.role === 'government' && userData.id === tenderData.gov_id) {
          const appData = await tenderService.getTenderApplications(Number(id));
          setApplications(appData);
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load tender details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  const handleApply = async () => {
    if (!id || !tender) return;
    
    // Validate application form
    const errors: Record<string, string> = {};
    if (applicationData.bid_amount <= 0) {
      errors.bid_amount = 'Bid amount must be greater than 0';
    }
    
    setApplicationErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setIsApplying(true);
    
    try {
      await tenderService.applyToTender({
        tender_id: Number(id),
        ...applicationData
      });
      
      toast.success('Application submitted successfully!');
      setShowApplicationForm(false);
      
      // Refresh applications if user is government
      if (user?.role === 'government' && user?.id === tender.gov_id) {
        const appData = await tenderService.getTenderApplications(Number(id));
        setApplications(appData);
      }
    } catch (err: any) {
      console.error('Error submitting application:', err);
      toast.error(err.response?.data?.detail || 'Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  const handleAcceptApplication = async (applicationId: number) => {
    try {
      const updatedApp = await tenderService.acceptApplication(applicationId);
      
      // Update the application in state
      setApplications(prev => 
        prev.map(app => app.id === applicationId ? updatedApp : app)
      );
      
      toast.success('Application accepted!');
    } catch (err: any) {
      console.error('Error accepting application:', err);
      toast.error(err.response?.data?.detail || 'Failed to accept application');
    }
  };

  const handleRejectApplication = async (applicationId: number) => {
    try {
      const updatedApp = await tenderService.rejectApplication(applicationId);
      
      // Update the application in state
      setApplications(prev => 
        prev.map(app => app.id === applicationId ? updatedApp : app)
      );
      
      toast.success('Application rejected!');
    } catch (err: any) {
      console.error('Error rejecting application:', err);
      toast.error(err.response?.data?.detail || 'Failed to reject application');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tender details...</p>
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
            <h3 className="text-xl font-medium text-gray-900 mb-2">Error Loading Tender</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/tenders')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              Back to Tenders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto bg-yellow-100 text-yellow-600 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Tender Not Found</h3>
            <p className="text-gray-600 mb-6">The tender you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/tenders')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              Back to Tenders
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
                onClick={() => navigate('/tenders')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Tender Details</h1>
            </div>
            
            {user?.role === 'contractor' && tender.status === 'active' && (
              <button
                onClick={() => setShowApplicationForm(!showApplicationForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                {showApplicationForm ? 'Cancel Application' : 'Apply for Tender'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">{tender.title}</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">{tender.description}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                tender.status === 'active' ? 'bg-green-100 text-green-800' :
                tender.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                tender.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tender.location}</dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tender.category}</dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Budget</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">₹{tender.budget.toLocaleString()}</dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Deadline</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(tender.deadline).toLocaleDateString()} 
                  <span className="ml-2 text-gray-500">
                    ({Math.ceil((new Date(tender.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining)
                  </span>
                </dd>
              </div>
              
              {tender.start_date && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(tender.start_date).toLocaleDateString()}
                  </dd>
                </div>
              )}
              
              {tender.duration_months && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Duration</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {tender.duration_months} months
                  </dd>
                </div>
              )}
              
              {tender.technical_specs && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Technical Specifications</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-wrap">
                    {tender.technical_specs}
                  </dd>
                </div>
              )}
              
              {tender.quality_standards && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Quality Standards</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-wrap">
                    {tender.quality_standards}
                  </dd>
                </div>
              )}
              
              {tender.blockchain_hash && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Blockchain Hash</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
                    {tender.blockchain_hash.substring(0, 10)}...{tender.blockchain_hash.substring(tender.blockchain_hash.length - 10)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Application Form */}
        {user?.role === 'contractor' && tender.status === 'active' && showApplicationForm && (
          <div className="mt-6 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Apply for this Tender</h3>
              <div className="mt-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="bid_amount" className="block text-sm font-medium text-gray-700">
                    Bid Amount (INR)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      name="bid_amount"
                      id="bid_amount"
                      value={applicationData.bid_amount}
                      onChange={(e) => setApplicationData({...applicationData, bid_amount: Number(e.target.value)})}
                      className={`block w-full pl-7 rounded-md border ${
                        applicationErrors.bid_amount ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                      placeholder="1000000"
                    />
                  </div>
                  {applicationErrors.bid_amount && <p className="mt-1 text-sm text-red-600">{applicationErrors.bid_amount}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="timeline_months" className="block text-sm font-medium text-gray-700">
                    Proposed Timeline (months)
                  </label>
                  <input
                    type="number"
                    name="timeline_months"
                    id="timeline_months"
                    value={applicationData.timeline_months}
                    onChange={(e) => setApplicationData({...applicationData, timeline_months: Number(e.target.value)})}
                    min="1"
                    max="120"
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="proposal_link" className="block text-sm font-medium text-gray-700">
                    Proposal Document Link
                  </label>
                  <input
                    type="url"
                    name="proposal_link"
                    id="proposal_link"
                    value={applicationData.proposal_link}
                    onChange={(e) => setApplicationData({...applicationData, proposal_link: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="https://example.com/proposal.pdf"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="technical_proposal" className="block text-sm font-medium text-gray-700">
                    Technical Proposal
                  </label>
                  <textarea
                    name="technical_proposal"
                    id="technical_proposal"
                    rows={4}
                    value={applicationData.technical_proposal}
                    onChange={(e) => setApplicationData({...applicationData, technical_proposal: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Describe your technical approach, methodology, and implementation plan..."
                  />
                </div>
              </div>
              
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
                        <p>Please connect your wallet to submit your application. This will be used for contract deployment.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={isApplying || !isConnected}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isApplying ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Applications Section (Government only) */}
        {user?.role === 'government' && user?.id === tender.gov_id && (
          <div className="mt-6 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Applications ({applications.length})</h3>
              
              {applications.length === 0 ? (
                <div className="mt-4 text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Contractors haven't applied for this tender yet.
                  </p>
                </div>
              ) : (
                <div className="mt-4 flow-root">
                  <ul className="divide-y divide-gray-200">
                    {applications.map((application) => (
                      <li key={application.id} className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                Application #{application.id}
                              </div>
                              <div className="text-sm text-gray-500">
                                Bid Amount: ₹{application.bid_amount.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                Timeline: {application.timeline_months} months
                              </div>
                              {application.proposal_link && (
                                <div className="text-sm text-blue-600 hover:underline">
                                  <a href={application.proposal_link} target="_blank" rel="noopener noreferrer">
                                    View Proposal Document
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                            
                            {application.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleAcceptApplication(application.id)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRejectApplication(application.id)}
                                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {application.technical_proposal && (
                          <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200">
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">
                              {application.technical_proposal}
                            </p>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TenderDetail;