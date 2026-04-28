import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { ShoppingBag, Heart, Calendar, Wallet, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const BuyerDashboard = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <main className="container animate-fade-in" style={{ padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome, {user?.displayName}!</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Ready to find the perfect gift today?</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/ai-chat" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={18} /> Ask AI
            </Link>
          </div>
        </div>

        <div className="grid">
          <Link to="/orders" className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', transition: 'transform 0.3s', cursor: 'pointer' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShoppingBag color="#3b82f6" size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>My Orders</h3>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>Track, return, or buy again</p>
          </Link>

          <Link to="/auto-gifting" className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', transition: 'transform 0.3s', cursor: 'pointer' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Calendar color="var(--success)" size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Auto-Gifting Calendar</h3>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>Never miss an anniversary or birthday</p>
          </Link>

          <Link to="/wishlist" className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', transition: 'transform 0.3s', cursor: 'pointer' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Heart color="var(--danger)" size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Wishlist & Ideas</h3>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>Saved gifts and AI recommendations</p>
          </Link>

          <Link to="/wallet" className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', transition: 'transform 0.3s', cursor: 'pointer' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Wallet color="var(--accent-primary)" size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>My Wallet</h3>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>Balance: ₹500 • View transactions</p>
          </Link>
        </div>

        <div style={{ marginTop: '4rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart color="var(--danger)" /> Recommended For You
          </h2>
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>You haven't told us much about who you're buying for yet.</p>
            <button className="btn btn-secondary mt-4" style={{ marginTop: '1rem' }}>Start a Gift Profile</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuyerDashboard;
