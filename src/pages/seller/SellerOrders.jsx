import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { Package, Truck, CheckCircle, XCircle, Clock, ExternalLink, Search } from 'lucide-react';

const SellerOrders = () => {
  const { addToast, success: successToast, error: errorToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/seller-orders' + (statusFilter !== 'all' ? `?status=${statusFilter}` : ''));
      if (res.data.success) {
        setOrders(res.data.data.orders);
      }
    } catch (err) {
      errorToast('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await axios.put(`/api/seller-orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        successToast(`Order marked as ${newStatus}`);
        fetchOrders();
      }
    } catch (err) {
      errorToast(err.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(filter.toLowerCase()) || 
    o.buyer?.name?.toLowerCase().includes(filter.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#10b981';
      case 'shipped': return '#3b82f6';
      case 'processing': return '#f59e0b';
      case 'packed': return '#8b5cf6';
      case 'cancelled': return '#ef4444';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Orders Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track and fulfill your customer orders.</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer Name..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '3rem', marginBottom: 0 }}
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        >
          <option value="all">All Statuses</option>
          <option value="paid">Paid (New)</option>
          <option value="processing">Processing</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>Loading orders...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredOrders.length > 0 ? filteredOrders.map(order => (
            <div key={order._id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>Order #{order._id.slice(-8).toUpperCase()}</span>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: '700', 
                      textTransform: 'uppercase',
                      background: `${getStatusColor(order.status)}15`,
                      color: getStatusColor(order.status),
                      border: `1px solid ${getStatusColor(order.status)}30`
                    }}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--accent-primary)' }}>
                    ₹{order.totalAmount?.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.products?.length} Items</div>
                </div>
              </div>

              {/* Products List */}
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                {order.products.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: idx > 0 ? '0.75rem 0 0 0' : '0', borderTop: idx > 0 ? '1px solid var(--border-light)' : 'none' }}>
                    <img 
                      src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/50'} 
                      alt={item.product?.name} 
                      style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} 
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.product?.name || 'Unknown Product'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Qty: {item.quantity} × ₹{item.price}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Customer</div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{order.buyer?.name || 'Guest User'}</div>
                  </div>
                  {order.shippingAddress && (
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Ship To</div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {order.status === 'paid' && (
                    <button onClick={() => updateStatus(order._id, 'processing')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                      Mark Processing
                    </button>
                  )}
                  {order.status === 'processing' && (
                    <button onClick={() => updateStatus(order._id, 'packed')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                      Mark Packed
                    </button>
                  )}
                  {order.status === 'packed' && (
                    <button onClick={() => updateStatus(order._id, 'shipped')} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Truck size={14} /> Mark Shipped
                    </button>
                  )}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button onClick={() => updateStatus(order._id, 'cancelled')} style={{ background: 'none', border: '1px solid #ef444430', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px' }}>
              <Package size={48} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
              <h3>No orders found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>When customers buy your products, they will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
