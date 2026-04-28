import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import Navbar from '../components/Navbar';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = (role) => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'creator') navigate('/creator-dashboard');
    else navigate('/buyer-dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const res = await login(email, password);
    if (res.success) {
      handleSuccess(res.role);
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    // Note: If they don't have an account, the backend might need role context.
    // For login, backend auth/google usually finds the user.
    const res = await googleLogin(credentialResponse.credential);
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
        <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '3rem 2.5rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>
            Login to your GiftKart account
          </p>
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  className="input-field" 
                  style={{ width: '100%', paddingLeft: '2.5rem' }} 
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>
            
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Password</span>
                <Link to="#" style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Forgot password?</Link>
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
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          
          <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
             <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                theme="filled_black"
                shape="rectangular"
                size="large"
             />
          </div>
          
          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Don't have an account? <Link to="/register" style={{ fontWeight: '600' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
