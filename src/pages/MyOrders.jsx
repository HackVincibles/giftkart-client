import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Package, Truck, Clock, CheckCircle, XCircle, ChevronRight, Search, Filter, Loader, Calendar } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const { error } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/payment/orders');
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        error("Failed to fetch orders.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const [processing, setProcessing] = useState(null);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order? The amount will be refunded to your wallet.")) return;
    try {
      setProcessing(orderId);
      const res = await axios.post(`/payment/orders/${orderId}/cancel`);
      if (res.data.success) {
        success(res.data.message || "Order cancelled successfully.");
        // Refresh orders immediately
        const ordersRes = await axios.get('/payment/orders');
        if (ordersRes.data.success) {
          setOrders(ordersRes.data.data);
        }
      }
    } catch (err) {
      error(err.response?.data?.message || "Failed to cancel order.");
      // Even if it fails with "already cancelled", refresh to sync UI
      const ordersRes = await axios.get('/payment/orders');
      if (ordersRes.data.success) setOrders(ordersRes.data.data);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'var(--success)';
      case 'pending': return 'var(--warning)';
      case 'shipped': return 'var(--accent-primary)';
      case 'delivered': return 'var(--success)';
      case 'cancelled': return 'var(--danger)';
      case 'refunded': return 'var(--accent-secondary)';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid': return 'Confirmed';
      case 'pending': return 'Payment Pending';
      case 'awaiting_creator': return 'Crafting';
      default: return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      
      <main className="container animate-fade-in" style={{ padding: '3rem 2rem', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Package size={36} color="var(--accent-primary)" /> My Orders
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Track your gifts and view your purchase history.</p>
          </div>

          <div className="glass-panel" style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', borderRadius: '12px' }}>
            {['all', 'pending', 'delivered', 'cancelled'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', textTransform: 'capitalize' }}
              >
                {f === 'all' ? 'Active' : f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
            <Loader className="animate-spin" color="var(--accent-primary)" size={48} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.filter(order => {
              if (filter === 'all') return !['cancelled', 'refunded', 'delivered'].includes(order.status);
              if (filter === 'cancelled') return ['cancelled', 'refunded'].includes(order.status);
              return order.status === filter;
            }).length > 0 ? (
              orders.filter(order => {
                if (filter === 'all') return !['cancelled', 'refunded', 'delivered'].includes(order.status);
                if (filter === 'cancelled') return ['cancelled', 'refunded'].includes(order.status);
                return order.status === filter;
              }).map(order => (
                <div key={order._id} className="glass-panel hover:scale-[1.01]" style={{ padding: '1.5rem', transition: 'all 0.2s', border: '1px solid var(--border-light)' }}>
                  {/* ... order card content (identical to before) ... */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                      <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          Order ID {order.isScheduledGift && <span style={{ background: 'var(--accent-secondary)20', color: 'var(--accent-secondary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>SCHEDULED GIFT</span>}
                        </p>
                        <p style={{ fontWeight: 'bold' }}>#{order._id.slice(-8).toUpperCase()}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Date Placed</p>
                        <p style={{ fontWeight: '500' }}>{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Amount</p>
                        <p style={{ fontWeight: 'bold', color: 'var(--accent-secondary)' }}>₹{order.amount}</p>
                      </div>
                    </div>
                    
                    <div style={{ 
                      background: `${getStatusColor(order.status)}15`, 
                      color: getStatusColor(order.status),
                      padding: '0.4rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      border: `1px solid ${getStatusColor(order.status)}30`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {order.status === 'paid' ? <CheckCircle size={14} /> : order.status === 'pending' ? <Clock size={14} /> : <XCircle size={14} />}
                      {getStatusLabel(order.status)}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                      {order.products.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                          <img 
                            src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/60'} 
                            alt={item.name} 
                            style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover' }} 
                          />
                          <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item.name || 'Gifts'}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      {['paid', 'pending'].includes(order.status) && (
                        <button 
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={!!processing}
                          className="btn btn-secondary" 
                          style={{ 
                              padding: '0.6rem 1rem', 
                              color: 'var(--danger)', 
                              borderColor: 'var(--danger)40',
                              opacity: processing === order._id ? 0.5 : 1,
                              cursor: processing === order._id ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {processing === order._id ? 'Processing...' : 'Cancel Order'}
                        </button>
                      )}
                      {!['cancelled', 'refunded'].includes(order.status) && (
                        <button 
                          onClick={() => navigate(`/tracking/${order._id}`)}
                          className="btn btn-primary" 
                          style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <Truck size={18} /> Track Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed var(--border-light)' }}>
                <Package size={64} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No {filter} orders</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>There are no orders to display in this category.</p>
                <button onClick={() => navigate('/buyer-dashboard')} className="btn btn-primary">Browse Marketplace</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyOrders;
