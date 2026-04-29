import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { RefreshCw, ShoppingBag, Truck, ChevronDown } from 'lucide-react';

const STATUS_FLOW = [
  { value: 'pending', label: 'Pending', color: '#94a3b8' },
  { value: 'confirmed', label: 'Confirmed', color: '#3b82f6' },
  { value: 'processing', label: 'Processing', color: '#f59e0b' },
  { value: 'quality_check', label: 'Quality Check', color: '#8b5cf6' },
  { value: 'packed', label: 'Packed', color: '#06b6d4' },
  { value: 'shipped', label: 'Shipped', color: '#10b981' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: '#22c55e' },
  { value: 'delivered', label: 'Delivered', color: '#16a34a' },
  { value: 'cancelled', label: 'Cancelled', color: '#ef4444' },
];

const getStatusInfo = (val) => STATUS_FLOW.find(s => s.value === val) || { label: val, color: '#94a3b8' };

const StatusDropdown = ({ orderId, currentStatus, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = React.useRef(null);
  const { success, error } = useToast();
  const current = getStatusInfo(currentStatus);

  // Close on any outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleToggle = (e) => {
    e.stopPropagation();
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    setOpen(o => !o);
  };

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [location, setLocation] = useState('Central Hub');
  const [note, setNote] = useState('');

  const handleSelect = (newStatus) => {
    if (newStatus === currentStatus) { setOpen(false); return; }
    setOpen(false);
    setPendingStatus(newStatus);
    setNote(`Order status updated to ${getStatusInfo(newStatus).label}`);
    setShowDetailsModal(true);
  };

  const confirmUpdate = async () => {
    try {
      setLoading(true);
      setShowDetailsModal(false);
      const res = await axios.put(`/admin/orders/${orderId}/status`, { 
        status: pendingStatus,
        location,
        note
      });
      if (res.data.success) {
        success(`Status → ${getStatusInfo(pendingStatus).label}`);
        onUpdate(orderId, pendingStatus);
      }
    } catch (err) {
      error('Failed to update status');
    } finally {
      setLoading(false);
      setPendingStatus(null);
    }
  };

  const menu = open ? ReactDOM.createPortal(
    <div
      onMouseDown={e => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        zIndex: 99999,
        minWidth: '190px',
        background: '#1e1e2e',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '14px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
        padding: '0.5rem',
        maxHeight: '340px',
        overflowY: 'auto',
      }}
    >
      {STATUS_FLOW.map(s => (
        <button
          key={s.value}
          onClick={() => handleSelect(s.value)}
          style={{
            width: '100%', textAlign: 'left', padding: '0.65rem 0.85rem',
            borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: s.value === currentStatus ? `${s.color}25` : 'transparent',
            color: s.value === currentStatus ? s.color : '#cbd5e1',
            fontSize: '0.85rem', fontWeight: s.value === currentStatus ? '700' : '400',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${s.color}20`; e.currentTarget.style.color = s.color; }}
          onMouseLeave={e => {
            e.currentTarget.style.background = s.value === currentStatus ? `${s.color}25` : 'transparent';
            e.currentTarget.style.color = s.value === currentStatus ? s.color : '#cbd5e1';
          }}
        >
          <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: s.color, flexShrink: 0, boxShadow: `0 0 6px ${s.color}` }} />
          {s.label}
        </button>
      ))}
    </div>,
    document.body
  ) : null;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={btnRef}
        onClick={handleToggle}
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.45rem 0.85rem', borderRadius: '20px',
          border: `1.5px solid ${current.color}60`,
          background: `${current.color}18`, color: current.color,
          cursor: loading ? 'wait' : 'pointer',
          fontSize: '0.78rem', fontWeight: '700', whiteSpace: 'nowrap',
          minWidth: '140px', justifyContent: 'space-between',
          transition: 'all 0.2s',
        }}
      >
        <span>{loading ? 'Saving...' : current.label}</span>
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s ease' }} />
      </button>
      {menu}
      
      {showDetailsModal && ReactDOM.createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)', zIndex: 100000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)'
        }}>
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '450px', width: '90%' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} color="var(--accent-primary)" /> Update Tracking Details
            </h3>
            
            <div className="input-group">
              <label className="input-label">Current Location</label>
              <input 
                type="text" 
                className="input-field" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai Hub, In Transit"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Detailed Note (Visible to User)</label>
              <textarea 
                className="input-field" 
                style={{ minHeight: '80px', resize: 'vertical' }}
                value={note} 
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Package has reached the local sorting facility."
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmUpdate} 
                className="btn btn-primary" 
                style={{ flex: 2 }}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};


const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const { error } = useToast();

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.append('status', statusFilter);
      const res = await axios.get(`/admin/orders?${params}`);
      if (res.data.success) {
        setOrders(res.data.data.orders);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <Truck size={22} color="var(--accent-primary)" />
            <h1 style={{ fontSize: '2rem', fontWeight: '900' }}>Orders & Logistics</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>{pagination.total || 0} total orders — update delivery status below</p>
        </div>
        <button onClick={fetchOrders} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Status filter pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <button onClick={() => { setStatusFilter(''); setPage(1); }}
          style={{ padding: '0.35rem 0.85rem', borderRadius: '20px', border: '1.5px solid var(--border-light)', background: !statusFilter ? 'var(--accent-primary)' : 'transparent', color: !statusFilter ? 'white' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>
          All
        </button>
        {STATUS_FLOW.map(s => (
          <button key={s.value} onClick={() => { setStatusFilter(s.value); setPage(1); }}
            style={{ padding: '0.35rem 0.85rem', borderRadius: '20px', border: `1.5px solid ${s.color}40`, background: statusFilter === s.value ? `${s.color}20` : 'transparent', color: statusFilter === s.value ? s.color : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-light)' }}>
              {['Order ID', 'Customer', 'Amount', 'Payment', 'Date', 'Delivery Status'].map(h => (
                <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <ShoppingBag size={48} style={{ opacity: 0.15, display: 'block', margin: '0 auto 1rem' }} />
                  <p>No orders found.</p>
                </td>
              </tr>
            ) : orders.map(order => (
              <tr key={order._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontWeight: '700', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <p style={{ fontWeight: '600', fontSize: '0.88rem' }}>{order.buyer?.name || 'Customer'}</p>
                  <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{order.buyer?.email || ''}</p>
                </td>
                <td style={{ padding: '1rem', fontWeight: '700' }}>₹{(order.amount || 0).toLocaleString()}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                  {order.paymentMethod || '—'}
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <StatusDropdown
                    orderId={order._id}
                    currentStatus={order.status}
                    onUpdate={handleStatusUpdate}
                  />
                </td>
              </tr>
            ))}
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

export default AdminOrders;
