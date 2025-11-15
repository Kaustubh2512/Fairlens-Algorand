import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tenders from './pages/Tenders';
import CreateTender from './pages/CreateTender';
import TenderDetail from './pages/TenderDetail';
import NFTManagement from './pages/NFTManagement';
import PeraWalletShowcase from './pages/PeraWalletShowcase';
import PeraTransactionTest from './pages/PeraTransactionTest';
import PeraWalletCompleteDemo from './pages/PeraWalletCompleteDemo';
import PeraWalletTest from './pages/PeraWalletTest';
import PeraWalletReact18Demo from './pages/PeraWalletReact18Demo';
import PeraWalletDocumentation from './pages/PeraWalletDocumentation';
import { authService } from './services/authService';

// Simple authentication check component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public route that redirects authenticated users to dashboard
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pera-showcase" element={<PeraWalletShowcase />} />
        <Route path="/pera-transaction-test" element={<PeraTransactionTest />} />
        <Route path="/pera-complete-demo" element={<PeraWalletCompleteDemo />} />
        <Route path="/pera-test" element={<PeraWalletTest />} />
        <Route path="/pera-react18-demo" element={<PeraWalletReact18Demo />} />
        <Route path="/pera-documentation" element={<PeraWalletDocumentation />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
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
          path="/tenders/create" 
          element={
            <ProtectedRoute>
              <CreateTender />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tenders/:id" 
          element={
            <ProtectedRoute>
              <TenderDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/contracts/:contractId/nft" 
          element={
            <ProtectedRoute>
              <NFTManagement />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;