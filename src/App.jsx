import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import CreatorDashboard from './pages/CreatorDashboard';

// Dummy components for other routes to prevent errors
const DummyPage = ({ title }) => (
  <div style={{ padding: '4rem', textAlign: 'center' }}>
    <h1>{title}</h1>
    <p>This page is under construction.</p>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      {/* Creator Routes */}
      <Route path="/creator-dashboard/*" element={
        <ProtectedRoute allowedRoles={['creator']}>
          <CreatorDashboard />
        </ProtectedRoute>
      } />

      {/* Buyer Routes */}
      <Route path="/buyer-dashboard/*" element={
        <ProtectedRoute allowedRoles={['buyer']}>
          <BuyerDashboard />
        </ProtectedRoute>
      } />
      
      {/* Other placeholders for NavLinks */}
      <Route path="/orders" element={<DummyPage title="My Orders" />} />
      <Route path="/auto-gifting" element={<DummyPage title="Auto-Gifting" />} />
      <Route path="/wishlist" element={<DummyPage title="Wishlist" />} />
      <Route path="/wallet" element={<DummyPage title="Wallet" />} />
      <Route path="/ai-chat" element={<DummyPage title="AI Gift Recommendations" />} />
    </Routes>
  );
};

function App() {
  // Using a dummy client ID if not provided in env. For production, this should be in .env
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '1234567890-dummy.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
