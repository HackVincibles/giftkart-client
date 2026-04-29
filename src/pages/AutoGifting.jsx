import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Gift, Clock, MapPin, ChevronRight, Loader, Edit2, Truck, XCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const AutoGifting = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    recipientName: '',
    relationship: 'friend',
    occasion: 'birthday',
    occasionDate: '',
    isRecurring: false,
    recurringPattern: 'yearly',
    deliveryName: '',
    deliveryPhone: '',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryPincode: ''
  });

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/auto-gift-calendar?status=active');
      setEvents(res.data.data.autoGifts || []);
    } catch (err) {
      console.error(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysLeft = (dateStr) => {
    const today = new Date();
    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
        eventDate.setFullYear(today.getFullYear());
        if (eventDate < today) {
            eventDate.setFullYear(today.getFullYear() + 1);
        }
    }
    
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const daysA = calculateDaysLeft(a.occasionDate);
      const daysB = calculateDaysLeft(b.occasionDate);
      if (daysA !== daysB) return daysA - daysB;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [events]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        recipient: {
          name: formData.recipientName,
          relationship: formData.relationship
        },
        occasion: formData.occasion,
        occasionDate: formData.occasionDate,
        occasionTime: "10:00 AM", // Default time
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isRecurring: formData.isRecurring,
        recurringPattern: formData.isRecurring ? formData.recurringPattern : undefined,
        deliveryAddress: {
          name: formData.deliveryName,
          phone: formData.deliveryPhone,
          address: formData.deliveryAddress,
          city: formData.deliveryCity,
          state: formData.deliveryState,
          pincode: formData.deliveryPincode
        }
      };

      if (formData._id) {
        await axios.put(`/auto-gift-calendar/${formData._id}`, payload);
        success("Schedule updated successfully!");
      } else {
        await axios.post('/auto-gift-calendar', payload);
        success("Auto-gift scheduled successfully!");
      }
      setShowAddForm(false);
      fetchEvents();
      
      // Reset form
      setFormData({
        recipientName: '',
        relationship: 'friend',
        occasion: 'birthday',
        occasionDate: '',
        isRecurring: false,
        recurringPattern: 'yearly',
        deliveryName: '',
        deliveryPhone: '',
        deliveryAddress: '',
        deliveryCity: '',
        deliveryState: '',
        deliveryPincode: ''
      });
    } catch (err) {
      error(err.response?.data?.message || "Failed to process auto-gift.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.put(`/auto-gift-calendar/${id}/cancel`);
      success("Gift schedule cancelled.");
      fetchEvents();
    } catch (err) {
      error("Failed to cancel schedule.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      
      <main className="container animate-fade-in" style={{ padding: '3rem 2rem', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Calendar color="var(--accent-primary)" /> Auto-Gifting Calendar
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Schedule gifts for loved ones months in advance and never miss an important date.</p>
          </div>
          
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {showAddForm ? 'Cancel' : <><Plus size={18} /> Schedule Gift</>}
          </button>
        </div>

        {showAddForm ? (
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>Create New Schedule</h2>
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Left Col: Event Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Event Details</h3>
                  
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Recipient Name</label>
                    <input required type="text" className="input-field" value={formData.recipientName} onChange={e => setFormData({...formData, recipientName: e.target.value})} placeholder="e.g. Mom" />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Relationship</label>
                      <select className="input-field" value={formData.relationship} onChange={e => setFormData({...formData, relationship: e.target.value})}>
                        <option value="partner">Partner</option>
                        <option value="parent">Parent</option>
                        <option value="friend">Friend</option>
                        <option value="sibling">Sibling</option>
                        <option value="colleague">Colleague</option>
                        <option value="child">Child</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Occasion</label>
                      <select className="input-field" value={formData.occasion} onChange={e => setFormData({...formData, occasion: e.target.value})}>
                        <option value="birthday">Birthday</option>
                        <option value="anniversary">Anniversary</option>
                        <option value="valentine">Valentine's Day</option>
                        <option value="mothers_day">Mother's Day</option>
                        <option value="fathers_day">Father's Day</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Date</label>
                    <input required type="date" className="input-field" value={formData.occasionDate} onChange={e => setFormData({...formData, occasionDate: e.target.value})} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                    <input type="checkbox" id="recurring" checked={formData.isRecurring} onChange={e => setFormData({...formData, isRecurring: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }} />
                    <label htmlFor="recurring" style={{ cursor: 'pointer' }}>Repeat this event?</label>
                    
                    {formData.isRecurring && (
                      <select className="input-field" style={{ padding: '0.3rem', width: 'auto', marginLeft: 'auto' }} value={formData.recurringPattern} onChange={e => setFormData({...formData, recurringPattern: e.target.value})}>
                        <option value="yearly">Yearly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Right Col: Delivery Address */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Delivery Address</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Full Name</label>
                      <input required type="text" className="input-field" value={formData.deliveryName} onChange={e => setFormData({...formData, deliveryName: e.target.value})} placeholder="Recipient Name" />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Phone</label>
                      <input required type="text" className="input-field" value={formData.deliveryPhone} onChange={e => setFormData({...formData, deliveryPhone: e.target.value})} placeholder="Contact Number" />
                    </div>
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Street Address</label>
                    <input required type="text" className="input-field" value={formData.deliveryAddress} onChange={e => setFormData({...formData, deliveryAddress: e.target.value})} placeholder="House/Flat No., Street" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">City & State</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input required type="text" className="input-field" value={formData.deliveryCity} onChange={e => setFormData({...formData, deliveryCity: e.target.value})} placeholder="City" />
                        <input required type="text" className="input-field" value={formData.deliveryState} onChange={e => setFormData({...formData, deliveryState: e.target.value})} placeholder="State" />
                      </div>
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Pincode</label>
                      <input required type="text" className="input-field" value={formData.deliveryPincode} onChange={e => setFormData({...formData, deliveryPincode: e.target.value})} placeholder="Zip Code" />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
                  {loading ? <Loader className="animate-spin" size={20} /> : 'Schedule Auto-Gift'}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {loading && !showAddForm ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader className="animate-spin" color="var(--accent-primary)" size={40} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {sortedEvents.length > 0 ? sortedEvents.map(evt => {
              const daysLeft = calculateDaysLeft(evt.occasionDate);
              
              return (
              <div key={evt._id} className="glass-panel hover:scale-[1.02]" style={{ padding: '1.5rem', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
                
                {daysLeft <= 14 && (
                  <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--accent-primary)', color: 'white', padding: '0.25rem 1rem', borderBottomLeftRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    ACTION REQUIRED
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem', textTransform: 'capitalize' }}>{evt.occasion} for {evt.recipient?.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={14} /> {new Date(evt.occasionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} 
                      {evt.isRecurring && <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', marginLeft: '0.5rem' }}>{evt.recurringPattern}</span>}
                    </p>
                  </div>
                  
                  <div style={{ textAlign: 'center', background: daysLeft <= 14 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)', padding: '0.5rem', borderRadius: '8px', minWidth: '60px' }}>
                    <h4 style={{ fontSize: '1.25rem', color: daysLeft <= 14 ? 'var(--danger)' : 'var(--accent-secondary)', lineHeight: 1 }}>{daysLeft}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>days left</span>
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', position: 'relative' }}>
                  <button 
                    onClick={() => {
                        setFormData({
                            _id: evt._id,
                            recipientName: evt.recipient?.name,
                            relationship: evt.recipient?.relationship,
                            occasion: evt.occasion,
                            occasionDate: evt.occasionDate.split('T')[0],
                            isRecurring: evt.isRecurring,
                            recurringPattern: evt.recurringPattern,
                            deliveryName: evt.deliveryAddress?.name,
                            deliveryPhone: evt.deliveryAddress?.phone,
                            deliveryAddress: evt.deliveryAddress?.address,
                            deliveryCity: evt.deliveryAddress?.city,
                            deliveryState: evt.deliveryAddress?.state,
                            deliveryPincode: evt.deliveryAddress?.pincode
                        });
                        setShowAddForm(true);
                    }}
                    style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}
                    title="Edit Details"
                  >
                    <Edit2 size={16} />
                  </button>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', paddingRight: '2rem' }}>
                    <MapPin size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>
                      Deliver to: {evt.deliveryAddress?.name} <br/>
                      {evt.deliveryAddress?.address}, {evt.deliveryAddress?.city} - {evt.deliveryAddress?.pincode}
                    </span>
                  </p>
                </div>

                {/* Selected Gifts Section */}
                {evt.selectedGifts && evt.selectedGifts.length > 0 && (
                  <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 'bold', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Gift size={14} /> Selected Gift
                    </p>
                    {evt.selectedGifts.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <img 
                                src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/50'} 
                                alt={item.product?.name} 
                                style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-light)' }} 
                            />
                            <div>
                                <p style={{ fontSize: '0.95rem', fontWeight: '600' }}>{item.product?.name}</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)' }}>₹{item.product?.basePrice}</p>
                            </div>
                        </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {evt.orderStatus === 'delivered' ? (
                    <div style={{ background: 'var(--success)10', color: 'var(--success)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--success)30', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={18} /> Gift has been Delivered! 🎁
                    </div>
                  ) : ['ordered', 'processing', 'shipped'].includes(evt.orderStatus) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ background: 'var(--accent-primary)10', color: 'var(--accent-primary)', padding: '0.8rem', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '500', border: '1px solid var(--accent-primary)20' }}>
                            Order is being processed
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button 
                                onClick={() => navigate(`/tracking/${evt.orderId}`)}
                                className="btn btn-primary" 
                                style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Truck size={16} /> Track
                            </button>
                            <button 
                                onClick={async () => {
                                    if(!window.confirm("Cancel this order and refund to wallet?")) return;
                                    try {
                                        await axios.post(`/payment/orders/${evt.orderId}/cancel`);
                                        success("Order cancelled & refund credited.");
                                        fetchEvents();
                                    } catch (err) {
                                        error("Failed to cancel order.");
                                    }
                                }} 
                                className="btn btn-secondary" 
                                style={{ flex: 1, color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                            >
                                <XCircle size={16} /> Cancel Order
                            </button>
                        </div>
                    </div>
                  ) : (
                    <>
                      {evt.selectedGifts && evt.selectedGifts.length > 0 ? (
                        <button 
                          onClick={async () => {
                              try {
                                  await axios.delete('/cart/clear');
                                  await axios.post('/cart/add', { 
                                      productId: evt.selectedGifts[0].product._id, 
                                      quantity: 1 
                                  });
                                  localStorage.setItem('activeSchedule', JSON.stringify({
                                      id: evt._id,
                                      recipient: evt.recipient?.name,
                                      address: evt.deliveryAddress,
                                      isScheduledGift: true
                                  }));
                                  navigate('/cart');
                              } catch (err) {
                                  error("Failed to prepare order.");
                              }
                          }}
                          className="btn btn-primary" 
                          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: 'var(--success)', border: 'none' }}
                        >
                          <Gift size={16} /> Order This Gift Now
                        </button>
                      ) : (
                        <button 
                            onClick={() => {
                                localStorage.setItem('activeScheduleId', evt._id);
                                localStorage.setItem('activeScheduleRecipient', evt.recipient?.name);
                                success(`Choosing gift for ${evt.recipient?.name}`);
                                navigate('/buyer-dashboard');
                            }}
                            className="btn btn-primary" 
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Plus size={16} /> Choose Gift from Marketplace
                        </button>
                      )}
                      
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                            onClick={() => {
                                localStorage.setItem('activeScheduleId', evt._id);
                                localStorage.setItem('activeScheduleRecipient', evt.recipient?.name);
                                navigate('/buyer-dashboard');
                            }}
                            className="btn btn-secondary" 
                            style={{ flex: 1, fontSize: '0.85rem' }}
                        >
                            {evt.selectedGifts?.length > 0 ? 'Change Gift' : 'Browse'}
                        </button>
                        <button onClick={() => handleCancel(evt._id)} className="btn btn-secondary" style={{ flex: 1, color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', fontSize: '0.85rem' }}>
                            Cancel Plan
                        </button>
                      </div>
                    </>
                  )}
                </div>

              </div>
            )}) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border-light)' }}>
                <Calendar size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No upcoming events</h3>
                <p style={{ color: 'var(--text-secondary)' }}>You haven't scheduled any auto-gifts yet.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AutoGifting;
