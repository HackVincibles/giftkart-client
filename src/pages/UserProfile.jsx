import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { User, Camera, Mail, MapPin, Wallet, CreditCard, ShieldCheck, Loader, Save, Edit2, X, Trash2, Send, Building, ArrowUpRight, ArrowDownLeft, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { uploadToCloudinary } from '../utils/cloudinary';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Edit Modes
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);

  // Avatar Modal
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Delete Account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState('confirm'); // 'confirm' | 'otp' | 'deleting' | 'done'
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteSending, setDeleteSending] = useState(false);
  const [deleteConfirming, setDeleteConfirming] = useState(false);

  // Wallet actions
  const [walletAction, setWalletAction] = useState('add'); // 'add', 'withdraw', 'send'
  const [actionAmount, setActionAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    role: user?.role || 'buyer',
    street: '',
    city: '',
    pincode: ''
  });

  const [bankData, setBankData] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });
  
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [referralData, setReferralData] = useState({ code: '', count: 0, totalEarned: 0 });

  const [showBalance, setShowBalance] = useState(false);

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);

    // Fetch real profile data
    const fetchProfileData = async () => {
      try {
        const res = await axios.get('/profile/me');
        if (res.data.success) {
          const { profile, wallet, transactions } = res.data;
          setProfileData({
            displayName: profile.displayName || '',
            email: profile.email || '',
            avatar: profile.avatar || '',
            role: profile.role || 'buyer',
            street: profile.billingAddress?.street || profile.buyerProfile?.shippingAddress?.street || '',
            city: profile.billingAddress?.city || profile.buyerProfile?.shippingAddress?.city || '',
            pincode: profile.billingAddress?.zipCode || profile.buyerProfile?.shippingAddress?.zip || ''
          });

          if (profile.creatorProfile?.bankDetails) {
            setBankData({
              bankName: profile.creatorProfile.bankDetails.bankName || '',
              accountNumber: profile.creatorProfile.bankDetails.accountNumber || '',
              ifscCode: profile.creatorProfile.bankDetails.ifsc || '',
              upiId: profile.creatorProfile.bankDetails.upiId || ''
            });
          }

          setWalletBalance(wallet.balance || 0);
          setTransactions(transactions || []);

          // If creator, fetch orders
          if (profile.role === 'creator') {
            const orderRes = await axios.get('/analytics/creator');
            if (orderRes.data.success) {
              setSalesHistory(orderRes.data.recentOrders || []);
            }
          }

          // Fetch referral info
          const refCodeRes = await axios.get('/referral/code');
          const refStatsRes = await axios.get('/referral/stats');
          setReferralData({
            code: refCodeRes.data.code,
            count: refStatsRes.data.count,
            totalEarned: refStatsRes.data.totalEarned
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfileData();
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadToCloudinary(file);
      await axios.put('/profile/update', { avatar: url });
      setProfileData(prev => ({ ...prev, avatar: url }));
      success("Avatar uploaded successfully!");
    } catch (err) {
      error("Failed to upload avatar.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await axios.put('/profile/update', { avatar: '' });
      setProfileData(prev => ({ ...prev, avatar: '' }));
      success("Avatar removed successfully!");
    } catch (err) {
      error("Failed to remove avatar.");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/profile/update', {
        displayName: profileData.displayName,
        billingAddress: {
          street: profileData.street,
          city: profileData.city,
          zipCode: profileData.pincode
        }
      });
      success("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (err) {
      error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBank = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/profile/role-data', {
        bankDetails: {
          bankName: bankData.bankName,
          accountNumber: bankData.accountNumber,
          ifsc: bankData.ifscCode,
          upiId: bankData.upiId
        }
      });
      success("Bank details linked successfully!");
      setIsEditingBank(false);
    } catch (err) {
      error("Failed to link bank details. Ensure you are a creator.");
    } finally {
      setLoading(false);
    }
  };

  const processWalletAction = async () => {
    if (!actionAmount || isNaN(actionAmount) || Number(actionAmount) <= 0) return;
    setProcessingAction(true);
    
    try {
      if (walletAction === 'add') {
        const orderRes = await axios.post('/wallet/add-money', { amount: Number(actionAmount) });
        
        if (orderRes.data.order) {
          const options = {
              key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'dummy',
              amount: orderRes.data.order.amount,
              currency: "INR",
              order_id: orderRes.data.order.id,
              name: "GiftKart Wallet",
              description: "Add Funds to Wallet",
              handler: async function (response) {
                 try {
                   const verifyRes = await axios.post('/wallet/verify-payment', response);
                   setWalletBalance(verifyRes.data.balance);
                   // Refresh transactions
                   const profileRes = await axios.get('/profile/me');
                   if (profileRes.data.success) setTransactions(profileRes.data.transactions);
                   
                   setActionAmount('');
                   success('Funds added successfully!');
                 } catch (err) {
                   error('Payment verification failed.');
                 }
              },
              theme: { color: "#8b5cf6" }
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      } 
      else if (walletAction === 'withdraw') {
        const res = await axios.post('/wallet/request-withdrawal', { amount: Number(actionAmount) });
        if (res.data.success) {
          // Refresh data
          const profileRes = await axios.get('/profile/me');
          if (profileRes.data.success) {
            setWalletBalance(profileRes.data.wallet.balance);
            setTransactions(profileRes.data.transactions);
          }
          setActionAmount('');
          success('Withdrawal request submitted!');
        }
      }
      else if (walletAction === 'send') {
        if (!upiId) {
          error('Please enter a valid UPI ID');
          return;
        }
        const res = await axios.post('/wallet/request-withdrawal', { amount: Number(actionAmount) });
        if (res.data.success) {
          // Refresh data
          const profileRes = await axios.get('/profile/me');
          if (profileRes.data.success) {
            setWalletBalance(profileRes.data.wallet.balance);
            setTransactions(profileRes.data.transactions);
          }
          setActionAmount('');
          setUpiId('');
          success('Money sent successfully via UPI details!');
        }
      }
    } catch (err) {
      console.error("Action failed", err);
      error(err.response?.data?.message || 'Failed to process request.');
    } finally {
      if (walletAction !== 'add') setProcessingAction(false); 
      else setTimeout(() => setProcessingAction(false), 1000);
    }
  };

  const displayedTransactions = showAllTransactions ? transactions : transactions.slice(0, 5);

  // Delete Account handlers
  const handleRequestDelete = async () => {
    try {
      setDeleteSending(true);
      const res = await axios.post('/profile/delete-request');
      if (res.data.success) {
        setDeleteStep('otp');
        success('Verification OTP sent to your email!');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setDeleteSending(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteOtp || deleteOtp.length !== 6) {
      error('Please enter a valid 6-digit OTP.');
      return;
    }
    try {
      setDeleteConfirming(true);
      setDeleteStep('deleting');
      const res = await axios.post('/profile/delete-confirm', { otp: deleteOtp });
      if (res.data.success) {
        setDeleteStep('done');
        success('Your account has been permanently deleted.');
        setTimeout(() => {
          logout();
          navigate('/');
        }, 2500);
      }
    } catch (err) {
      setDeleteStep('otp');
      error(err.response?.data?.message || 'Failed to delete account.');
    } finally {
      setDeleteConfirming(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
      <Navbar />
      
      {/* Avatar Modal */}
      {showAvatarModal && profileData.avatar && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.85)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)'
        }}>
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '450px', width: '90%', textAlign: 'center', position: 'relative', border: '1px solid var(--accent-primary)' }}>
            <button onClick={() => setShowAvatarModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}>
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'Outfit' }}>Profile Picture</h3>
            <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem', border: '2px solid var(--border-light)' }}>
              <img src={profileData.avatar} alt="Full Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <label className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.6rem 1.2rem' }}>
                <Camera size={18} /> Change
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
              </label>
              <button onClick={handleRemoveAvatar} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}>
                <Trash2 size={18} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner Section */}
      <div style={{ 
        height: '220px', 
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)', 
        position: 'relative',
        width: '100%'
      }}>
        <div className="bg-mesh" style={{ position: 'absolute', inset: 0, opacity: 0.6 }}></div>
        <div className="container" style={{ height: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: '-60px', left: '2rem', display: 'flex', alignItems: 'flex-end', gap: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{ 
                        width: '140px', 
                        height: '140px', 
                        borderRadius: '24px', 
                        background: 'var(--bg-secondary)', 
                        border: '5px solid var(--bg-primary)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {uploadingImage ? (
                            <Loader className="animate-spin" color="var(--accent-primary)" size={40} />
                        ) : profileData.avatar ? (
                            <img 
                                src={profileData.avatar} 
                                alt="Profile" 
                                onClick={() => setShowAvatarModal(true)}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} 
                            />
                        ) : (
                            <User size={60} color="var(--text-muted)" />
                        )}
                    </div>
                    <label style={{ 
                        position: 'absolute', bottom: '5px', right: '5px', background: 'var(--accent-primary)', 
                        width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        cursor: 'pointer', border: '3px solid var(--bg-primary)', transition: 'transform 0.2s',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    }} className="hover:scale-110">
                        <Camera size={18} color="white" />
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={uploadingImage} />
                    </label>
                </div>
                <div style={{ marginBottom: '1rem', paddingBottom: '0.5rem' }}>
                    <h1 style={{ fontSize: '2.2rem', margin: 0, fontWeight: '800', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{profileData.displayName}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.9 }}>
                        <span style={{ 
                            background: profileData.role === 'creator' ? 'linear-gradient(to right, #f59e0b, #d97706)' : 'linear-gradient(to right, #8b5cf6, #6d28d9)', 
                            padding: '2px 12px', 
                            borderRadius: '20px', 
                            fontSize: '0.75rem', 
                            fontWeight: '700', 
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {profileData.role}
                        </span>
                        <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: '500' }}>• Member since 2024</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <main className="container animate-fade-in" style={{ padding: '80px 2rem 4rem 2rem', flex: 1 }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="mobile-stack">
          
          {/* Section 1: Information & Wallet */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Personal Details Section */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.4rem', margin: 0, fontFamily: 'Outfit' }}>Personal Information</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>Manage your profile and contact details</p>
                </div>
                {!isEditingProfile ? (
                  <button onClick={() => setIsEditingProfile(true)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                    <Edit2 size={16} /> Edit
                  </button>
                ) : (
                  <button onClick={() => setIsEditingProfile(false)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                )}
              </div>
              
              {!isEditingProfile ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.4rem', fontWeight: '700', textTransform: 'uppercase' }}>Full Name</label>
                        <p style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>{profileData.displayName}</p>
                    </div>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.4rem', fontWeight: '700', textTransform: 'uppercase' }}>Email</label>
                        <p style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>{profileData.email}</p>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.4rem', fontWeight: '700', textTransform: 'uppercase' }}>Address</label>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                      {profileData.street ? `${profileData.street}, ${profileData.city}, ${profileData.pincode}` : 'No address added'}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input type="text" className="input-field" value={profileData.displayName} onChange={(e) => setProfileData({...profileData, displayName: e.target.value})} required placeholder="Full Name" />
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                    <input type="text" className="input-field" value={profileData.city} onChange={(e) => setProfileData({...profileData, city: e.target.value})} placeholder="City" />
                    <input type="text" className="input-field" value={profileData.pincode} onChange={(e) => setProfileData({...profileData, pincode: e.target.value})} placeholder="Pincode" />
                  </div>
                  <input type="text" className="input-field" value={profileData.street} onChange={(e) => setProfileData({...profileData, street: e.target.value})} placeholder="Full Street Address" />
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                </form>
              )}
            </div>

            {/* Wallet Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }} className="mobile-stack">
              <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>Available Balance</h3>
                  <div style={{ padding: '0.4rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px' }}><Wallet size={20} color="var(--accent-primary)" /></div>
                </div>
                <h2 style={{ fontSize: '2.8rem', fontWeight: '800', margin: 0 }}>₹{showBalance ? walletBalance.toLocaleString() : '•••••'}</h2>
                <button onClick={() => setShowBalance(!showBalance)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', marginTop: '0.5rem', textAlign: 'left' }}>
                  {showBalance ? 'Hide balance' : 'Show balance'}
                </button>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {['add', 'send', 'withdraw'].map(mode => (
                    <button key={mode} onClick={() => setWalletAction(mode)} style={{ 
                      flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', fontSize: '0.75rem', fontWeight: '700',
                      background: walletAction === mode ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                      color: walletAction === mode ? 'white' : 'var(--text-muted)', cursor: 'pointer'
                    }}>{mode.toUpperCase()}</button>
                  ))}
                </div>
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>₹</span>
                  <input type="number" className="input-field" style={{ paddingLeft: '2rem', fontSize: '1.1rem' }} placeholder="0" value={actionAmount} onChange={(e) => setActionAmount(e.target.value)} />
                </div>
                {walletAction === 'send' && <input type="text" className="input-field" placeholder="UPI ID (user@upi)" style={{ marginBottom: '1rem' }} value={upiId} onChange={(e) => setUpiId(e.target.value)} />}
                <button onClick={processWalletAction} disabled={processingAction} className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
                  {processingAction ? 'Processing...' : 'Confirm Action'}
                </button>
              </div>
            </div>

            {/* Referral Section (New Phase 6) */}
            <div className="glass-panel" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, transparent 100%)', border: '1px solid var(--accent-primary)30' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Send size={20} color="var(--accent-primary)" /> Refer & Earn ₹50
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Invite friends and both get credits!</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px dashed var(--accent-primary)50' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Your Referral Code</p>
                  <p style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '2px', color: 'var(--accent-primary)', margin: 0 }}>{referralData.code || 'GENERATING...'}</p>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(referralData.code);
                    success("Code copied to clipboard!");
                  }}
                  className="btn btn-secondary" 
                  style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                >
                  Copy
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>{referralData.count}</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Friends Joined</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#10b981' }}>₹{referralData.totalEarned}</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Earned</p>
                </div>
              </div>
            </div>

          </div>

          {/* Section 2: Finances & Security */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Quick Navigation Menu */}
            <div className="glass-panel" style={{ padding: '1.2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { icon: User, label: 'Account Info', active: true },
                  { icon: ShieldCheck, label: 'Security' },
                  { icon: CreditCard, label: 'Payments' },
                  { icon: Trash2, label: 'History', action: () => navigate('/my-orders') }
                ].map((item, idx) => (
                  <button key={idx} onClick={item.action} style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px', border: 'none',
                    background: item.active ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                    color: item.active ? 'var(--accent-primary)' : 'var(--text-muted)',
                    cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600', fontSize: '0.85rem'
                  }} className={!item.active ? "hover:bg-white/5" : ""}>
                    <item.icon size={18} /> {item.label}
                  </button>
                ))}
            </div>

            {/* Bank & Activity Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                {/* Bank Details */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Linked Bank Account</h3>
                        <button onClick={() => setIsEditingBank(!isEditingBank)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' }}>
                          {isEditingBank ? 'Cancel' : bankData.accountNumber ? 'Edit' : 'Link'}
                        </button>
                    </div>
                    {!isEditingBank ? (
                        bankData.accountNumber ? (
                          <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Bank Name</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>{bankData.bankName}</p>
                              </div>
                              <Building size={24} color="var(--accent-primary)" />
                            </div>
                            <div style={{ marginTop: '1.5rem' }}>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Account Number</p>
                              <p style={{ fontSize: '1.2rem', fontWeight: '500', letterSpacing: '2px' }}>•••• •••• {bankData.accountNumber.slice(-4)}</p>
                            </div>
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--border-light)' }}>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>No bank account linked yet.</p>
                          </div>
                        )
                    ) : (
                        <form onSubmit={handleSaveBank} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <input type="text" className="input-field" value={bankData.bankName} onChange={(e) => setBankData({...bankData, bankName: e.target.value})} required placeholder="Bank Name" />
                          <input type="text" className="input-field" value={bankData.accountNumber} onChange={(e) => setBankData({...bankData, accountNumber: e.target.value})} required placeholder="Account Number" />
                          <input type="text" className="input-field" value={bankData.ifscCode} onChange={(e) => setBankData({...bankData, ifscCode: e.target.value})} required placeholder="IFSC Code" />
                          <button type="submit" className="btn btn-primary" disabled={loading}>Link Bank Account</button>
                        </form>
                    )}
                </div>

                {/* Transactions */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', margin: 0 }}>Recent Activity</h3>
                        <button onClick={() => setShowAllTransactions(!showAllTransactions)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer' }}>View All</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {displayedTransactions.length > 0 ? displayedTransactions.map(tx => (
                            <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderRadius: '8px' }} className="hover:bg-white/5">
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={{ padding: '0.4rem', borderRadius: '8px', background: (tx.type === 'credit' || tx.type === 'deposit') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                                        {(tx.type === 'credit' || tx.type === 'deposit') ? <ArrowDownLeft size={16} color="#10b981" /> : <ArrowUpRight size={16} color="#ef4444" />}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', fontWeight: '600', margin: 0 }}>{tx.description}</p>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>{new Date(tx.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span style={{ fontWeight: '700', color: (tx.type === 'credit' || tx.type === 'deposit') ? '#10b981' : '#ef4444' }}>
                                    {(tx.type === 'credit' || tx.type === 'deposit') ? '+' : '-'}₹{tx.amount}
                                </span>
                            </div>
                        )) : <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No recent activity</p>}
                    </div>
                </div>
            </div>

          </div>

        </div>

        {/* Danger Zone - Spans Full Width at Bottom */}
        {profileData.role !== 'admin' && (
          <div className="glass-panel" style={{ 
            marginTop: '3rem', padding: '2.5rem', border: '1px solid rgba(239, 68, 68, 0.2)', 
            background: 'linear-gradient(to right, rgba(239, 68, 68, 0.05), transparent)', borderRadius: '24px' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <h3 style={{ color: '#ef4444', fontSize: '1.4rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Trash2 size={24} /> Delete Account
                </h3>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Permanently remove your account and all associated data from GiftKart. 
                  This includes your <strong>wallet balance</strong>, <strong>order history</strong>, and <strong>listed products</strong>. 
                  This action cannot be undone.
                </p>
              </div>
              <button 
                onClick={() => { setShowDeleteModal(true); setDeleteStep('confirm'); setDeleteOtp(''); }}
                style={{ 
                  background: '#ef4444', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '12px',
                  fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.6rem'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Trash2 size={20} /> Permanently Delete
              </button>
            </div>
          </div>
        )}
      </main>


      {/* Delete Account OTP Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', padding: '1rem'
        }}>
          <div className="glass-panel" style={{ 
            padding: '2.5rem', maxWidth: '480px', width: '100%', textAlign: 'center', position: 'relative',
            border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '20px'
          }}>
            {deleteStep !== 'done' && deleteStep !== 'deleting' && (
              <button 
                onClick={() => setShowDeleteModal(false)} 
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}
              >
                <X size={20} />
              </button>
            )}

            {/* Step 1: Confirmation */}
            {deleteStep === 'confirm' && (
              <>
                <div style={{ 
                  width: '70px', height: '70px', borderRadius: '50%', margin: '0 auto 1.5rem auto',
                  background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Trash2 size={32} color="#ef4444" />
                </div>
                <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.75rem', fontFamily: 'Outfit' }}>Delete Account?</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '0.5rem' }}>
                  This will <strong style={{ color: '#ef4444' }}>permanently delete</strong> your account and all associated data:
                </p>
                <ul style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.8', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                  <li>Profile & personal information</li>
                  <li>Wallet balance & transaction history</li>
                  <li>All products and listings</li>
                  <li>Order history & queue</li>
                </ul>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '2rem' }}>
                  A verification OTP will be sent to <strong style={{ color: 'white' }}>{profileData.email}</strong>
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => setShowDeleteModal(false)} 
                    className="btn btn-secondary" 
                    style={{ flex: 1, padding: '0.8rem' }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleRequestDelete} 
                    disabled={deleteSending}
                    style={{ 
                      flex: 1, padding: '0.8rem', background: '#ef4444', border: 'none', color: 'white', 
                      borderRadius: '12px', fontWeight: '700', cursor: deleteSending ? 'wait' : 'pointer',
                      opacity: deleteSending ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}
                  >
                    {deleteSending ? <><Loader className="animate-spin" size={16} /> Sending OTP...</> : <><Mail size={16} /> Send OTP</>}
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Enter OTP */}
            {deleteStep === 'otp' && (
              <>
                <div style={{ 
                  width: '70px', height: '70px', borderRadius: '50%', margin: '0 auto 1.5rem auto',
                  background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Mail size={32} color="#ef4444" />
                </div>
                <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>Enter Verification OTP</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                  We sent a 6-digit code to <strong style={{ color: 'white' }}>{profileData.email}</strong>. Enter it below to confirm deletion.
                </p>

                <input
                  type="text"
                  maxLength={6}
                  value={deleteOtp}
                  onChange={(e) => setDeleteOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  style={{
                    width: '100%', padding: '1.2rem', fontSize: '2rem', textAlign: 'center', letterSpacing: '12px',
                    background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(239, 68, 68, 0.3)', borderRadius: '14px',
                    color: 'white', fontWeight: '800', outline: 'none', marginBottom: '1.5rem', fontFamily: 'monospace'
                  }}
                  autoFocus
                />

                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '1.5rem' }}>
                  OTP valid for 10 minutes. <button onClick={handleRequestDelete} disabled={deleteSending} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem' }}>{deleteSending ? 'Sending...' : 'Resend OTP'}</button>
                </p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => { setDeleteStep('confirm'); setDeleteOtp(''); }} 
                    className="btn btn-secondary" 
                    style={{ flex: 1, padding: '0.8rem' }}
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleConfirmDelete} 
                    disabled={deleteConfirming || deleteOtp.length !== 6}
                    style={{ 
                      flex: 1, padding: '0.8rem', background: deleteOtp.length === 6 ? '#ef4444' : '#555', 
                      border: 'none', color: 'white', borderRadius: '12px', fontWeight: '700', 
                      cursor: deleteOtp.length === 6 ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}
                  >
                    {deleteConfirming ? <Loader className="animate-spin" size={16} /> : <Trash2 size={16} />} Delete Forever
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Deleting... */}
            {deleteStep === 'deleting' && (
              <>
                <div style={{ padding: '3rem 0' }}>
                  <Loader className="animate-spin" size={48} color="#ef4444" style={{ margin: '0 auto 1.5rem auto', display: 'block' }} />
                  <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '0.5rem' }}>Deleting your account...</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Please wait while we remove all your data.</p>
                </div>
              </>
            )}

            {/* Step 4: Done */}
            {deleteStep === 'done' && (
              <>
                <div style={{ padding: '3rem 0' }}>
                  <div style={{ 
                    width: '70px', height: '70px', borderRadius: '50%', margin: '0 auto 1.5rem auto',
                    background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <ShieldCheck size={32} color="#10b981" />
                  </div>
                  <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '0.5rem' }}>Account Deleted</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Your account has been permanently removed. Redirecting to homepage...</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add custom CSS for this page responsiveness */}
      <style>{`
        @media (max-width: 992px) {
            .mobile-stack {
                grid-template-columns: 1fr !important;
            }
        }
        .hover\\:bg-white\\/5:hover { background: rgba(255, 255, 255, 0.05); }
        .hover\\:bg-white\\/2:hover { background: rgba(255, 255, 255, 0.02); }
      `}</style>
    </div>
  );
};

export default UserProfile;
