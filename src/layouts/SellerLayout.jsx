import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { LayoutDashboard, ShoppingBag, Package, BarChart3, Wallet, Sparkles, Settings, LogOut, Store, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SellerLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="kl-root">
      <Navbar />
      
      <div style={{ display: 'flex', minHeight: '100vh', paddingTop: '72px' }}>
        {/* Modern Glass Sidebar */}
        <aside style={{ 
          width: '280px', 
          background: 'rgba(255, 255, 255, 0.02)', 
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--border)',
          padding: '2.5rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: 'calc(100vh - 72px)',
          overflowY: 'auto'
        }} className="desktop-only">
          
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }}></div>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: '800', color: 'var(--text-light)' }}>Partner Portal</span>
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '900' }}>Seller Central</h2>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            {[
              { to: '/seller-dashboard', icon: LayoutDashboard, label: 'Market Overview', end: true },
              { to: '/seller-dashboard/products', icon: Package, label: 'Inventory' },
              { to: '/seller-dashboard/orders', icon: ShoppingBag, label: 'Orders' },
              { to: '/seller-dashboard/analytics', icon: BarChart3, label: 'Analytics' },
              { to: '/seller-dashboard/ai', icon: Sparkles, label: 'AI Merchant' },
              { to: '/seller-dashboard/wallet', icon: Wallet, label: 'Payments' },
            ].map(link => (
              <NavLink 
                key={link.to} 
                to={link.to} 
                end={link.end}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.8rem 1.2rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? 'var(--text)' : 'var(--text-muted)',
                  background: isActive ? 'var(--bg-secondary)' : 'transparent',
                  transition: 'all 0.2s'
                })}
              >
                <link.icon size={18} /> {link.label}
              </NavLink>
            ))}
          </nav>

          <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <button onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', padding: '0.8rem 1.2rem', color: 'var(--text-muted)', background: 'none', border: 'none', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left' }}>
              <Settings size={18} /> Shop Settings
            </button>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', padding: '0.8rem 1.2rem', color: '#ef4444', background: 'none', border: 'none', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left' }}>
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ 
          flex: 1, 
          marginLeft: '280px', 
          padding: '3rem 4rem',
          minHeight: 'calc(100vh - 72px)',
          background: 'var(--bg)'
        }} className="mobile-full-width">
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .desktop-only { display: none !important; }
          .mobile-full-width { margin-left: 0 !important; padding: 2rem 1.5rem !important; }
        }
      `}</style>
    </div>
  );
};

export default SellerLayout;
