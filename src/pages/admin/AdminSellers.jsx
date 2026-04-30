import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { Search, CheckCircle, XCircle, AlertCircle, RefreshCw, Store } from 'lucide-react';

const statusStyle = (status) => {
  const map = {
    verified: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Verified' },
    pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Pending' },
    rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Rejected' },
    suspended: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', label: 'Suspended' },
  };
  return map[status] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', label: status };
};

const AdminSellers = () => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending'); // Default to pending for quick approval flow
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const { success, error } = useToast();

  useEffect(() => { fetchSellers(); }, [page, search, statusFilter]);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (statusFilter) params.append('verificationStatus', statusFilter);
      const res = await axios.get(`/admin/sellers?${params}`);
      if (res.data.success) {
        setCreators(res.data.data.sellers);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      error('Failed to load sellers');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (sellerId, businessName) => {
    if (!window.confirm(`Approve "${businessName}" as a verified seller? They will be able to list products on the marketplace.`)) return;
    try {
      setActionLoading(sellerId + '_verify');
      const res = await axios.put(`/admin/sellers/${sellerId}/verify`);
      if (res.data.success) { success(`✅ ${businessName} is now verified!`); fetchSellers(); }
    } catch (err) { error('Failed to verify seller'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (sellerId, businessName) => {
    const reason = prompt(`Reason for rejecting "${businessName}":`) || 'Did not meet platform requirements';
    try {
      setActionLoading(sellerId + '_reject');
      const res = await axios.put(`/admin/sellers/${sellerId}/reject`, { reason });
      if (res.data.success) { success(`${businessName} has been rejected`); fetchSellers(); }
    } catch (err) { error('Failed to reject seller'); }
    finally { setActionLoading(null); }
  };

  const handleSuspend = async (sellerId, businessName) => {
    const reason = prompt(`Reason for suspending "${businessName}":`);
    if (!reason) return;
    try {
      setActionLoading(sellerId + '_suspend');
      const res = await axios.put(`/admin/sellers/${sellerId}/suspend`, { reason });
      if (res.data.success) { success(`${businessName} suspended`); fetchSellers(); }
    } catch (err) { error('Failed to suspend seller'); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.25rem' }}>Creator Verification</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{pagination.total || 0} creators · Pending creators require your approval to list products</p>
        </div>
        <button onClick={fetchSellers} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Status filter pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { value: '', label: 'All' },
          { value: 'pending', label: '🕐 Pending Approval' },
          { value: 'verified', label: '✅ Verified' },
          { value: 'rejected', label: '❌ Rejected' },
          { value: 'suspended', label: '⛔ Suspended' },
        ].map(s => (
          <button key={s.value} onClick={() => { setStatusFilter(s.value); setPage(1); }}
            className={statusFilter === s.value ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" placeholder="Search business name or email..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ width: '100%', paddingLeft: '2.5rem' }} />
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-light)' }}>
              {['Business', 'Owner', 'Contact', 'PAN / GST', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading creators...</td></tr>
            ) : creators.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <Store size={48} style={{ opacity: 0.15, display: 'block', margin: '0 auto 1rem' }} />
                  <p>{statusFilter === 'pending' ? '🎉 No pending creators! All caught up.' : 'No creators found.'}</p>
                </td>
              </tr>
            ) : creators.map(seller => {
              const { color, bg, label } = statusStyle(seller.creatorProfile?.verificationStatus || 'pending');
              const businessName = seller.creatorProfile?.businessName || seller.displayName;
              const isLoading = actionLoading?.startsWith(seller._id);
              return (
                <tr key={seller._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color, fontSize: '1rem', flexShrink: 0 }}>
                        {businessName[0] || <Store size={16} />}
                      </div>
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{businessName}</p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Joined {new Date(seller.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.88rem' }}>{seller.displayName}</td>
                  <td style={{ padding: '1rem' }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{seller.email}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{seller.phoneNumber || seller.creatorProfile?.phone}</p>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{seller.creatorProfile?.panNumber || 'N/A'}</p>
                    {seller.creatorProfile?.gstNumber && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GST: {seller.creatorProfile.gstNumber}</p>}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', background: bg, color, fontSize: '0.75rem', fontWeight: '700' }}>
                      {label}
                    </span>
                    {seller.creatorProfile?.rejectionReason && (
                      <p style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: '0.25rem' }}>Reason: {seller.creatorProfile.rejectionReason}</p>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {seller.creatorProfile?.verificationStatus === 'pending' && (
                        <>
                          <button onClick={() => handleVerify(seller._id, businessName)} disabled={isLoading}
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button onClick={() => handleReject(seller._id, businessName)} disabled={isLoading}
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                            <XCircle size={13} /> Reject
                          </button>
                        </>
                      )}
                      {seller.creatorProfile?.verificationStatus === 'verified' && (
                        <button onClick={() => handleSuspend(seller._id, businessName)} disabled={isLoading}
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#94a3b8', borderColor: 'rgba(148,163,184,0.2)' }}>
                          <AlertCircle size={13} /> Suspend
                        </button>
                      )}
                      {(seller.creatorProfile?.verificationStatus === 'suspended' || seller.creatorProfile?.verificationStatus === 'rejected') && (
                        <button onClick={() => handleVerify(seller._id, businessName)} disabled={isLoading}
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>
                          <CheckCircle size={13} /> Re-approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Prev</button>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Page {page} of {pagination.pages}</span>
            <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSellers;
