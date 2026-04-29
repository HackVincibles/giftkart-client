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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{
          width: '240px', minWidth: '240px', background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-light)', display: 'flex',
          flexDirection: 'column', padding: '1.5rem 1rem', overflowY: 'auto', height: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', marginBottom: '1.5rem' }}>
            <Shield size={18} color="var(--accent-primary)" />
            <span style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Seller Panel</span>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                borderRadius: '10px', textDecoration: 'none', fontSize: '0.9rem',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                transition: 'all 0.2s ease'
              })}>
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        {/* Main Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: 'var(--bg-primary)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
