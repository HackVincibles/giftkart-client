import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { User, Camera, Mail, MapPin, Wallet, CreditCard, ShieldCheck, Loader, Save, Edit2, X, Trash2, Building, Store, ArrowRight, UserCheck, Settings, Bell, Palette, Gift, Copy, Check, MessageSquare, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { uploadToCloudinary } from '../utils/cloudinary';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile'); 
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [referralData, setReferralData] = useState({ code: '', stats: { totalReferred: 0, pendingRewards: 0, totalEarned: 0 } });
  const [copiedCode, setCopiedCode] = useState(false);
  const [grievances, setGrievances] = useState([]);
  const [loadingGrievances, setLoadingGrievances] = useState(false);
  const [showGrievanceForm, setShowGrievanceForm] = useState(false);
  const [grievanceData, setGrievanceData] = useState({ category: 'product_quality', subject: '', description: '' });
  
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    role: user?.role || 'buyer',
    phone: '',
    address: { street: '', city: '', state: '', pincode: '' }
  });

  const [roleData, setRoleData] = useState({
    businessName: '',
    studioName: '',
    bio: '',
    bankDetails: { bankName: '', accountNumber: '', ifsc: '' }
  });

  useEffect(() => {
    fetchData();
    fetchReferral();
  }, []);

  useEffect(() => {
    if (activeTab === 'support') {
      fetchGrievances();
    }
  }, [activeTab]);

  const fetchGrievances = async () => {
    setLoadingGrievances(true);
    try {
      const res = await axios.get('/settings/grievances');
      if (res.data.success) {
        setGrievances(res.data.data.grievances);
      }
    } catch { 
      error("Failed to load support tickets"); 
    } finally {
      setLoadingGrievances(false);
    }
  };

  const handleGrievanceSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/settings/grievances', grievanceData);
      if (res.data.success) {
        success("Support ticket created!");
        setShowGrievanceForm(false);
        setGrievanceData({ category: 'product_quality', subject: '', description: '' });
        fetchGrievances();
      }
    } catch {
      error("Failed to submit ticket");
    }
  };

  const fetchReferral = async () => {
    try {
      const [codeRes, statsRes] = await Promise.all([
        axios.get('/referral/code'),
        axios.get('/referral/stats')
      ]);
      setReferralData({
        code: codeRes.data?.referralCode || codeRes.data?.code || '',
        stats: statsRes.data?.stats || { totalReferred: 0, pendingRewards: 0, totalEarned: 0 }
      });
    } catch {}
  };

  const handleCopyCode = () => {
    const link = `${window.location.origin}/register?ref=${referralData.code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/profile/me');
      if (res.data.success) {
        const p = res.data.profile;
        setProfileData({
          displayName: p.displayName || p.name || '',
          email: p.email || '',
          avatar: p.avatar || '',
          role: p.role || 'buyer',
          phone: p.phoneNumber || '',
          address: {
            street: p.billingAddress?.street || p.buyerProfile?.shippingAddress?.street || '',
            city: p.billingAddress?.city || p.buyerProfile?.shippingAddress?.city || '',
            state: p.billingAddress?.state || p.buyerProfile?.shippingAddress?.state || '',
            pincode: p.billingAddress?.zipCode || p.buyerProfile?.shippingAddress?.zip || ''
          }
        });

        if (p.role === 'creator') {
            setRoleData({
                studioName: p.creatorProfile?.studioName || '',
                bio: p.creatorProfile?.bio || '',
                bankDetails: {
                    bankName: p.creatorProfile?.bankDetails?.bankName || '',
                    accountNumber: p.creatorProfile?.bankDetails?.accountNumber || '',
                    ifsc: p.creatorProfile?.bankDetails?.ifsc || ''
                }
            });
        }
      }
      
      if (user?.role === 'seller') {
          const sRes = await axios.get('/seller-auth/me');
          if (sRes.data.success) {
              const s = sRes.data.seller;
              setRoleData(prev => ({
                  ...prev,
                  businessName: s.businessName || '',
                  bio: s.description || '',
                  bankDetails: {
                      bankName: s.bankDetails?.bankName || '',
                      accountNumber: s.bankDetails?.accountNumber || '',
                      ifsc: s.bankDetails?.ifscCode || ''
                  }
              }));
          }
      }
    } catch (err) {
      console.error("Fetch profile failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put('/profile/update', {
        displayName: profileData.displayName,
        phoneNumber: profileData.phone,
        billingAddress: profileData.address
      });
      success("Profile updated successfully!");
    } catch (err) {
      error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoleData = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (profileData.role === 'creator') {
          await axios.put('/profile/role-data', {
            creatorProfile: {
                studioName: roleData.studioName,
                bio: roleData.bio,
                bankDetails: roleData.bankDetails
            }
          });
      } else if (profileData.role === 'seller') {
          await axios.put('/seller-auth/profile', {
              businessName: roleData.businessName,
              description: roleData.bio,
              bankDetails: roleData.bankDetails
          });
      }
      success("Professional profile updated!");
    } catch (err) {
      error("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadToCloudinary(file);
      await axios.put('/profile/update', { avatar: url });
      setProfileData(prev => ({ ...prev, avatar: url }));
      success("Avatar updated!");
    } catch (err) {
      error("Upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="kl-root">
      <Navbar />
      
      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
        <div style={{ display: 'flex', gap: '4rem' }} className="mobile-stack">
            <aside style={{ width: '280px', flexShrink: 0 }}>
                <div style={{ position: 'sticky', top: '8rem' }}>
                    <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem auto' }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-secondary)', border: '4px solid var(--bg)', boxShadow: 'var(--shadow)' }}>
                                {uploadingImage ? <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader className="animate-spin" size={24} /></div> : 
                                 profileData.avatar ? <img src={profileData.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
                                 <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={48} color="var(--text-light)" /></div>}
                            </div>
                            <label style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--accent)', color: 'var(--white)', padding: '0.6rem', borderRadius: '50%', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                                <Camera size={16} />
                                <input type="file" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                            </label>
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>{profileData.displayName}</h2>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{profileData.role}</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[
                            { id: 'profile', icon: User, label: 'Personal Info' },
                            { id: 'role', icon: profileData.role === 'buyer' ? MapPin : Building, label: profileData.role === 'buyer' ? 'Addresses' : 'Professional Info' },
                            { id: 'wallet', icon: Wallet, label: 'Finances' },
                            { id: 'referral', icon: Gift, label: 'Refer & Earn' },
                            { id: 'support', icon: MessageSquare, label: 'Help & Support' },
                            { id: 'security', icon: ShieldCheck, label: 'Security' }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{ 
                                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)',
                                    background: activeTab === tab.id ? 'var(--bg-secondary)' : 'transparent',
                                    color: activeTab === tab.id ? 'var(--text)' : 'var(--text-muted)',
                                    fontWeight: activeTab === tab.id ? '700' : '400',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <tab.icon size={18} /> {tab.label}
                            </button>
                        ))}
                        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', color: '#ef4444', fontSize: '0.9rem', marginTop: '1rem' }}>
                            <Settings size={18} /> Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Content Area */}
            <section style={{ flex: 1 }}>
                <div className="glass-panel" style={{ padding: '3.5rem', borderRadius: 'var(--radius-lg)' }}>
                    {activeTab === 'profile' && (
                        <div className="animate-fade-in">
                            <div style={{ marginBottom: '2.5rem' }}>
                                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Account Details</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Update your personal identity and contact information.</p>
                            </div>

                            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-light)' }}>Display Name</label>
                                        <input value={profileData.displayName} onChange={e => setProfileData({...profileData, displayName: e.target.value})} placeholder="Your Name" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-light)' }}>Phone Number</label>
                                        <input value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-light)' }}>Email Address</label>
                                    <input value={profileData.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Contact support to change your primary email.</p>
                                </div>
                                
                                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '2.5rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Mailing Address</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <input value={profileData.address.street} onChange={e => setProfileData({...profileData, address: {...profileData.address, street: e.target.value}})} placeholder="Street Address" />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                            <input value={profileData.address.city} onChange={e => setProfileData({...profileData, address: {...profileData.address, city: e.target.value}})} placeholder="City" />
                                            <input value={profileData.address.state} onChange={e => setProfileData({...profileData, address: {...profileData.address, state: e.target.value}})} placeholder="State" />
                                            <input value={profileData.address.pincode} onChange={e => setProfileData({...profileData, address: {...profileData.address, pincode: e.target.value}})} placeholder="Zip Code" />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '2rem' }} disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'role' && (
                        <div className="animate-fade-in">
                            {profileData.role === 'buyer' ? (
                                <div>
                                    <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Shipping Management</h2>
                                    <p style={{ color: 'var(--text-muted)' }}>Manage multiple shipping addresses for different gift recipients.</p>
                                    {/* Buyer specific UI - simplified for now */}
                                    <div style={{ padding: '3rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center', marginTop: '2rem' }}>
                                        <MapPin size={32} style={{ marginBottom: '1rem', color: 'var(--text-light)' }} />
                                        <p style={{ color: 'var(--text-muted)' }}>Primary address is synced with your profile.</p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ marginBottom: '2.5rem' }}>
                                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Professional Profile</h2>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Information visible to customers and used for payouts.</p>
                                    </div>

                                    <form onSubmit={handleUpdateRoleData} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-light)' }}>
                                                {profileData.role === 'seller' ? 'Business Name' : 'Studio Name'}
                                            </label>
                                            <input 
                                                value={profileData.role === 'seller' ? roleData.businessName : roleData.studioName} 
                                                onChange={e => setRoleData({...roleData, [profileData.role === 'seller' ? 'businessName' : 'studioName']: e.target.value})} 
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-light)' }}>Description / Bio</label>
                                            <textarea rows="4" value={roleData.bio} onChange={e => setRoleData({...roleData, bio: e.target.value})} placeholder="Tell your story..." />
                                        </div>

                                        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '2.5rem' }}>
                                            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Banking & Payouts</h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <input value={roleData.bankDetails.bankName} onChange={e => setRoleData({...roleData, bankDetails: {...roleData.bankDetails, bankName: e.target.value}})} placeholder="Bank Name" />
                                                <input value={roleData.bankDetails.ifsc} onChange={e => setRoleData({...roleData, bankDetails: {...roleData.bankDetails, ifsc: e.target.value}})} placeholder="IFSC Code" />
                                                <input style={{ gridColumn: 'span 2' }} value={roleData.bankDetails.accountNumber} onChange={e => setRoleData({...roleData, bankDetails: {...roleData.bankDetails, accountNumber: e.target.value}})} placeholder="Account Number" />
                                            </div>
                                        </div>

                                        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '2rem' }} disabled={loading}>
                                            {loading ? 'Saving...' : 'Update Professional Info'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'wallet' && (
                        <div className="animate-fade-in">
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Finances</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Manage your wallet, transactions and earnings.</p>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div className="glass-panel" style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-md)' }}>
                                    <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '1.5rem' }}>Primary Wallet</h3>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>₹0.00</div>
                                    <button onClick={() => navigate('/wallet')} className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }}>Manage Funds</button>
                                </div>
                                <div className="glass-panel" style={{ border: '1px solid var(--border)', padding: '2rem', borderRadius: 'var(--radius-md)' }}>
                                    <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '1.5rem' }}>Payout Status</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>No pending payouts.</p>
                                    <div style={{ marginTop: '3.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: '700' }}>
                                        View History <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'referral' && (
                        <div className="animate-fade-in">
                            <div style={{ marginBottom: '2.5rem' }}>
                                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Refer & Earn</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Share your referral link and earn rewards when friends join.</p>
                            </div>

                            {/* Referral Code Card */}
                            <div style={{ background: 'var(--gradient-soft)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>
                                <Gift size={36} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                                <p style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Your Referral Code</p>
                                <div style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                                    {referralData.code || 'Loading...'}
                                </div>
                                <button
                                    onClick={handleCopyCode}
                                    className="btn btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    {copiedCode ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Invite Link</>}
                                </button>
                            </div>

                            {/* Stats Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                {[
                                    { label: 'Friends Referred', value: referralData.stats.totalReferred || 0, color: 'var(--primary)' },
                                    { label: 'Pending Rewards', value: `₹${referralData.stats.pendingRewards || 0}`, color: 'var(--secondary)' },
                                    { label: 'Total Earned', value: `₹${referralData.stats.totalEarned || 0}`, color: 'var(--tertiary)' }
                                ].map(stat => (
                                    <div key={stat.label} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '2rem', fontWeight: '800', color: stat.color, marginBottom: '0.5rem' }}>{stat.value}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                                <strong style={{ color: 'var(--text)' }}>How it works:</strong> Share your link → Friend registers → Friend makes first purchase → You both earn ₹100 in wallet credits automatically.
                            </div>
                        </div>
                    )}

                    {activeTab === 'support' && (
                        <div className="animate-fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Help & Support</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track your support tickets and resolve platform issues.</p>
                                </div>
                                {!showGrievanceForm && (
                                    <button onClick={() => setShowGrievanceForm(true)} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>New Ticket</button>
                                )}
                            </div>

                            {showGrievanceForm ? (
                                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2.5rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Submit New Support Ticket</h3>
                                    <form onSubmit={handleGrievanceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-light)' }}>Category</label>
                                                <select 
                                                    value={grievanceData.category} 
                                                    onChange={e => setGrievanceData({...grievanceData, category: e.target.value})}
                                                    style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '8px', color: 'white' }}
                                                >
                                                    <option value="product_quality">Product Quality</option>
                                                    <option value="delivery_issue">Delivery Issue</option>
                                                    <option value="payment_issue">Payment Issue</option>
                                                    <option value="platform_issue">Platform Issue</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-light)' }}>Subject</label>
                                                <input 
                                                    type="text" required value={grievanceData.subject}
                                                    onChange={e => setGrievanceData({...grievanceData, subject: e.target.value})}
                                                    placeholder="Brief summary..."
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-light)' }}>Detailed Description</label>
                                            <textarea 
                                                required value={grievanceData.description}
                                                onChange={e => setGrievanceData({...grievanceData, description: e.target.value})}
                                                placeholder="Tell us more..."
                                                style={{ width: '100%', minHeight: '120px', background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '8px', color: 'white' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                            <button type="button" onClick={() => setShowGrievanceForm(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Ticket</button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {loadingGrievances ? (
                                        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading tickets...</div>
                                    ) : grievances.length > 0 ? (
                                        grievances.map(g => (
                                            <div key={g._id} style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                                                        <span style={{ fontWeight: '700', fontSize: '1rem' }}>{g.subject}</span>
                                                        <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: g.status === 'open' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', color: g.status === 'open' ? '#10b981' : 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>{g.status}</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ticket #{g._id.slice(-6).toUpperCase()} • Created on {new Date(g.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <ChevronRight size={18} color="var(--text-muted)" />
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
                                            <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                                            <p style={{ color: 'var(--text-muted)' }}>No support tickets found.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="animate-fade-in">
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Security</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Keep your account safe and manage your access.</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Password</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last changed 3 months ago</p>
                                    </div>
                                    <button className="btn btn-secondary">Update</button>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Two-Factor Authentication</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enhance security with a second step</p>
                                    </div>
                                    <button className="btn btn-secondary">Enable</button>
                                </div>
                                
                                <div style={{ marginTop: '4rem', padding: '2rem', border: '1px solid #ef444430', background: '#ef444405', borderRadius: 'var(--radius-md)' }}>
                                    <h4 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Danger Zone</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Once you delete your account, there is no going back. Please be certain.</p>
                                    <button className="btn" style={{ border: '1px solid #ef4444', color: '#ef4444' }}>Delete Account</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
