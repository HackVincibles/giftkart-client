import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import CreatorDashboard from './pages/CreatorDashboard';

// Creator Layout & Pages
import CreatorLayout from './layouts/CreatorLayout';
import CreatorDashboardHome from './pages/creator/CreatorDashboardHome';
import CreatorProducts from './pages/creator/CreatorProducts';
import AddProduct from './pages/creator/AddProduct';

import AIChat from './pages/AIChat';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import UserProfile from './pages/UserProfile';

import AutoGifting from './pages/AutoGifting';
import MyOrders from './pages/MyOrders';
import OrderTracking from './pages/OrderTracking';
import GiftingAI from './pages/GiftingAI';

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
      <Route path="/creator-dashboard" element={
        <ProtectedRoute allowedRoles={['creator']}>
          <CreatorLayout />
        </ProtectedRoute>
      }>
        <Route index element={<CreatorDashboardHome />} />
        <Route path="products" element={<CreatorProducts />} />
        <Route path="products/add" element={<AddProduct />} />
      </Route>

      {/* Buyer Routes */}
      <Route path="/buyer-dashboard/*" element={
        <ProtectedRoute allowedRoles={['buyer']}>
          <BuyerDashboard />
        </ProtectedRoute>
      } />
      
      {/* AI Routes */}
      <Route path="/ai-chat" element={
        <ProtectedRoute allowedRoles={['buyer']}>
          <AIChat />
        </ProtectedRoute>
      } />
      
      {/* Shopping Routes */}
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/cart" element={
        <ProtectedRoute allowedRoles={['buyer']}>
          <Cart />
        </ProtectedRoute>
      } />
      
      {/* Profile Route */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      } />

      {/* Auto-Gifting Route */}
      <Route path="/auto-gifting" element={
        <ProtectedRoute allowedRoles={['buyer']}>
          <AutoGifting />
        </ProtectedRoute>
      } />
      <Route path="/gifting-ai" element={
        <ProtectedRoute allowedRoles={['buyer']}>
          <GiftingAI />
        </ProtectedRoute>
      } />
      
      {/* Other placeholders for NavLinks */}
      <Route path="/orders" element={
        <ProtectedRoute allowedRoles={['buyer']}>
          <MyOrders />
        </ProtectedRoute>
      } />
      <Route path="/tracking/:id" element={
        <ProtectedRoute allowedRoles={['buyer']}>
          <OrderTracking />
        </ProtectedRoute>
      } />
      <Route path="/wishlist" element={<DummyPage title="Wishlist" />} />
      <Route path="/wallet" element={<DummyPage title="Wallet" />} />
    </Routes>
  );
};

function App() {
  // Using a dummy client ID if not provided in env. For production, this should be in .env
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '1234567890-dummy.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <Router>
              <AppRoutes />
            </Router>
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
