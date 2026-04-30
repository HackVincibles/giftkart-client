import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Package, Truck, Clock, CheckCircle, XCircle, ChevronRight, Search, Filter, Loader, Calendar, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import ArtisanChat from '../components/ArtisanChat';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returns, setReturns] = useState([]);
  const [viewingReturns, setViewingReturns] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    fetchOrders();
    fetchReturns();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/payment/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      error("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReturns = async () => {
    try {
      const res = await axios.get('/returns/my-returns');
      if (res.data.success) {
        setReturns(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch returns", err);
    }
  };

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
    if (filter === 'all') return !['cancelled', 'refunded', 'delivered'].includes(order.status);
    if (filter === 'cancelled') return ['cancelled', 'refunded'].includes(order.status);
    if (filter === 'returns') return false; // Handled by separate list
    return order.status === filter;
  });

  const handleReturnRequest = (order) => {
    setSelectedOrder(order);
    setShowReturnModal(true);
  };

  const submitReturn = async (formData) => {
    try {
      setReturnLoading(true);
      const res = await axios.post('/returns/request', {
        orderId: selectedOrder._id,
        ...formData,
        items: selectedOrder.products.map(p => ({
          product: p.product?._id || p._id,
          quantity: p.quantity
        }))
      });
      if (res.data.success) {
        success("Return request submitted successfully!");
        setShowReturnModal(false);
        fetchReturns();
        fetchOrders();
      }
    } catch (err) {
      error(err.response?.data?.message || "Failed to submit return request");
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <div className="kl-root" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      
      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-light)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1rem' }}>
            <Package size={14} /> Account Activity
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem', lineHeight: '1.1' }}>Order History</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Track, manage and view details of your curated gift collections.</p>
            </div>

            <div className="glass-panel" style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
              {['all', 'pending', 'delivered', 'returns', 'cancelled'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{ 
                    padding: '0.6rem 1.2rem', 
                    borderRadius: 'var(--radius-full)', 
                    fontSize: '0.8rem', 
                    fontWeight: '700',
                    transition: 'all 0.3s',
                    background: filter === f ? 'var(--text)' : 'transparent',
                    color: filter === f ? 'var(--bg)' : 'var(--text-muted)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem 0' }}>
            <Loader className="animate-spin" color="var(--accent)" size={48} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {filter === 'returns' ? (
              returns.length > 0 ? (
                returns.map(ret => (
                  <div key={ret._id} className="glass-panel hover-lift" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Return Request</div>
                        <h3 style={{ fontSize: '1.5rem', margin: 0 }}>#{ret._id.slice(-8).toUpperCase()}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>For Order #{ret.order?._id?.slice(-8).toUpperCase()}</p>
                      </div>
                      <div style={{ background: 'var(--accent)15', color: 'var(--accent)', padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>
                        {ret.status}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                       <div>
                         <p style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Reason</p>
                         <p style={{ margin: 0, fontWeight: '500' }}>{ret.reason}</p>
                       </div>
                       <div>
                         <p style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Refund Amount</p>
                         <p style={{ margin: 0, fontWeight: '800', fontSize: '1.2rem', color: 'var(--accent)' }}>₹{ret.refundAmount}</p>
                       </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState icon={<Package size={48} />} title="No returns found" description="You haven't requested any returns yet." action={() => setFilter('all')} actionLabel="Back to Active" />
              )
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <div key={order._id} className="glass-panel hover-lift" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ color: 'var(--text-light)', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Order Information</p>
                        <p style={{ fontWeight: '800', fontSize: '1.1rem' }}>#{order._id.slice(-8).toUpperCase()}</p>
                        {order.isScheduledGift && <span style={{ display: 'inline-block', marginTop: '0.5rem', background: 'var(--accent)20', color: 'var(--accent)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '900', textTransform: 'uppercase' }}>Scheduled Gift</span>}
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-light)', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Date Placed</p>
                        <p style={{ fontWeight: '500' }}>{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-light)', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Total Amount</p>
                        <p style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text)' }}>₹{order.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div style={{ 
                      background: `${getStatusColor(order.status)}15`, 
                      color: getStatusColor(order.status),
                      padding: '0.6rem 1.5rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      border: `1px solid ${getStatusColor(order.status)}30`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {getStatusLabel(order.status)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      {order.products.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.8rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                          <div style={{ width: '50px', height: '50px', borderRadius: '10px', overflow: 'hidden' }}>
                            <img 
                              src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/100'} 
                              alt={item.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          </div>
                          <div>
                            <p style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.2rem' }}>{item.name || 'Gifts'}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quantity: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button 
                        onClick={() => navigate(`/tracking/${order._id}`)}
                        className="btn btn-primary" 
                        style={{ padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                      >
                        <Truck size={18} /> Track Shipment
                      </button>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => setActiveChat({
                              orderId: order._id,
                              recipientId: order.products?.[0]?.product?.creator || order.products?.[0]?.creator,
                              recipientName: "Gift Artisan"
                          })}
                          className="btn btn-secondary" 
                          style={{ width: '45px', height: '45px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Message Artisan"
                        >
                          <MessageSquare size={18} />
                        </button>
                        {order.status === 'delivered' && (
                          <button 
                            onClick={() => handleReturnRequest(order)}
                            className="btn btn-secondary" 
                            style={{ color: '#ef4444', borderColor: '#ef444430' }}
                          >
                            Return
                          </button>
                        )}
                        {['paid', 'pending'].includes(order.status) && (
                          <button 
                            onClick={() => handleCancelOrder(order._id)}
                            disabled={processing === order._id}
                            className="btn btn-secondary" 
                            style={{ color: '#ef4444', borderColor: '#ef444430' }}
                          >
                            {processing === order._id ? '...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState 
                icon={<Package size={64} />} 
                title={`No ${filter} orders`} 
                description={`You haven't placed any orders that match the "${filter}" status yet.`}
                action={() => navigate('/buyer-dashboard')}
                actionLabel="Explore Marketplace"
              />
            )}
          </div>
        )}
      </main>

      {activeChat && (
        <ArtisanChat 
            orderId={activeChat.orderId}
            recipientId={activeChat.recipientId}
            recipientName={activeChat.recipientName}
            onClose={() => setActiveChat(null)}
        />
      )}

      {showReturnModal && (
        <ReturnRequestModal 
          order={selectedOrder}
          onClose={() => setShowReturnModal(false)}
          onSubmit={submitReturn}
          loading={returnLoading}
        />
      )}
    </div>
  );
};

const EmptyState = ({ icon, title, description, action, actionLabel }) => (
  <div style={{ textAlign: 'center', padding: '8rem 2rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
    <div style={{ color: 'var(--text-light)', marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{title}</h2>
    <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '400px', margin: '0 auto 3rem auto', lineHeight: '1.6' }}>{description}</p>
    <button onClick={action} className="btn btn-primary" style={{ padding: '1rem 2.5rem' }}>{actionLabel}</button>
  </div>
);

const ReturnRequestModal = ({ order, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    refundType: 'wallet',
    pickupAddress: order?.shippingAddress || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
      <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '550px', padding: '3rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Request Return</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Order #{order?._id.slice(-8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><XCircle size={28} /></button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8rem', color: 'var(--text-light)' }}>Reason for Return</label>
              <select name="reason" value={formData.reason} onChange={handleChange} required style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--text)' }}>
                <option value="">Select a reason</option>
                <option value="Damaged product">Damaged product</option>
                <option value="Wrong item received">Wrong item received</option>
                <option value="Quality not as expected">Quality not as expected</option>
                <option value="Product defective">Product defective</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8rem', color: 'var(--text-light)' }}>Detailed Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required placeholder="Tell us more about the issue..." style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--text)', minHeight: '120px', resize: 'vertical' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8rem', color: 'var(--text-light)' }}>Pickup Address</label>
              <input name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} required style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--text)' }} />
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '1rem' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1, padding: '1rem' }}>Go Back</button>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1, padding: '1rem' }}>
                {loading ? <Loader className="animate-spin" size={20} /> : 'Submit Request'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyOrders;
