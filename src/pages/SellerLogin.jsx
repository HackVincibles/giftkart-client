import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Mail, Lock, AlertCircle, Briefcase } from 'lucide-react';

const SellerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { sellerLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const res = await sellerLogin(email, password);
    if (res.success) {
      navigate('/creator-dashboard');
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-mesh animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '3rem 2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '20px', color: 'var(--accent-primary)' }}>
                <Briefcase size={32} />
            </div>
          </div>
          
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Creator Login</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>
            Manage your artisanal studio and sales
          </p>
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Studio Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  className="input-field" 
                  style={{ width: '100%', paddingLeft: '2.5rem' }} 
                  placeholder="studio@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>
            
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Password</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  className="input-field" 
                  style={{ width: '100%', paddingLeft: '2.5rem' }} 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginBottom: '1.5rem' }} disabled={loading}>
              {loading ? 'Entering Studio...' : 'Access Studio'}
            </button>
          </form>
          
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', border: '1px solid var(--border-light)' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Want to become a creator? <Link to="/seller-register" style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>Join the community</Link>
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Are you a buyer? <Link to="/login" style={{ fontWeight: '600' }}>Switch to Buyer Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerLogin;
