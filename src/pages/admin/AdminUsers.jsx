import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { Search, User, Shield, RefreshCw, X, Mail, Phone, Calendar, Tag, Ban, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ── Custom Block Reason Modal ──────────────────────────────────
const BlockModal = ({ user, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');
  if (!user) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, backdropFilter: 'blur(6px)'
    }}>
      <div className="glass-panel" style={{
        width: '440px', padding: '2rem', borderRadius: '24px',
        border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 0 60px rgba(239,68,68,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.6rem', background: 'rgba(239,68,68,0.15)', borderRadius: '12px' }}>
            <Ban size={20} color="#ef4444" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Block User</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>This user won't be able to access the platform</p>
          </div>
        </div>

        <div style={{ padding: '0.875rem', background: 'rgba(239,68,68,0.06)', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid rgba(239,68,68,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#ef4444', flexShrink: 0 }}>
              {user.displayName?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{user.displayName}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
            </div>
          </div>
        </div>

        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.5rem' }}>
          Reason for blocking <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(optional)</span>
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Violated platform terms, spamming, fraud..."
          rows={3}
          className="input-field"
          style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.9rem' }}
        />

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button onClick={onCancel} className="btn btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason || 'Violated platform terms of service')}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
            }}>
            <Ban size={15} /> Block User
          </button>
        </div>
      </div>
    </div>
  );
};

// ── User Profile Modal ─────────────────────────────────────────
const UserModal = ({ user, onClose }) => {
  if (!user) return null;
  const roleColor = { admin: '#ef4444', creator: '#8b5cf6', buyer: '#10b981', unassigned: '#94a3b8' };
  const color = roleColor[user.role] || '#94a3b8';
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div className="glass-panel" onClick={e => e.stopPropagation()} style={{
        width: '420px', padding: '2rem', borderRadius: '24px',
        border: `1px solid ${color}40`, boxShadow: `0 0 40px ${color}20`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>User Profile</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: `${color}20`, border: `2px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: '800', color, flexShrink: 0, overflow: 'hidden' }}>
            {user.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.displayName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: '800' }}>{user.displayName}</p>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
              <span style={{ padding: '2px 10px', borderRadius: '20px', background: `${color}20`, color, fontSize: '0.72rem', fontWeight: '700', textTransform: 'capitalize' }}>{user.role}</span>
              {user.isBlocked && <span style={{ padding: '2px 10px', borderRadius: '20px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: '0.72rem', fontWeight: '700' }}>⛔ Blocked</span>}
            </div>
          </div>
        </div>
        {[
          { icon: Mail, label: 'Email', value: user.email },
          { icon: Phone, label: 'Phone', value: user.phoneNumber || 'Not provided' },
          { icon: Calendar, label: 'Joined', value: new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
          { icon: Tag, label: 'Auth', value: user.authMethod || 'local' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', marginBottom: '0.5rem' }}>
            <Icon size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '50px' }}>{label}</span>
            <span style={{ fontSize: '0.88rem', fontWeight: '500' }}>{value}</span>
          </div>
        ))}
        {user.isBlocked && user.blockReason && (
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(239,68,68,0.08)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
              <AlertTriangle size={13} color="#ef4444" />
              <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: '700', textTransform: 'uppercase' }}>Block Reason</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.blockReason}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────
const AdminUsers = () => {
  const { user: adminUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockTarget, setBlockTarget] = useState(null); // user to block
  const [actionLoading, setActionLoading] = useState(null);
  const { success, error } = useToast();

  useEffect(() => { fetchUsers(); }, [page, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      const res = await axios.get(`/admin/users?${params}`);
      if (res.data.success) {
        const filtered = res.data.data.users.filter(u => u._id !== adminUser?._id);
        setUsers(filtered);
        setPagination(res.data.data.pagination || {});
      }
    } catch (err) {
      error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const confirmBlock = async (reason) => {
    const u = blockTarget;
    setBlockTarget(null);
    try {
      setActionLoading(u._id);
      const res = await axios.put(`/admin/users/${u._id}/block`, { reason });
      if (res.data.success) {
        success(`⛔ ${u.displayName} blocked`);
        setUsers(prev => prev.map(usr => usr._id === u._id
          ? { ...usr, isBlocked: true, blockReason: reason, blockedAt: new Date() } : usr));
      }
    } catch { error('Failed to block user'); }
    finally { setActionLoading(null); }
  };

  const handleUnblock = async (u) => {
    try {
      setActionLoading(u._id);
      const res = await axios.put(`/admin/users/${u._id}/unblock`);
      if (res.data.success) {
        success(`✅ ${u.displayName} unblocked`);
        setUsers(prev => prev.map(usr => usr._id === u._id
          ? { ...usr, isBlocked: false, blockReason: null } : usr));
      }
    } catch { error('Failed to unblock user'); }
    finally { setActionLoading(null); }
  };

  const roleColor = (role) => ({ admin: '#ef4444', creator: '#8b5cf6', buyer: '#10b981' }[role] || '#94a3b8');

  return (
    <div className="animate-fade-in">
      {/* Modals */}
      {selectedUser && <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      {blockTarget && <BlockModal user={blockTarget} onConfirm={confirmBlock} onCancel={() => setBlockTarget(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.25rem' }}>User Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{pagination.total || 0} registered users</p>
        </div>
        <button onClick={fetchUsers} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" placeholder="Search by name or email..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ width: '100%', paddingLeft: '2.5rem' }} />
        </div>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-light)' }}>
              {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.73rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No users found.</td></tr>
            ) : users.map(u => {
              const color = roleColor(u.role);
              const blocked = u.isBlocked === true;
              const isActioning = actionLoading === u._id;
              return (
                <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: blocked ? 0.8 : 1 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${blocked ? '#ef4444' : color}20`, border: `1.5px solid ${blocked ? '#ef4444' : color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: blocked ? '#ef4444' : color, fontSize: '0.85rem', flexShrink: 0, overflow: 'hidden' }}>
                        {u.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (u.displayName?.[0]?.toUpperCase() || <User size={14} />)}
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', fontSize: '0.88rem' }}>{u.displayName}</p>
                        {blocked && <p style={{ fontSize: '0.65rem', color: '#ef4444' }}>⛔ Blocked</p>}
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{u.email}</td>

                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', background: `${color}18`, color, fontSize: '0.72rem', fontWeight: '700', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{u.role}</span>
                  </td>

                  <td style={{ padding: '0.875rem 1rem' }}>
                    {blocked
                      ? <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontSize: '0.72rem', fontWeight: '700', whiteSpace: 'nowrap' }}>Blocked</span>
                      : <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.12)', color: '#10b981', fontSize: '0.72rem', fontWeight: '700', whiteSpace: 'nowrap' }}>Active</span>
                    }
                  </td>

                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>

                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'nowrap' }}>
                      <button onClick={() => setSelectedUser(u)} className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-primary)', borderColor: 'rgba(139,92,246,0.3)', whiteSpace: 'nowrap' }}>
                        <Shield size={12} /> View
                      </button>

                      {blocked ? (
                        <button onClick={() => handleUnblock(u)} disabled={isActioning}
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', borderRadius: '8px', border: '1.5px solid rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.1)', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700', whiteSpace: 'nowrap', opacity: isActioning ? 0.6 : 1 }}>
                          <CheckCircle size={12} /> {isActioning ? '...' : 'Unblock'}
                        </button>
                      ) : (
                        <button onClick={() => u.role !== 'admin' && setBlockTarget(u)} disabled={isActioning || u.role === 'admin'}
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', borderRadius: '8px', border: '1.5px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: u.role === 'admin' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700', whiteSpace: 'nowrap', opacity: (isActioning || u.role === 'admin') ? 0.4 : 1 }}>
                          <Ban size={12} /> {isActioning ? '...' : 'Block'}
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

export default AdminUsers;
