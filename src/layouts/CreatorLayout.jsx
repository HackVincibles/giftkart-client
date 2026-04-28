import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { TrendingUp, ShoppingCart, Package, Sparkles, DollarSign } from 'lucide-react';

const CreatorLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <div className="dashboard-layout animate-fade-in">
        {/* Creator Sidebar */}
        <div className="sidebar" style={{ padding: '2rem 1rem' }}>
          <div style={{ marginBottom: '2rem', padding: '0 1rem' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Creator Studio
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <NavLink 
              to="/creator-dashboard" 
              end
              className={({ isActive }) => `btn ${isActive ? '' : 'btn-secondary'}`}
              style={({ isActive }) => ({
                background: isActive ? 'var(--accent-primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-secondary)',
                border: isActive ? 'none' : '1px solid transparent',
                textAlign: 'left', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                textDecoration: 'none'
              })}
            >
              <TrendingUp size={20} /> Dashboard
            </NavLink>
            <NavLink 
              to="/creator-dashboard/orders" 
              className={({ isActive }) => `btn ${isActive ? '' : 'btn-secondary'}`}
              style={({ isActive }) => ({
                background: isActive ? 'var(--accent-primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-secondary)',
                border: isActive ? 'none' : '1px solid transparent',
                textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none'
              })}
            >
              <ShoppingCart size={20} /> Orders Queue
            </NavLink>
            <NavLink 
              to="/creator-dashboard/products" 
              className={({ isActive }) => `btn ${isActive ? '' : 'btn-secondary'}`}
              style={({ isActive }) => ({
                background: isActive ? 'var(--accent-primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-secondary)',
                border: isActive ? 'none' : '1px solid transparent',
                textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none'
              })}
            >
              <Package size={20} /> Products
            </NavLink>
            <NavLink 
              to="/creator-dashboard/ai" 
              className={({ isActive }) => `btn ${isActive ? '' : 'btn-secondary'}`}
              style={({ isActive }) => ({
                background: isActive ? 'var(--accent-primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-secondary)',
                border: isActive ? 'none' : '1px solid transparent',
                textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none'
              })}
            >
              <Sparkles size={20} /> AI Assistance
            </NavLink>
            <NavLink 
              to="/creator-dashboard/wallet" 
              className={({ isActive }) => `btn ${isActive ? '' : 'btn-secondary'}`}
              style={({ isActive }) => ({
                background: isActive ? 'var(--accent-primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-secondary)',
                border: isActive ? 'none' : '1px solid transparent',
                textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none'
              })}
            >
              <DollarSign size={20} /> Earnings & Wallet
            </NavLink>
          </div>
        </div>

        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default CreatorLayout;
