import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, Lock, ShieldCheck, ArrowRight, ChevronLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/auth/forgot-password', { email });
      if (res.data.success) {
        success('OTP sent to your email!');
        setStep(2);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/auth/verify-otp', { email, otp });
      if (res.data.success) {
        success('OTP Verified!');
        setStep(3);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toastError('Passwords do not match');
    }
    setLoading(true);
    try {
      const res = await axios.post('/auth/reset-password', { email, otp, password });
      if (res.data.success) {
        success('Password reset successfully!');
        setStep(4);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-mesh animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '3rem 2.5rem' }}>
          
          {step < 4 && (
             <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontSize: '0.9rem' }} className="hover:text-white">
                <ChevronLeft size={16} /> Back
             </button>
          )}

          {step === 1 && (
            <div className="animate-slide-up">
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Forgot Password?</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Enter your email and we'll send you an OTP to reset your password.</p>
              
              <form onSubmit={handleRequestOTP}>
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
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled={loading}>
                  {loading ? 'Sending...' : <>Send OTP <ArrowRight size={18} /></>}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="animate-slide-up">
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Verify OTP</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>We've sent a 6-digit code to <b>{email}</b>. Enter it below.</p>
              
              <form onSubmit={handleVerifyOTP}>
                <div className="input-group">
                  <label className="input-label">6-Digit Code</label>
                  <div style={{ position: 'relative' }}>
                    <ShieldCheck size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      className="input-field" 
                      style={{ width: '100%', paddingLeft: '2.5rem', letterSpacing: '4px', fontSize: '1.2rem' }} 
                      placeholder="000000"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      required 
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Didn't receive code? <button type="button" onClick={handleRequestOTP} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 'bold', cursor: 'pointer' }}>Resend</button>
                </p>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="animate-slide-up">
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>New Password</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Set a strong password for your account.</p>
              
              <form onSubmit={handleResetPassword}>
                <div className="input-group">
                  <label className="input-label">New Password</label>
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

                <div className="input-group">
                  <label className="input-label">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                    <input 
                      type="password" 
                      className="input-field" 
                      style={{ width: '100%', paddingLeft: '2.5rem' }} 
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }} disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </div>
          )}

          {step === 4 && (
            <div className="animate-slide-up" style={{ textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle size={40} color="var(--success)" />
              </div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Success!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Your password has been reset successfully. You can now login with your new password.</p>
              <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
                Back to Login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
