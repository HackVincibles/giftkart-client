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
    <div className="kl-admin-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ display: 'flex', flex: 1, marginTop: '80px' }}>
        {/* Modern Admin Sidebar */}
        <aside className="kl-admin-sidebar">
          <div className="sidebar-brand">
            <Shield size={24} color="var(--accent)" />
            <div className="brand-text">
                <span className="platform-name">GiftKart</span>
                <span className="panel-label">ADMIN CONSOLE</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <div className="link-content">
                    <Icon size={20} className="nav-icon" />
                    <span>{label}</span>
                </div>
                <div className="active-indicator"></div>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="user-info">
                <div className="admin-badge">SYSTEM ADMIN</div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="kl-admin-main" style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
          <div className="admin-container animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        .kl-admin-sidebar {
            width: 280px;
            background: var(--bg-secondary);
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            position: sticky;
            top: 80px;
            height: calc(100vh - 80px);
            z-index: 100;
            transition: all 0.3s ease;
        }

        .sidebar-brand {
            padding: 2.5rem 2rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            border-bottom: 1px solid var(--border);
        }

        .brand-text {
            display: flex;
            flex-direction: column;
        }

        .platform-name {
            font-weight: 900;
            font-size: 1.1rem;
            letter-spacing: -0.5px;
        }

        .panel-label {
            font-size: 0.65rem;
            font-weight: 800;
            color: var(--accent);
            letter-spacing: 0.1em;
        }

        .sidebar-nav {
            padding: 1.5rem 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            flex: 1;
        }

        .sidebar-link {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.9rem 1.25rem;
            border-radius: 12px;
            color: var(--text-muted);
            transition: all 0.3s ease;
            font-weight: 600;
            font-size: 0.9rem;
        }

        .sidebar-link:hover {
            background: var(--bg-tertiary);
            color: var(--text);
            transform: translateX(5px);
        }

        .sidebar-link.active {
            background: var(--text);
            color: var(--bg);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        .link-content {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .nav-icon {
            transition: transform 0.3s ease;
        }

        .sidebar-link.active .nav-icon {
            transform: scale(1.1);
        }

        .active-indicator {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: var(--accent);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .sidebar-link.active .active-indicator {
            opacity: 1;
        }

        .sidebar-footer {
            padding: 1.5rem;
            border-top: 1px solid var(--border);
        }

        .admin-badge {
            background: var(--accent)15;
            color: var(--accent);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.7rem;
            font-weight: 900;
            text-align: center;
            letter-spacing: 0.05em;
        }

        .admin-container {
            max-width: 1400px;
            margin: 0 auto;
            width: 100%;
        }

        @media (max-width: 1024px) {
            .kl-admin-sidebar {
                width: 80px;
            }
            .sidebar-link span, .brand-text, .admin-badge {
                display: none;
            }
            .sidebar-brand, .sidebar-nav, .sidebar-link {
                justify-content: center;
                padding: 1rem;
            }
            .link-content {
                gap: 0;
            }
        }
      `}</style>
    </div>
  );
};


export default AdminLayout;
