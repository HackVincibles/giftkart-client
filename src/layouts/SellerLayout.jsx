import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { LayoutDashboard, Store, ShoppingBag, BarChart2, Settings, Shield, Sparkles } from 'lucide-react';

// Sidebar navigation items for sellers
const navItems = [
  { to: '/seller-dashboard', icon: LayoutDashboard, label: 'Home', end: true },
  { to: '/seller-dashboard/products', icon: Store, label: 'Products' },
  { to: '/seller-dashboard/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/seller-dashboard/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/seller-dashboard/wallet', icon: Shield, label: 'Wallet' },
  { to: '/seller-dashboard/ai', icon: Sparkles, label: 'AI Assistant' },
  { to: '/seller-dashboard/settings', icon: Settings, label: 'Settings' },
];

const SellerLayout = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* Fixed Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header desktop-only">
          <div className="pulse-dot"></div>
          <span className="sidebar-title">Seller Panel</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer desktop-only">
          <div className="glass-panel" style={{ padding: '1rem', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Status</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.8rem', fontWeight: '600' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}></div>
              Verified Seller
            </div>
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


export default SellerLayout;
