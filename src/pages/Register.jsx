import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import Navbar from '../components/Navbar';
import { User, Mail, Lock, AlertCircle, ArrowRight, Store, ShoppingBag, Phone, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer'); // Default role
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const { register, sellerRegister, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = (userRole) => {
    if (userRole === 'admin') navigate('/admin-dashboard');
    else if (userRole === 'creator' || userRole === 'seller') navigate('/creator-dashboard');
    else navigate('/buyer-dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const res = await register({ displayName: name, studioName, email, phone, password, role, referralCode });

        if (res.success) handleSuccess(res.role);
        else setError(res.error);
    } catch (err) {
        setError("Registration failed. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const res = await googleLogin(credentialResponse.credential, role);
    if (res.success) handleSuccess(res.role);
    else setError(res.error);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-gradient"></div>
      <Navbar />
      
      <div className="glass-card">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.6rem' }}>Join GiftKart</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create your account to start gifting</p>
        </div>

        <div className="role-selector" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <button 
            className={`role-btn ${role === 'buyer' ? 'active' : ''}`}
            onClick={() => setRole('buyer')}
          >
            <ShoppingBag size={14} /> Buyer
          </button>
          <button 
            className={`role-btn ${role === 'creator' ? 'active' : ''}`}
            onClick={() => setRole('creator')}
          >
            <User size={14} /> Creator
          </button>
        </div>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.8rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', fontWeight: '700' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', top: '15px', left: '16px', color: 'var(--text-light)' }} />
              <input 
                type="text" 
                style={{ paddingLeft: '2.8rem' }} 
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
          </div>

          {(role === 'creator') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', fontWeight: '700' }}>Studio Name</label>
              <div style={{ position: 'relative' }}>
                <Store size={16} style={{ position: 'absolute', top: '15px', left: '16px', color: 'var(--text-light)' }} />
                <input 
                  type="text" 
                  style={{ paddingLeft: '2.8rem' }} 
                  placeholder={role === 'seller' ? "Acme Gifts Ltd" : "Artisan Studio"}
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  required 
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', fontWeight: '700' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', top: '15px', left: '16px', color: 'var(--text-light)' }} />
              <input 
                type="email" 
                style={{ paddingLeft: '2.8rem' }} 
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', fontWeight: '700' }}>Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', top: '15px', left: '16px', color: 'var(--text-light)' }} />
              <input 
                type="tel" 
                style={{ paddingLeft: '2.8rem' }} 
                placeholder="9988776655"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required 
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', fontWeight: '700' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', top: '15px', left: '16px', color: 'var(--text-light)' }} />
              <input 
                type={showPassword ? "text" : "password"} 
                style={{ paddingLeft: '2.8rem', paddingRight: '3rem' }} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '16px', 
                  top: '12px', 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--text-light)', 
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', fontWeight: '700' }}>Referral Code (Optional)</label>
            <div style={{ position: 'relative' }}>
              <Sparkles size={16} style={{ position: 'absolute', top: '15px', left: '16px', color: 'var(--accent-primary)' }} />
              <input 
                type="text" 
                style={{ paddingLeft: '2.8rem' }} 
                placeholder="GIFT-1234"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1.1rem' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'} <ArrowRight size={16} />
          </button>
        </form>
        
        <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          <span style={{ color: 'var(--text-light)', fontSize: '0.7rem', letterSpacing: '0.1em' }}>OR CONTINUE WITH</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
           <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Registration Failed')}
              theme="outline"
              shape="pill"
              size="large"
              width="100%"
           />
        </div>
        
        <p style={{ textAlign: 'center', marginTop: '2.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--text)', fontWeight: '700' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
