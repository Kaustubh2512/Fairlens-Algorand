import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './types';

// Layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Transparency from './pages/Transparency';

// Protected pages
import Dashboard from './pages/Dashboard';
import Tenders from './pages/Tenders';
import TenderDetails from './pages/TenderDetails';
import MyContracts from './pages/MyContracts';
import ContractDetails from './pages/ContractDetails';
import VerifyMilestone from './pages/VerifyMilestone';
import AdminPanel from './pages/AdminPanel';
import NFTDashboard from './pages/NFTDashboard';

type UserRoleType = 'landing' | 'government' | 'contractor' | 'citizen';

export default function App() {
  const [, setCurrentRole] = useState<UserRoleType>('landing');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole') as UserRoleType;
    
    if (token && userRole) {
      setCurrentRole(userRole);
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <WalletProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/transparency" element={<Transparency />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tenders" 
                element={
                  <ProtectedRoute>
                    <Tenders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tenders/:id" 
                element={
                  <ProtectedRoute>
                    <TenderDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-contracts" 
                element={
                  <ProtectedRoute requiredRole={UserRole.CONTRACTOR}>
                    <MyContracts />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/contracts/:id" 
                element={
                  <ProtectedRoute>
                    <ContractDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/verify-milestone/:id" 
                element={
                  <ProtectedRoute requiredRole={UserRole.GOVERNMENT}>
                    <VerifyMilestone />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole={UserRole.GOVERNMENT}>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/nft-dashboard" 
                element={
                  <ProtectedRoute>
                    <NFTDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Legacy routes - kept for backward compatibility */}
              <Route 
                path="/government" 
                element={
                  <ProtectedRoute requiredRole={UserRole.GOVERNMENT}>
                    <Navigate to="/admin" replace />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/contractor" 
                element={
                  <ProtectedRoute requiredRole={UserRole.CONTRACTOR}>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/citizen" 
                element={
                  <ProtectedRoute requiredRole={UserRole.CITIZEN}>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                } 
              />
              
              {/* Unauthorized and catch-all routes */}
              <Route 
                path="/unauthorized" 
                element={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
                      <p className="text-gray-600 mb-4">
                        You don't have permission to access this page.
                      </p>
                      <button 
                        onClick={() => window.history.back()}
                        className="text-blue-600 hover:underline"
                      >
                        Go back
                      </button>
                    </div>
                  </div>
                } 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </WalletProvider>
  );
}