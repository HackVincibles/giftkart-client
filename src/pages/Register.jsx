import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import Navbar from '../components/Navbar';
import { Mail, Lock, User, AlertCircle, Briefcase, ShoppingBag } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    role: 'buyer' // Default role
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = (role) => {
    if (role === 'admin') navigate('/admin-dashboard');
    else if (role === 'creator' || role === 'seller') navigate('/creator-dashboard');
    else navigate('/buyer-dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const res = await register(formData);
    if (res.success) {
      handleSuccess(res.role);
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const res = await googleLogin(credentialResponse.credential, formData.role);
    if (res.success) {
      handleSuccess(res.role);
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="bg-mesh animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '3rem 2.5rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>
            Join GiftKart and discover perfect gifts
          </p>
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label className="input-label">Select Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div 
                  onClick={() => setFormData({...formData, role: 'buyer'})}
                  style={{
                    padding: '1rem',
                    border: formData.role === 'buyer' ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)',
                    borderRadius: '8px',
                    background: formData.role === 'buyer' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(15, 23, 42, 0.6)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <ShoppingBag size={24} color={formData.role === 'buyer' ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                  <span style={{ fontWeight: formData.role === 'buyer' ? '600' : '400', color: formData.role === 'buyer' ? 'var(--text-primary)' : 'var(--text-muted)' }}>Buyer</span>
                </div>
                
                <div 
                  onClick={() => setFormData({...formData, role: 'creator'})}
                  style={{
                    padding: '1rem',
                    border: formData.role === 'creator' ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)',
                    borderRadius: '8px',
                    background: formData.role === 'creator' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(15, 23, 42, 0.6)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <Briefcase size={24} color={formData.role === 'creator' ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                  <span style={{ fontWeight: formData.role === 'creator' ? '600' : '400', color: formData.role === 'creator' ? 'var(--text-primary)' : 'var(--text-muted)' }}>Creator</span>
                </div>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ width: '100%', paddingLeft: '2.5rem' }} 
                  placeholder="John Doe"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  className="input-field" 
                  style={{ width: '100%', paddingLeft: '2.5rem' }} 
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>
            </div>
            
            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  className="input-field" 
                  style={{ width: '100%', paddingLeft: '2.5rem' }} 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required 
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          
          <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>OR REGISTER WITH GOOGLE</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
             <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Registration Failed')}
                theme="filled_black"
                shape="rectangular"
                size="large"
                text="signup_with"
             />
          </div>
          
          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Already have an account? <Link to="/login" style={{ fontWeight: '600' }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
