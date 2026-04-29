import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Mail, Lock, User, AlertCircle, Briefcase, Camera, Info } from 'lucide-react';

const SellerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studioName: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { sellerRegister } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const res = await sellerRegister(formData);
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
        <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '3rem 2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem', letterSpacing: '-0.04em' }}>Join as a <span className="text-gradient">Creator</span></h2>
            <p style={{ color: 'var(--text-secondary)' }}>Share your artisanal craft with the world.</p>
          </div>
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="input-group">
                <label className="input-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                    <input 
                    name="name"
                    type="text" 
                    className="input-field" 
                    style={{ width: '100%', paddingLeft: '2.5rem' }} 
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required 
                    />
                </div>
                </div>
                
                <div className="input-group">
                <label className="input-label">Studio Email</label>
                <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                    <input 
                    name="email"
                    type="email" 
                    className="input-field" 
                    style={{ width: '100%', paddingLeft: '2.5rem' }} 
                    placeholder="studio@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required 
                    />
                </div>
                </div>
            </div>

            <div className="input-group">
              <label className="input-label">Studio Name</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                <input 
                  name="studioName"
                  type="text" 
                  className="input-field" 
                  style={{ width: '100%', paddingLeft: '2.5rem' }} 
                  placeholder="e.g. Handmade Wonders Studio"
                  value={formData.studioName}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Studio Bio</label>
              <div style={{ position: 'relative' }}>
                <Info size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                <textarea 
                  name="bio"
                  className="input-field" 
                  style={{ width: '100%', paddingLeft: '2.5rem', minHeight: '100px', paddingTop: '12px' }} 
                  placeholder="Tell buyers about your craft, inspiration, and process..."
                  value={formData.bio}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
            
            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                <input 
                  name="password"
                  type="password" 
                  className="input-field" 
                  style={{ width: '100%', paddingLeft: '2.5rem' }} 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: '800' }} disabled={loading}>
              {loading ? 'Creating Studio...' : 'Launch Your Studio'}
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Already have a studio? <Link to="/seller-login" style={{ fontWeight: '600' }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerRegister;
