import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { TrendingUp, ShoppingCart, Package, Sparkles, DollarSign, BarChart3 } from 'lucide-react';

const CreatorLayout = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* Fixed Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header desktop-only">
          <div className="pulse-dot"></div>
          <span className="sidebar-title">Creator Studio</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/creator-dashboard" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <TrendingUp size={20} /> <span>Overview</span>
          </NavLink>

          <NavLink to="/creator-dashboard/revenue" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <BarChart3 size={20} /> <span>Revenue & Sales</span>
          </NavLink>

          <NavLink to="/creator-dashboard/orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <ShoppingCart size={20} /> <span>Orders Queue</span>
          </NavLink>

          <NavLink to="/creator-dashboard/products" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Package size={20} /> <span>Products</span>
          </NavLink>

          <NavLink to="/creator-dashboard/ai" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Sparkles size={20} /> <span>AI Assistance</span>
          </NavLink>

          <NavLink to="/creator-dashboard/wallet" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <DollarSign size={20} /> <span>Earnings & Wallet</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer desktop-only">
          <div className="glass-panel" style={{ padding: '1rem', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Support</p>
            <button className="btn btn-secondary w-full" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>Help Center</button>
          </div>
        </div>
      </aside>

      {/* Scrollable main content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};


export default CreatorLayout;
