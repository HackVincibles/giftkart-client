import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminOverview from './admin/AdminOverview';

// Placeholder components for other admin routes
const AdminUsers = () => <div className="glass-panel" style={{ padding: '2rem' }}><h2>User Management</h2><p>Coming soon...</p></div>;
const AdminSellers = () => <div className="glass-panel" style={{ padding: '2rem' }}><h2>Seller Approvals</h2><p>Coming soon...</p></div>;
const AdminOrders = () => <div className="glass-panel" style={{ padding: '2rem' }}><h2>All Orders</h2><p>Coming soon...</p></div>;
const AdminGrievances = () => <div className="glass-panel" style={{ padding: '2rem' }}><h2>Grievances</h2><p>Coming soon...</p></div>;
const AdminAnalytics = () => <div className="glass-panel" style={{ padding: '2rem' }}><h2>Platform Analytics</h2><p>Coming soon...</p></div>;
const AdminSettings = () => <div className="glass-panel" style={{ padding: '2rem' }}><h2>System Settings</h2><p>Coming soon...</p></div>;

const AdminDashboard = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="dashboard-layout animate-fade-in" style={{ display: 'flex', flex: 1 }}>
        <AdminSidebar />
        
        <main className="main-content" style={{ flex: 1, padding: '2rem', background: 'var(--bg-primary)' }}>
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="sellers" element={<AdminSellers />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="grievances" element={<AdminGrievances />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<Navigate to="/admin" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
