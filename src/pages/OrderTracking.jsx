import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Truck, Package, CheckCircle, Clock, MapPin, ChevronLeft, Calendar, User, Phone, Info, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const OrderTracking = () => {
  const { id } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { error } = useToast();

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await axios.get(`/order-tracking/${id}`);
        if (res.data.success) {
          setTracking(res.data.data);
        }
      } catch (err) {
        error("Failed to fetch tracking details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTracking();
  }, [id]);

  const stages = [
    { key: 'order_placed', label: 'Order Placed', description: 'Your order has been successfully placed.' },
    { key: 'confirmed', label: 'Order Confirmed', description: 'Payment verified and order confirmed by artisan.' },
    { key: 'processing', label: 'Processing', description: 'Artisan has started working on your custom gift.' },
    { key: 'quality_check', label: 'Quality Check', description: 'Final check for perfection before shipping.' },
    { key: 'shipped', label: 'Shipped', description: 'Your gift is out of the hub and on its way!' },
    { key: 'delivered', label: 'Delivered', description: 'Gift reached its destination! 🎁' }
  ];

  const getCurrentStageIndex = () => {
    if (!tracking) return -1;
    if (tracking.currentStage === 'cancelled') return -2;
    const idx = stages.findIndex(s => s.key === tracking.currentStage);
    return idx === -1 ? 0 : idx;
  };

  const currentIdx = getCurrentStageIndex();

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
    </div>
  );

  if (!tracking) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
        <AlertCircle size={64} color="var(--danger)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
        <h2>Tracking data unavailable</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>We couldn't find tracking information for this order.</p>
        <button onClick={() => navigate('/orders')} className="btn btn-primary">Back to Orders</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      
      <main className="container animate-fade-in" style={{ padding: '3rem 2rem' }}>
        <button 
          onClick={() => navigate('/orders')} 
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}
          className="hover:text-primary transition-colors"
        >
          <ChevronLeft size={20} /> Back to Orders
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          {/* Left Column: Timeline */}
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Track Order</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Order ID: <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>#{id.toUpperCase()}</span></p>
              </div>
              {tracking.currentStage === 'cancelled' && (
                <div style={{ background: 'var(--danger)20', color: 'var(--danger)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', border: '1px solid var(--danger)40' }}>
                  CANCELLED
                </div>
              )}
            </div>

            <div style={{ position: 'relative', paddingLeft: '3rem' }}>
              {/* Timeline Line */}
              <div style={{ 
                position: 'absolute', 
                left: '11px', 
                top: '10px', 
                bottom: '10px', 
                width: '2px', 
                background: 'var(--border-light)',
                zIndex: 1
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: `${(Math.max(0, currentIdx) / (stages.length - 1)) * 100}%`,
                  background: 'var(--accent-primary)',
                  transition: 'height 1s ease-in-out'
                }}></div>
              </div>

              {stages.map((stage, index) => {
                const isCompleted = index <= currentIdx;
                const isCurrent = index === currentIdx;
                
                return (
                  <div key={stage.key} style={{ marginBottom: '3rem', position: 'relative', zIndex: 2 }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '-31px', 
                      top: '0', 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      background: isCompleted ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      border: `2px solid ${isCompleted ? 'var(--accent-primary)' : 'var(--border-light)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      transition: 'all 0.3s'
                    }}>
                      {isCompleted ? <CheckCircle size={14} /> : <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }}></div>}
                    </div>
                    
                    <div>
                      <h4 style={{ 
                        margin: '0 0 0.25rem 0', 
                        color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontSize: '1.1rem'
                      }}>
                        {stage.label}
                        {isCurrent && <span style={{ marginLeft: '1rem', fontSize: '0.7rem', background: 'var(--accent-primary)20', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '4px', verticalAlign: 'middle' }}>CURRENT</span>}
                      </h4>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{stage.description}</p>
                      {isCompleted && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                          {/* We could use real timestamps from trackingEvents here */}
                          {tracking.trackingEvents.find(e => e.stage === stage.key)?.timestamp 
                            ? new Date(tracking.trackingEvents.find(e => e.stage === stage.key).timestamp).toLocaleString()
                            : ''}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Shipping Info */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={20} color="var(--accent-primary)" /> Shipping Address
              </h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <MapPin size={18} color="var(--text-muted)" style={{ marginTop: '0.2rem' }} />
                <div>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{tracking.deliveryAddress?.name}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    {tracking.deliveryAddress?.address}<br />
                    {tracking.deliveryAddress?.city}, {tracking.deliveryAddress?.state} - {tracking.deliveryAddress?.pincode}
                  </p>
                </div>
              </div>
            </div>

            {/* Courier Details */}
            {tracking.courierDetails?.courierName && (
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Package size={20} color="var(--accent-secondary)" /> Courier Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Courier</span>
                    <span style={{ fontWeight: '500' }}>{tracking.courierDetails.courierName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tracking ID</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{tracking.courierDetails.trackingNumber}</span>
                  </div>
                  {tracking.courierDetails.estimatedDeliveryDate && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Est. Delivery</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>
                        {new Date(tracking.courierDetails.estimatedDeliveryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Support Box */}
            <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Need Help?</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>If you have any issues with your delivery, our support team is here 24/7.</p>
              <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>Contact Support</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderTracking;
