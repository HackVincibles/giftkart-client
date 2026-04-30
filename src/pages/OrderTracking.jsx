import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  Truck, Package, CheckCircle, Clock, MapPin, 
  ChevronLeft, Calendar, User, Phone, Info, 
  AlertCircle, ShieldCheck, Zap, Navigation, 
  Box, ArrowRight, RefreshCw 
} from 'lucide-react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { error, success, info: toastInfo } = useToast();
  
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  const STAGES = [
    { key: 'order_placed', label: 'Ordered', icon: <Package size={18} /> },
    { key: 'confirmed', label: 'Confirmed', icon: <ShieldCheck size={18} /> },
    { key: 'processing', label: 'Processing', icon: <RefreshCw size={18} /> },
    { key: 'shipped', label: 'Shipped', icon: <Truck size={18} /> },
    { key: 'delivered', label: 'Delivered', icon: <CheckCircle size={18} /> }
  ];

  const fetchTracking = async () => {
    try {
      const res = await axios.get(`/order-tracking/${id}`);
      if (res.data.success) {
        setTracking(res.data.data);
        updateActiveStep(res.data.data.currentStage);
      }
    } catch (err) {
      error("Tracking ID invalid or missing.");
    } finally {
      setLoading(false);
    }
  };

  const updateActiveStep = (stage) => {
    const idx = STAGES.findIndex(s => s.key === stage);
    if (idx !== -1) setActiveStep(idx);
    else if (stage === 'out_for_delivery') setActiveStep(3);
    else if (stage === 'handed_to_courier') setActiveStep(3);
    else if (stage === 'quality_check' || stage === 'packaging') setActiveStep(2);
  };

  useEffect(() => {
    fetchTracking();
    
    if (socket) {
        socket.emit('join-order', id);
        
        socket.on('order-status-change', (data) => {
            if (data.orderId === id) {
                toastInfo(`Order update: ${data.description}`);
                fetchTracking(); // Refresh data
            }
        });

        socket.on('tracking-update', (data) => {
            if (data.orderId === id) {
                fetchTracking();
            }
        });

        return () => {
            socket.emit('leave-order', id);
            socket.off('order-status-change');
            socket.off('tracking-update');
        };
    }
  }, [id, socket]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="animate-spin" style={{ width: '50px', height: '50px', border: '4px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
    </div>
  );

  if (!tracking) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <AlertCircle size={40} color="var(--danger)" />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Journey Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px', margin: '1rem auto 2rem' }}>We couldn't locate any tracking logs for Order ID #{id.toUpperCase()}. It might be preparing for departure.</p>
        <button onClick={() => navigate('/orders')} className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>Return to My Orders</button>
      </div>
    </div>
  );

  return (
    <div className="kl-root" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <Navbar />
      
      {/* Transportation Header */}
      <div style={{ 
        background: 'var(--bg-secondary)', 
        borderBottom: '1px solid var(--border)',
        padding: '2.5rem 0',
        marginTop: '80px'
      }}>
        <div className="container">
            <button onClick={() => navigate('/orders')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: '700' }}>
                <ChevronLeft size={18} /> Back to Dashboard
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>Track Delivery</h1>
                    <p style={{ color: 'var(--accent)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                        <Zap size={14} fill="currentColor" /> Express Shipping #{id.slice(-8).toUpperCase()}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Estimated Arrival</p>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--success)', fontWeight: '900', margin: 0 }}>
                        {tracking.courierDetails?.estimatedDeliveryDate 
                            ? new Date(tracking.courierDetails.estimatedDeliveryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                            : 'Determining ETA...'}
                    </h3>
                </div>
            </div>
        </div>
      </div>

      <main className="container animate-fade-in" style={{ padding: '4rem 0' }}>
        
        {/* Amazon-style Stepper */}
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', marginBottom: '3rem', position: 'relative', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--border)' }}>
                <div style={{ 
                    height: '100%', 
                    width: `${(activeStep / (STAGES.length - 1)) * 100}%`, 
                    background: 'var(--accent)', 
                    boxShadow: '0 0 15px var(--accent)',
                    transition: 'width 1.5s ease-in-out' 
                }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {STAGES.map((stage, idx) => {
                    const isActive = idx <= activeStep;
                    const isCurrent = idx === activeStep;
                    return (
                        <div key={stage.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                            <div style={{ 
                                width: '56px', 
                                height: '56px', 
                                borderRadius: '18px', 
                                background: isActive ? 'var(--text)' : 'var(--bg-secondary)',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: isActive ? 'var(--bg)' : 'var(--text-muted)',
                                border: `2px solid ${isActive ? 'var(--text)' : 'var(--border)'}`,
                                boxShadow: isActive ? '0 8px 25px rgba(0,0,0,0.1)' : 'none',
                                marginBottom: '1.2rem',
                                transition: 'all 0.5s'
                            }}>
                                {stage.icon}
                            </div>
                            <span style={{ 
                                fontSize: '0.8rem', 
                                fontWeight: isActive ? '800' : '600', 
                                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                                textAlign: 'center',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {stage.label}
                            </span>
                            {isCurrent && <div className="pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', marginTop: '0.75rem' }}></div>}
                        </div>
                    );
                })}
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '3rem' }} className="mobile-stack">
            {/* Left: Journey & Map */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                
                {/* Logistics Map Visualization */}
                <div className="glass-panel" style={{ padding: 0, height: '400px', position: 'relative', overflow: 'hidden', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'radial-gradient(circle at center, var(--accent) 0%, transparent 70%)' }}></div>
                    
                    {/* Mock Map Background */}
                    <div style={{ position: 'absolute', inset: 0, padding: '3rem' }}>
                        <div style={{ width: '100%', height: '100%', border: '1px dashed var(--border)', borderRadius: '24px', position: 'relative' }}>
                            {/* Route Line */}
                            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                                <path 
                                    d="M 100 250 Q 300 50 600 200" 
                                    fill="none" 
                                    stroke="var(--border)" 
                                    strokeWidth="3" 
                                    strokeDasharray="8,8"
                                />
                                <path 
                                    d="M 100 250 Q 300 50 600 200" 
                                    fill="none" 
                                    stroke="var(--accent)" 
                                    strokeWidth="4" 
                                    strokeDasharray="1000"
                                    strokeDashoffset={1000 - (activeStep * 200)}
                                    style={{ transition: 'stroke-dashoffset 2s ease-in-out' }}
                                />
                            </svg>

                            {/* Origin Pin */}
                            <div style={{ position: 'absolute', left: '80px', bottom: '80px', textAlign: 'center' }}>
                                <div style={{ width: '14px', height: '14px', background: 'var(--text)', borderRadius: '50%', margin: '0 auto 0.6rem', border: '3px solid var(--bg)' }}></div>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.1em' }}>ORIGIN</span>
                            </div>

                            {/* Destination Pin */}
                            <div style={{ position: 'absolute', right: '80px', top: '80px', textAlign: 'center' }}>
                                <MapPin size={28} color="var(--success)" style={{ margin: '0 auto 0.6rem' }} />
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.1em' }}>DESTINATION</span>
                            </div>

                            {/* Live Vehicle */}
                            <div style={{ 
                                position: 'absolute', 
                                left: `${100 + (activeStep * 110)}px`, 
                                top: `${250 - (activeStep * 40)}px`,
                                transform: 'translate(-50%, -50%)',
                                transition: 'all 2s ease-in-out'
                            }}>
                                <div style={{ 
                                    background: 'var(--text)', 
                                    padding: '1rem', 
                                    borderRadius: '16px', 
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Truck size={24} color="var(--bg)" />
                                </div>
                                <div className="sonar-wave" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '16px', background: 'var(--accent)', opacity: 0.3 }}></div>
                            </div>
                        </div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }} className="pulse"></div>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text)', letterSpacing: '0.02em' }}>Live Tracking Active</span>
                    </div>
                </div>

                {/* Detailed Journey Logs */}
                <div className="glass-panel" style={{ padding: '3rem', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '900' }}>
                        <Navigation size={22} color="var(--accent)" /> Logistics Journey
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {tracking.trackingEvents.slice().reverse().map((event, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '2rem', position: 'relative', paddingBottom: '3rem' }}>
                                {/* Line */}
                                {idx !== tracking.trackingEvents.length - 1 && (
                                    <div style={{ position: 'absolute', left: '9px', top: '28px', bottom: 0, width: '2px', background: 'var(--border)' }}></div>
                                )}
                                
                                <div style={{ 
                                    width: '20px', height: '20px', borderRadius: '50%', 
                                    background: idx === 0 ? 'var(--text)' : 'var(--bg-secondary)',
                                    border: `4px solid ${idx === 0 ? 'var(--accent)30' : 'var(--border)'}`,
                                    zIndex: 2, marginTop: '4px',
                                    transition: 'all 0.3s'
                                }}></div>
                                
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: idx === 0 ? 'var(--text)' : 'var(--text-light)' }}>{event.location || 'Hub Processing'}</h4>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{event.description}</p>
                                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Logistics Specs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                
                {/* Package Details */}
                <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
                        <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'var(--accent)10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Box size={24} color="var(--accent)" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: '800' }}>Parcel Specs</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Weight: 1.2kg • Standard Box</p>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Courier Partner</span>
                            <span style={{ fontWeight: '800' }}>{tracking.courierDetails?.courierName || 'GiftKart Logistics'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Shipping Method</span>
                            <span style={{ color: 'var(--accent)', fontWeight: '900' }}>Priority Air</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Tracking ID</span>
                            <code style={{ background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid var(--border)', fontWeight: '700' }}>{id.toUpperCase()}</code>
                        </div>
                    </div>
                </div>

                {/* Recipient Details */}
                <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '800' }}>
                        <User size={20} color="var(--accent)" /> Recipient Information
                    </h3>
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-full)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                            <User size={22} color="var(--text-light)" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: '800', fontSize: '1.1rem' }}>{tracking.deliveryAddress?.name}</p>
                            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>{tracking.deliveryAddress?.phone}</p>
                        </div>
                    </div>
                    <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <MapPin size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: '3px' }} />
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: '1.7', fontWeight: '500' }}>
                                {tracking.deliveryAddress?.address}<br />
                                {tracking.deliveryAddress?.city}, {tracking.deliveryAddress?.state} - {tracking.deliveryAddress?.pincode}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Support & Insurance */}
                <div className="glass-panel" style={{ padding: '2rem', borderLeft: '5px solid var(--success)', borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <ShieldCheck size={22} color="var(--success)" />
                        <span style={{ fontSize: '1rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Package Insured</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>This delivery is covered by the GiftKart Global Guarantee. Any damages or losses are 100% refundable.</p>
                </div>

            </div>
        </div>
      </main>

      <style>{`
        .pulse {
          animation: pulse-animation 2s infinite;
        }
        @keyframes pulse-animation {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .sonar-wave {
          animation: sonar 2s infinite;
        }
        @keyframes sonar {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(3); opacity: 0; }
        }
        @media (max-width: 992px) {
            .mobile-stack {
                grid-template-columns: 1fr !important;
                gap: 2rem !important;
            }
        }
      `}</style>
    </div>
  );
};

export default OrderTracking;
