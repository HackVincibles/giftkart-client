import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Gift } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-light)',
      height: '70px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Gift color="var(--accent-primary)" size={28} />
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
          Gift<span className="text-gradient">Kart</span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                background: 'rgba(139, 92, 246, 0.2)',
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex'
              }}>
                <UserIcon size={20} color="var(--accent-primary)" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.displayName || user.name || 'User'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {user.email} • {user.role}
                </span>
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
