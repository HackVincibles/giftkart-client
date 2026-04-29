import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { User, Camera, Mail, MapPin, Wallet, CreditCard, ShieldCheck, Loader, Save, Edit2, X, Trash2, Send, Building, ArrowUpRight, ArrowDownLeft, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { uploadToCloudinary } from '../utils/cloudinary';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const UserProfile = () => {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Edit Modes
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);

  // Avatar Modal
  const [showAvatarModal, setShowAvatarModal] = useState(false);

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

  const displayedTransactions = showAllTransactions ? transactions : transactions.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      <Navbar />
      
      {/* Avatar Modal */}
      {showAvatarModal && profileData.avatar && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)'
        }}>
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', width: '100%', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setShowAvatarModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h3 style={{ marginBottom: '1.5rem' }}>Profile Picture</h3>
            <img src={profileData.avatar} alt="Full Avatar" style={{ width: '100%', borderRadius: '12px', marginBottom: '1.5rem', maxHeight: '300px', objectFit: 'cover' }} />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <label className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <Camera size={18} /> Update
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
              </label>
              <button onClick={handleRemoveAvatar} className="btn" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', border: '1px solid var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trash2 size={18} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="container animate-fade-in" style={{ padding: '3rem 2rem', flex: 1 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Account Settings</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem', alignItems: 'start' }}>
          
          {/* Left Column: Avatar & Wallet */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Avatar Section */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '1.5rem' }}>
                {uploadingImage ? (
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader className="animate-spin" color="var(--accent-primary)" size={30} />
                  </div>
                ) : profileData.avatar ? (
                  <img 
                    src={profileData.avatar} 
                    alt="Profile" 
                    onClick={() => setShowAvatarModal(true)}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--border-light)', cursor: 'pointer' }} 
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid var(--border-light)' }}>
                    <User size={50} color="var(--text-muted)" />
                  </div>
                )}
                
                <label style={{ 
                  position: 'absolute', bottom: '0', right: '0', background: 'var(--accent-primary)', 
                  width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  cursor: 'pointer', border: '2px solid var(--bg-primary)', transition: 'transform 0.2s' 
                }} className="hover:scale-110">
                  <Camera size={18} color="white" />
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={uploadingImage} />
                </label>
              </div>
              
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>{profileData.displayName}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'capitalize' }}>{profileData.role} Account</p>
            </div>

            {/* Wallet Section */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wallet color="var(--accent-primary)" /> My Wallet
              </h3>
              
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--accent-primary)', marginBottom: '1.5rem', textAlign: 'center', position: 'relative' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Available Balance</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                    <h2 style={{ fontSize: '2.5rem', color: 'var(--accent-secondary)', margin: 0 }}>
                        {showBalance ? `₹${walletBalance}` : '₹ ••••'}
                    </h2>
                    <button 
                        onClick={() => setShowBalance(!showBalance)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem' }}
                    >
                        {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
              </div>

              {/* Action Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <button onClick={() => setWalletAction('add')} className={`btn ${walletAction === 'add' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}>Add</button>
                {bankData.accountNumber && (
                  <button onClick={() => setWalletAction('withdraw')} className={`btn ${walletAction === 'withdraw' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}>Withdraw</button>
                )}
                <button onClick={() => setWalletAction('send')} className={`btn ${walletAction === 'send' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}>Send UPI</button>
              </div>

              <div className="input-group">
                <label className="input-label">Amount (₹)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="Enter amount" 
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                />
              </div>

              {walletAction === 'send' && (
                <div className="input-group">
                  <label className="input-label">Recipient UPI ID</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. name@okhdfcbank" 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
              )}

              <button onClick={processWalletAction} disabled={processingAction || !actionAmount} className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                {processingAction ? <Loader className="animate-spin" size={18} /> : 
                  walletAction === 'add' ? <><CreditCard size={18} /> Add via Razorpay</> : 
                  walletAction === 'withdraw' ? <><Building size={18} /> Withdraw to Bank</> : 
                  <><Send size={18} /> Send to UPI</>
                }
              </button>
              
              {walletAction === 'withdraw' && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
                  Will be withdrawn to: {bankData.bankName} (...{bankData.accountNumber.slice(-4)})
                </p>
              )}
            </div>

            {/* Wallet History */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', margin: 0 }}>Recent Transactions</h3>
                {transactions.length > 3 && (
                    <button 
                        onClick={() => setShowAllTransactions(!showAllTransactions)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
                    >
                        <Eye size={14} /> {showAllTransactions ? 'View Less' : 'View History'}
                    </button>
                )}
              </div>
              {displayedTransactions.length > 0 ? displayedTransactions.map(tx => (
                  <div key={tx.id || tx._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ background: (tx.type === 'credit' || tx.type === 'deposit') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                        {(tx.type === 'credit' || tx.type === 'deposit') ? <ArrowDownLeft size={16} color="var(--success)" /> : <ArrowUpRight size={16} color="var(--danger)" />}
                      </div>
                      <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: '500' }}>{tx.description}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(tx.createdAt || tx.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span style={{ fontWeight: '600', color: (tx.type === 'credit' || tx.type === 'deposit') ? 'var(--success)' : 'var(--danger)' }}>
                      {(tx.type === 'credit' || tx.type === 'deposit') ? '+' : '-'}₹{tx.amount}
                    </span>
                  </div>
              )) : (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem' }}>No transactions yet</p>
              )}
            </div>
          </div>

          {/* Right Column: Profile & Bank Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Profile Info */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Personal Information</h3>
                {!isEditingProfile ? (
                  <button onClick={() => setIsEditingProfile(true)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Edit2 size={16} /> Edit
                  </button>
                ) : (
                  <button onClick={() => setIsEditingProfile(false)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Cancel</button>
                )}
              </div>
              
              {!isEditingProfile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Full Name</p><p style={{ fontWeight: '500' }}>{profileData.displayName}</p></div>
                    <div><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Email Address</p><p style={{ fontWeight: '500' }}>{profileData.email}</p></div>
                    <div><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Street Address</p><p style={{ fontWeight: '500' }}>{profileData.street || 'Not provided'}</p></div>
                    <div><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>City / Pincode</p><p style={{ fontWeight: '500' }}>{profileData.city ? `${profileData.city}, ${profileData.pincode}` : 'Not provided'}</p></div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Full Name</label>
                      <input type="text" className="input-field" value={profileData.displayName} onChange={(e) => setProfileData({...profileData, displayName: e.target.value})} required />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Email Address (Locked)</label>
                      <input type="email" className="input-field" value={profileData.email} disabled style={{ opacity: 0.6 }} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Street Address</label>
                    <input type="text" className="input-field" value={profileData.street} onChange={(e) => setProfileData({...profileData, street: e.target.value})} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">City</label>
                      <input type="text" className="input-field" value={profileData.city} onChange={(e) => setProfileData({...profileData, city: e.target.value})} />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Pincode</label>
                      <input type="text" className="input-field" value={profileData.pincode} onChange={(e) => setProfileData({...profileData, pincode: e.target.value})} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Bank Details */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Linked Bank Account</h3>
                {!isEditingBank ? (
                  <button onClick={() => setIsEditingBank(true)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {bankData.accountNumber ? <><Edit2 size={16} /> Edit</> : <><Building size={16} /> Link Account</>}
                  </button>
                ) : (
                  <button onClick={() => setIsEditingBank(false)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Cancel</button>
                )}
              </div>
              
              {!isEditingBank ? (
                bankData.accountNumber ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '50%' }}>
                      <Building size={24} color="var(--accent-primary)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{bankData.bankName}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '1px' }}>{bankData.accountNumber}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>IFSC: {bankData.ifscCode}</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border-light)' }}>
                    <Building size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No bank account linked yet.</p>
                    <button onClick={() => setIsEditingBank(true)} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Link Bank Account</button>
                  </div>
                )
              ) : (
                <form onSubmit={handleSaveBank} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Bank Name</label>
                    <input type="text" className="input-field" value={bankData.bankName} onChange={(e) => setBankData({...bankData, bankName: e.target.value})} required placeholder="e.g. HDFC Bank" />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Account Number</label>
                    <input type="text" className="input-field" value={bankData.accountNumber} onChange={(e) => setBankData({...bankData, accountNumber: e.target.value})} required placeholder="Enter Account Number" />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">IFSC Code</label>
                    <input type="text" className="input-field" value={bankData.ifscCode} onChange={(e) => setBankData({...bankData, ifscCode: e.target.value})} required placeholder="Enter IFSC" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {loading ? 'Saving...' : <><Save size={18} /> Save Account</>}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Seller Sales History (Only for creators) */}
            {profileData.role === 'creator' && (
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>Revenue History</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <th style={{ paddingBottom: '1rem' }}>Order ID</th>
                      <th style={{ paddingBottom: '1rem' }}>Product</th>
                      <th style={{ paddingBottom: '1rem' }}>Date</th>
                      <th style={{ paddingBottom: '1rem', textAlign: 'right' }}>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesHistory.map(sale => (
                      <tr key={sale.id || sale._id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem 0', fontSize: '0.9rem' }}>#{sale.id || sale._id?.slice(-6)}</td>
                        <td style={{ padding: '1rem 0', fontWeight: '500' }}>{sale.product}</td>
                        <td style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{sale.date}</td>
                        <td style={{ padding: '1rem 0', textAlign: 'right', color: 'var(--success)', fontWeight: '600' }}>+₹{sale.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
};

export default UserProfile;
