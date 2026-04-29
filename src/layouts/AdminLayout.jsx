import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { LayoutDashboard, Users, Store, ShoppingBag, MessageSquare, BarChart2, Settings, Shield, Wallet, Banknote } from 'lucide-react';

const navItems = [
  { to: '/admin-dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin-dashboard/users', icon: Users, label: 'Users' },
  { to: '/admin-dashboard/sellers', icon: Store, label: 'Sellers' },
  { to: '/admin-dashboard/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin-dashboard/grievances', icon: MessageSquare, label: 'Grievances' },
  { to: '/admin-dashboard/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/admin-dashboard/wallet', icon: Wallet, label: 'Admin Wallet' },
  { to: '/admin-dashboard/withdrawals', icon: Banknote, label: 'Withdrawals' },
  { to: '/admin-dashboard/settings', icon: Settings, label: 'Settings' },
];


const AdminLayout = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* Fixed Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header desktop-only">
          <Shield size={18} color="var(--accent-primary)" />
          <span className="sidebar-title">Admin Panel</span>
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
      </aside>

      {/* Scrollable main content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};


export default AdminLayout;
