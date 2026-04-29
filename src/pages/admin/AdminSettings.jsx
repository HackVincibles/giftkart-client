import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { Settings, Save, Shield, Percent, Bell, Globe } from 'lucide-react';

const AdminSettings = () => {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    platformCommission: 10,
    maxProductsPerSeller: 50,
    autoVerifySellers: false,
    maintenanceMode: false,
    allowNewRegistrations: true,
    reviewRequired: true,
    minWithdrawalAmount: 500,
    withdrawalCycledays: 7,
  });
  const { success, error } = useToast();

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await axios.put('/admin/settings', { settings });
      if (res.data.success) {
        success('Settings updated successfully!');
      }
    } catch (err) {
      error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const SettingRow = ({ label, desc, children }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', borderBottom: '1px solid var(--border-light)' }}>
      <div>
        <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{label}</p>
        {desc && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{desc}</p>}
      </div>
      <div>{children}</div>
    </div>
  );

  const Toggle = ({ value, onChange }) => (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: '48px', height: '26px', borderRadius: '13px',
        background: value ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
        cursor: 'pointer', position: 'relative', transition: 'background 0.3s ease'
      }}
    >
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%', background: 'white',
        position: 'absolute', top: '3px', left: value ? '25px' : '3px',
        transition: 'left 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }} />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.25rem' }}>System Settings</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Configure platform-wide rules and policies</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Percent size={20} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Financial Settings</h2>
          </div>
          <SettingRow label="Platform Commission (%)" desc="Commission taken from each seller sale">
            <input
              type="number" min={0} max={50}
              className="input-field"
              value={settings.platformCommission}
              onChange={e => handleChange('platformCommission', Number(e.target.value))}
              style={{ width: '100px', textAlign: 'center' }}
            />
          </SettingRow>
          <SettingRow label="Min Withdrawal (₹)" desc="Minimum amount sellers can withdraw">
            <input
              type="number" min={0}
              className="input-field"
              value={settings.minWithdrawalAmount}
              onChange={e => handleChange('minWithdrawalAmount', Number(e.target.value))}
              style={{ width: '120px', textAlign: 'center' }}
            />
          </SettingRow>
          <SettingRow label="Payout Cycle (days)" desc="Safety hold period before funds are released">
            <input
              type="number" min={1} max={30}
              className="input-field"
              value={settings.withdrawalCycledays}
              onChange={e => handleChange('withdrawalCycledays', Number(e.target.value))}
              style={{ width: '100px', textAlign: 'center' }}
            />
          </SettingRow>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Shield size={20} color="var(--warning)" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Seller Settings</h2>
          </div>
          <SettingRow label="Auto-Verify Sellers" desc="Automatically approve new sellers without review">
            <Toggle value={settings.autoVerifySellers} onChange={v => handleChange('autoVerifySellers', v)} />
          </SettingRow>
          <SettingRow label="Require Product Review" desc="Products must be reviewed before going live">
            <Toggle value={settings.reviewRequired} onChange={v => handleChange('reviewRequired', v)} />
          </SettingRow>
          <SettingRow label="Max Products Per Seller" desc="Limit on active listings per studio">
            <input
              type="number" min={1} max={500}
              className="input-field"
              value={settings.maxProductsPerSeller}
              onChange={e => handleChange('maxProductsPerSeller', Number(e.target.value))}
              style={{ width: '100px', textAlign: 'center' }}
            />
          </SettingRow>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Globe size={20} color="var(--accent-secondary)" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Platform Controls</h2>
          </div>
          <SettingRow label="Maintenance Mode" desc="Take the platform offline for maintenance">
            <Toggle value={settings.maintenanceMode} onChange={v => handleChange('maintenanceMode', v)} />
          </SettingRow>
          <SettingRow label="Allow New Registrations" desc="Enable or disable new user sign-ups">
            <Toggle value={settings.allowNewRegistrations} onChange={v => handleChange('allowNewRegistrations', v)} />
          </SettingRow>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(239,68,68,0.05), transparent)', borderColor: 'rgba(239,68,68,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Bell size={20} color="var(--danger)" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Danger Zone</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            These actions are irreversible. Proceed with extreme caution.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn btn-secondary" style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)', textAlign: 'left' }}>
              Clear All Pending Orders
            </button>
            <button className="btn btn-secondary" style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)', textAlign: 'left' }}>
              Revoke All Seller Verifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
