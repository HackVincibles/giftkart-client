import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { RefreshCw, MessageSquare, CheckCircle } from 'lucide-react';

const statusStyle = (status) => {
  const map = {
    open: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    'in-progress': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    resolved: { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    closed: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  };
  return map[status] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
};

const AdminGrievances = () => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [resolving, setResolving] = useState(null);
  const { success, error } = useToast();

  useEffect(() => { fetchGrievances(); }, [page, statusFilter]);

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.append('status', statusFilter);
      const res = await axios.get(`/admin/grievances?${params}`);
      if (res.data.success) {
        setGrievances(res.data.data.grievances);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      error('Failed to load grievances');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (grievanceId) => {
    const resolution = prompt('Enter resolution type (refund / replacement / explanation / other):') || 'other';
    const notes = prompt('Enter resolution notes:') || '';
    try {
      setResolving(grievanceId);
      const res = await axios.put(`/admin/grievances/${grievanceId}/resolve`, { resolution, resolutionNotes: notes });
      if (res.data.success) {
        success('Grievance resolved!');
        fetchGrievances();
      }
    } catch (err) {
      error('Failed to resolve grievance');
    } finally {
      setResolving(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.25rem' }}>Grievance Center</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{pagination.total || 0} total support tickets</p>
        </div>
        <button onClick={fetchGrievances} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <select className="input-field" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ width: '180px' }}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading grievances...</div>
        ) : grievances.length === 0 ? (
          <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
            <p>No grievances found.</p>
          </div>
        ) : grievances.map(g => {
          const { color, bg } = statusStyle(g.status);
          return (
            <div key={g._id} className="glass-panel" style={{ padding: '1.5rem', border: g.status === 'open' ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '700', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>#{g._id.slice(-6).toUpperCase()}</span>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', background: bg, color, fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>{g.status}</span>
                    {g.category && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{g.category}</span>}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem' }}>{g.subject || 'No Subject'}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{g.description}</p>
                </div>
                <div style={{ textAlign: 'right', marginLeft: '2rem' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>{g.user?.name || 'Unknown'}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.user?.email}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{new Date(g.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {g.status === 'open' || g.status === 'in-progress' ? (
                <button
                  onClick={() => handleResolve(g._id)}
                  disabled={resolving === g._id}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--success)', borderColor: 'rgba(16,185,129,0.3)' }}
                >
                  <CheckCircle size={16} /> {resolving === g._id ? 'Resolving...' : 'Mark Resolved'}
                </button>
              ) : (
                g.resolutionNotes && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(16,185,129,0.05)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--success)' }}>Resolution: </strong>{g.resolutionNotes}
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>

      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1.5rem' }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Prev</button>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Page {page} of {pagination.pages}</span>
          <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Next</button>
        </div>
      )}
    </div>
  );
};

export default AdminGrievances;
