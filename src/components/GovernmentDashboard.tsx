import React from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { Link } from 'react-router-dom';

const GovernmentDashboard: React.FC = () => {
  const { activeAddress } = useWallet();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Government Dashboard</h1>
          <p className="text-gray-600">
            Manage tenders and oversee construction projects
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Welcome, Government Official</h2>
            {activeAddress && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Connected: {activeAddress.substring(0, 6)}...{activeAddress.substring(activeAddress.length - 4)}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-medium mb-2">Create New Tender</h3>
              <p className="text-gray-600 mb-4">
                Publish a new government tender
              </p>
              <Link 
                to="/tenders/create" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Create Tender
              </Link>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-medium mb-2">Manage Tenders</h3>
              <p className="text-gray-600 mb-4">
                Review applications and select contractors
              </p>
              <Link 
                to="/tenders" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                View Tenders
              </Link>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-medium mb-2">Project Oversight</h3>
              <p className="text-gray-600 mb-4">
                Monitor project progress and payments
              </p>
              <button className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                View Projects
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Recent Tenders</h2>
            <div className="text-center py-8 text-gray-500">
              <p>No recent tenders to display</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Pending Applications</h2>
            <div className="text-center py-8 text-gray-500">
              <p>No pending applications to review</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernmentDashboard;