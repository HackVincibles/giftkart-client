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
import AdminLayout from './layouts/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSellers from './pages/admin/AdminSellers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminGrievances from './pages/admin/AdminGrievances';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import AdminWalletPage from './pages/admin/AdminWallet';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import BuyerDashboard from './pages/BuyerDashboard';
import CreatorDashboard from './pages/CreatorDashboard';
import SellerLogin from './pages/SellerLogin';
import SellerRegister from './pages/SellerRegister';

// Seller Layout & Pages (Phase 1)
import SellerLayout from './layouts/SellerLayout';
import SellerDashboardHome from './pages/seller/SellerDashboardHome';
import SellerProducts from './pages/seller/SellerProducts';
import SellerOrders from './pages/seller/SellerOrders';
import SellerAnalytics from './pages/seller/SellerAnalytics';
import SellerAI from './pages/seller/SellerAI';
import SellerSettings from './pages/seller/SellerSettings';
import SellerWallet from './pages/seller/SellerWallet';

// Creator Layout & Pages
import CreatorLayout from './layouts/CreatorLayout';
import CreatorProducts from './pages/creator/CreatorProducts';
import AddProduct from './pages/creator/AddProduct';
import CreatorOrders from './pages/creator/CreatorOrders';
import CreatorWallet from './pages/creator/CreatorWallet';
import EditProduct from './pages/creator/EditProduct';
import CreatorAI from './pages/creator/CreatorAI';
import CreatorDashboardHome from './pages/creator/CreatorDashboardHome';


import AIChat from './pages/AIChat';
import GiftingAI from './pages/GiftingAI';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import UserProfile from './pages/UserProfile';

import AutoGifting from './pages/AutoGifting';
import MyOrders from './pages/MyOrders';
import OrderTracking from './pages/OrderTracking';

import Wishlist from './pages/Wishlist';
import SocialWishlist from './pages/SocialWishlist';
import PublicWishlist from './pages/PublicWishlist';

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
      <Route path="/seller-login" element={<SellerLogin />} />
      <Route path="/seller-register" element={<SellerRegister />} />
      
      {/* Redirect /admin → /admin-dashboard for backwards compatibility */}
      <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
      <Route path="/admin/*" element={<Navigate to="/admin-dashboard" replace />} />

      {/* Admin Routes */}
      <Route path="/admin-dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="sellers" element={<AdminSellers />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="grievances" element={<AdminGrievances />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="wallet" element={<AdminWalletPage />} />
        <Route path="withdrawals" element={<AdminWithdrawals />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      
      {/* Creator Routes */}
      <Route path="/creator-dashboard" element={
        <ProtectedRoute allowedRoles={['creator', 'seller']}>
          <CreatorLayout />
        </ProtectedRoute>
      }>
        <Route index element={<CreatorDashboardHome />} />
        <Route path="products" element={<CreatorProducts />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:productId" element={<EditProduct />} />
        <Route path="orders" element={<CreatorOrders />} />
        <Route path="wallet" element={<CreatorWallet />} />
        <Route path="ai" element={<CreatorAI />} />
      </Route>

        {/* Seller Routes */}
        <Route path="/seller-dashboard/*" element={
          <ProtectedRoute allowedRoles={['seller']}>
            <SellerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<SellerDashboardHome />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="analytics" element={<SellerAnalytics />} />
          <Route path="wallet" element={<SellerWallet />} />
          <Route path="ai" element={<SellerAI />} />
          <Route path="settings" element={<SellerSettings />} />
        </Route>

      {/* AI Routes */}
      <Route path="/ai-chat" element={
        <ProtectedRoute allowedRoles={['buyer']}>
          <AIChat />
        </ProtectedRoute>
      } />
      
      <Route path="/gifting-ai" element={
        <ProtectedRoute allowedRoles={['buyer']}>
          <GiftingAI />
        </ProtectedRoute>
      } />
      
      <Route path="/buyer-dashboard/*" element={
        <ProtectedRoute allowedRoles={['buyer']}>
          <BuyerDashboard />
        </ProtectedRoute>
      } />
      
      {/* Shopping Routes */}
      <Route path="/wishlist/:wishlistId" element={<PublicWishlist />} />
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
      <Route path="/wishlist" element={
        <ProtectedRoute allowedRoles={['buyer']}>
          <Wishlist />
        </ProtectedRoute>
      } />
      <Route path="/social-wishlist" element={
        <ProtectedRoute allowedRoles={['buyer']}>
          <SocialWishlist />
        </ProtectedRoute>
      } />
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
