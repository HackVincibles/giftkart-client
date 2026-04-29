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
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'white' }}>
      <Navbar />
      
      {/* Transportation Header */}
      <div style={{ 
        background: 'linear-gradient(to right, #0f172a, #1e293b)', 
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '2rem 0'
      }}>
        <div className="container">
            <button onClick={() => navigate('/orders')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem' }} className="hover:text-white">
                <ChevronLeft size={18} /> Back to Dashboard
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>Track Delivery</h1>
                    <p style={{ color: 'var(--accent-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <Zap size={16} fill="currentColor" /> Express Shipping #{id.slice(-8).toUpperCase()}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Estimated Arrival</p>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--success)', fontWeight: '800', margin: 0 }}>
                        {tracking.courierDetails?.estimatedDeliveryDate 
                            ? new Date(tracking.courierDetails.estimatedDeliveryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                            : 'Determining ETA...'}
                    </h3>
                </div>
            </div>
        </div>
      </div>

      <main className="container animate-fade-in" style={{ padding: '3rem 0' }}>
        
        {/* Amazon-style Stepper */}
        <div className="glass-panel" style={{ padding: '3rem 2rem', marginBottom: '2.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)' }}>
                <div style={{ 
                    height: '100%', 
                    width: `${(activeStep / (STAGES.length - 1)) * 100}%`, 
                    background: 'var(--accent-primary)', 
                    boxShadow: '0 0 15px var(--accent-primary)',
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
                                width: '48px', 
                                height: '48px', 
                                borderRadius: '16px', 
                                background: isActive ? 'var(--accent-primary)' : '#1e1e2e',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: isActive ? 'white' : 'var(--text-muted)',
                                border: `2px solid ${isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)'}`,
                                boxShadow: isActive ? '0 8px 20px rgba(139, 92, 246, 0.3)' : 'none',
                                marginBottom: '1rem',
                                transition: 'all 0.5s'
                            }}>
                                {stage.icon}
                            </div>
                            <span style={{ 
                                fontSize: '0.85rem', 
                                fontWeight: isActive ? '800' : '500', 
                                color: isActive ? 'white' : 'var(--text-muted)',
                                textAlign: 'center'
                            }}>
                                {stage.label}
                            </span>
                            {isCurrent && <div className="pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', marginTop: '0.5rem' }}></div>}
                        </div>
                    );
                })}
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }} className="mobile-stack">
            {/* Left: Journey & Map */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Logistics Map Visualization */}
                <div className="glass-panel" style={{ padding: 0, height: '350px', position: 'relative', overflow: 'hidden', background: '#020617' }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.3, background: 'radial-gradient(circle at center, #1e293b 0%, transparent 70%)' }}></div>
                    
                    {/* Mock Map Background */}
                    <div style={{ position: 'absolute', inset: 0, padding: '2rem' }}>
                        <div style={{ width: '100%', height: '100%', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '20px', position: 'relative' }}>
                            {/* Route Line */}
                            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                                <path 
                                    d="M 100 250 Q 300 50 600 200" 
                                    fill="none" 
                                    stroke="rgba(255,255,255,0.05)" 
                                    strokeWidth="4" 
                                    strokeDasharray="10,10"
                                />
                                <path 
                                    d="M 100 250 Q 300 50 600 200" 
                                    fill="none" 
                                    stroke="var(--accent-primary)" 
                                    strokeWidth="4" 
                                    strokeDasharray="1000"
                                    strokeDashoffset={1000 - (activeStep * 200)}
                                    style={{ transition: 'stroke-dashoffset 2s ease-in-out' }}
                                />
                            </svg>

                            {/* Origin Pin */}
                            <div style={{ position: 'absolute', left: '80px', bottom: '80px', textAlign: 'center' }}>
                                <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '50%', margin: '0 auto 0.5rem' }}></div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>ORIGIN</span>
                            </div>

                            {/* Destination Pin */}
                            <div style={{ position: 'absolute', right: '80px', top: '80px', textAlign: 'center' }}>
                                <MapPin size={24} color="var(--success)" style={{ margin: '0 auto 0.5rem' }} />
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>DESTINATION</span>
                            </div>

                            {/* Live Vehicle */}
                            <div style={{ 
                                position: 'absolute', 
                                left: `${100 + (activeStep * 100)}px`, 
                                top: `${250 - (activeStep * 40)}px`,
                                transform: 'translate(-50%, -50%)',
                                transition: 'all 2s ease-in-out'
                            }}>
                                <div style={{ 
                                    background: 'var(--accent-primary)', 
                                    padding: '0.8rem', 
                                    borderRadius: '12px', 
                                    boxShadow: '0 0 30px var(--accent-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Truck size={24} color="white" />
                                </div>
                                <div className="sonar-wave" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px', background: 'var(--accent-primary)', opacity: 0.3 }}></div>
                            </div>
                        </div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.5)', padding: '0.6rem 1rem', borderRadius: '30px', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }} className="pulse"></div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>Live Location Tracking Active</span>
                    </div>
                </div>

                {/* Detailed Journey Logs */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Navigation size={20} color="var(--accent-primary)" /> Transportation Journey
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {tracking.trackingEvents.slice().reverse().map((event, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '1.5rem', position: 'relative', paddingBottom: '2.5rem' }}>
                                {/* Line */}
                                {idx !== tracking.trackingEvents.length - 1 && (
                                    <div style={{ position: 'absolute', left: '7px', top: '24px', bottom: 0, width: '2px', background: 'rgba(255,255,255,0.05)' }}></div>
                                )}
                                
                                <div style={{ 
                                    width: '16px', height: '16px', borderRadius: '50%', 
                                    background: idx === 0 ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                    border: idx === 0 ? '4px solid rgba(139, 92, 246, 0.3)' : 'none',
                                    zIndex: 2, marginTop: '4px'
                                }}></div>
                                
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1rem', color: idx === 0 ? 'white' : 'var(--text-secondary)' }}>{event.location || 'Hub Processing'}</h4>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: idx === 0 ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{event.description}</p>
                                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>{new Date(event.timestamp).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Logistics Specs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Package Details */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Box size={22} color="var(--accent-primary)" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1rem', margin: 0 }}>Parcel Specs</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Weight: 1.2kg • Standard Box</p>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Courier Partner</span>
                            <span style={{ fontWeight: '700' }}>{tracking.courierDetails?.courierName || 'GiftKart Logistics'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Shipping Method</span>
                            <span style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>Priority Air</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Tracking ID</span>
                            <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{id.toUpperCase()}</code>
                        </div>
                    </div>
                </div>

                {/* Recipient Details */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <User size={18} color="var(--accent-primary)" /> Recipient Information
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={20} color="var(--text-muted)" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem' }}>{tracking.deliveryAddress?.name}</p>
                            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{tracking.deliveryAddress?.phone}</p>
                        </div>
                    </div>
                    <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <MapPin size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                {tracking.deliveryAddress?.address}<br />
                                {tracking.deliveryAddress?.city}, {tracking.deliveryAddress?.state} - {tracking.deliveryAddress?.pincode}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Support & Insurance */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                        <ShieldCheck size={18} color="var(--success)" />
                        <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>Package Insured</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>This delivery is covered by GiftKart Guarantee. Any damages or losses are 100% refundable.</p>
                </div>

            </div>
        </div>
      </main>

      <style>{`
        .pulse {
          animation: pulse-animation 2s infinite;
        }
        @keyframes pulse-animation {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
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
            }
        }
      `}</style>
    </div>
  );
};

export default OrderTracking;
