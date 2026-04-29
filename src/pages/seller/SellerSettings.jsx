import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { Save, User, Bell, Link as LinkIcon, Building2, CreditCard } from 'lucide-react';

const SellerSettings = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    description: '',
    website: '',
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: ''
    },
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      accountHolderName: '',
      upiId: ''
    },
    preferences: {
      emailNotifications: true,
      orderAlerts: true,
      marketingEmails: false
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/seller-auth/profile');
      if (res.data.success) {
        const profile = res.data.data;
        setFormData({
          businessName: profile.businessName || '',
          ownerName: profile.ownerName || '',
          phone: profile.phone || '',
          description: profile.description || '',
          website: profile.website || '',
          socialMedia: {
            instagram: profile.socialMedia?.instagram || '',
            facebook: profile.socialMedia?.facebook || '',
            twitter: profile.socialMedia?.twitter || ''
          },
          bankDetails: {
            accountNumber: profile.bankDetails?.accountNumber || '',
            ifscCode: profile.bankDetails?.ifscCode || '',
            bankName: profile.bankDetails?.bankName || '',
            accountHolderName: profile.bankDetails?.accountHolderName || '',
            upiId: profile.bankDetails?.upiId || ''
          },
          preferences: {
            emailNotifications: profile.preferences?.emailNotifications ?? true,
            orderAlerts: profile.preferences?.orderAlerts ?? true,
            marketingEmails: profile.preferences?.marketingEmails ?? false
          }
        });
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to load profile data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('social_')) {
      const socialKey = name.split('_')[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: { ...prev.socialMedia, [socialKey]: value }
      }));
    } else if (name.startsWith('bank_')) {
      const bankKey = name.split('_')[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, [bankKey]: value }
      }));
    } else if (name.startsWith('pref_')) {
      const prefKey = name.split('_')[1];
      setFormData(prev => ({
        ...prev,
        preferences: { ...prev.preferences, [prefKey]: checked }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await axios.put('/seller-auth/profile', formData);
      if (res.data.success) {
        addToast({ type: 'success', message: 'Settings saved successfully!' });
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading settings...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Store Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your studio profile and preferences.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('profile')}
          style={{ background: 'none', border: 'none', color: activeTab === 'profile' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'profile' ? '600' : '400', cursor: 'pointer', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Building2 size={18} /> Business Profile
        </button>
        <button 
          onClick={() => setActiveTab('payouts')}
          style={{ background: 'none', border: 'none', color: activeTab === 'payouts' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'payouts' ? '600' : '400', cursor: 'pointer', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <CreditCard size={18} /> Payouts & Bank
        </button>
        <button 
          onClick={() => setActiveTab('notifications')}
          style={{ background: 'none', border: 'none', color: activeTab === 'notifications' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'notifications' ? '600' : '400', cursor: 'pointer', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Bell size={18} /> Notifications
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Basic Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="input-group">
                  <label className="input-label">Business Name</label>
                  <input type="text" className="input-field" name="businessName" value={formData.businessName} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Owner Name</label>
                  <input type="text" className="input-field" name="ownerName" value={formData.ownerName} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input type="tel" className="input-field" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Website</label>
                  <input type="url" className="input-field" name="website" placeholder="https://" value={formData.website} onChange={handleChange} />
                </div>
              </div>
              <div className="input-group" style={{ marginTop: '1.5rem' }}>
                <label className="input-label">About Your Studio</label>
                <textarea className="input-field" name="description" rows="4" value={formData.description} onChange={handleChange}></textarea>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LinkIcon size={18} /> Social Links
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Instagram Handle</label>
                  <input type="text" className="input-field" name="social_instagram" placeholder="@username" value={formData.socialMedia.instagram} onChange={handleChange} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Facebook Page</label>
                  <input type="text" className="input-field" name="social_facebook" placeholder="facebook.com/page" value={formData.socialMedia.facebook} onChange={handleChange} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Twitter</label>
                  <input type="text" className="input-field" name="social_twitter" placeholder="@username" value={formData.socialMedia.twitter} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payouts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Bank Account Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="input-group">
                  <label className="input-label">Account Holder Name</label>
                  <input type="text" className="input-field" name="bank_accountHolderName" value={formData.bankDetails.accountHolderName} onChange={handleChange} placeholder="As per bank records" />
                </div>
                <div className="input-group">
                  <label className="input-label">Bank Name</label>
                  <input type="text" className="input-field" name="bank_bankName" value={formData.bankDetails.bankName} onChange={handleChange} placeholder="e.g., HDFC Bank" />
                </div>
                <div className="input-group">
                  <label className="input-label">Account Number</label>
                  <input type="text" className="input-field" name="bank_accountNumber" value={formData.bankDetails.accountNumber} onChange={handleChange} placeholder="Enter your bank account number" />
                </div>
                <div className="input-group">
                  <label className="input-label">IFSC Code</label>
                  <input type="text" className="input-field" name="bank_ifscCode" value={formData.bankDetails.ifscCode} onChange={handleChange} placeholder="11-digit alphanumeric code" />
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Digital Payouts (UPI)</h3>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">UPI ID</label>
                <input type="text" className="input-field" name="bank_upiId" placeholder="username@bank" value={formData.bankDetails.upiId} onChange={handleChange} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Used for faster settlements. Funds will be sent to this ID if provided.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Email Preferences</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                <input type="checkbox" name="pref_emailNotifications" checked={formData.preferences.emailNotifications} onChange={handleChange} style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }} />
                <div>
                  <div style={{ fontWeight: '500' }}>General Email Notifications</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Receive emails about account updates and system notices.</div>
                </div>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                <input type="checkbox" name="pref_orderAlerts" checked={formData.preferences.orderAlerts} onChange={handleChange} style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }} />
                <div>
                  <div style={{ fontWeight: '500' }}>Order Alerts</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Get notified immediately when a new order is placed for your products.</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                <input type="checkbox" name="pref_marketingEmails" checked={formData.preferences.marketingEmails} onChange={handleChange} style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }} />
                <div>
                  <div style={{ fontWeight: '500' }}>Marketing & Insights</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Receive weekly AI-generated insights and trend reports for your studio.</div>
                </div>
              </label>
            </div>
          </div>
        )}

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem' }}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerSettings;
