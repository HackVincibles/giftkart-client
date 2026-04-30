import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
    CreditCard, 
    ShieldCheck, 
    ChevronLeft, 
    Lock, 
    CheckCircle2, 
    Tag,
    X,
    Info
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CreditCardForm from '../components/ui/CreditCardForm';
import GiftBoxAnimation from '../components/ui/GiftBoxAnimation';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { amount = 1499, item = "Artisan Gift Set" } = location.state || {};
    
    const [method, setMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [coupon, setCoupon] = useState(null); // { discount, type, code }
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [deliveryPrefs, setDeliveryPrefs] = useState({
        occasion: 'birthday',
        preferredDeliveryDate: '',
        preferredTimeSlot: 'evening_6_9',
        isSurprise: false,
        specialInstructions: ''
    });
    const [scheduledAddress, setScheduledAddress] = useState(null);

    React.useEffect(() => {
        const saved = localStorage.getItem('activeSchedule');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setScheduledAddress(data.address);
                // Also try to find a matching event in the future or just use defaults
                if (data.occasion) {
                    setDeliveryPrefs(prev => ({ ...prev, occasion: data.occasion }));
                }
                if (data.date) {
                    setDeliveryPrefs(prev => ({ ...prev, preferredDeliveryDate: data.date.split('T')[0] }));
                }
            } catch (e) { console.error("Error parsing schedule", e); }
        }
    }, []);

    const discount = coupon
        ? coupon.discountType === 'percentage'
            ? Math.round(amount * coupon.discountValue / 100)
            : coupon.discountValue
        : 0;
    const finalAmount = Math.max(0, amount - discount) + 99;

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError('');
        try {
            const res = await axios.post('/coupons/validate', { code: couponCode.trim(), orderAmount: amount });
            if (res.data.success) {
                setCoupon(res.data.coupon);
            } else {
                setCouponError(res.data.message || 'Invalid coupon');
            }
        } catch (err) {
            setCouponError(err.response?.data?.message || 'Invalid or expired coupon code');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRazorpay = () => {
        setIsProcessing(true);
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: finalAmount * 100,
            currency: "INR",
            name: "GiftKart",
            description: `Payment for ${item}`,
            handler: async function (response) {
                // Save delivery preferences first
                try {
                    await axios.post('/occasion-delivery/request', {
                        ...deliveryPrefs,
                        orderId: response.razorpay_order_id || `ORD_${Date.now()}` // fallback for mock
                    });
                } catch (e) { console.error("Failed to save delivery prefs", e); }
                
                setIsProcessing(false);
                setIsSuccess(true);
                setTimeout(() => navigate('/orders'), 4000);
            },
            prefill: { name: "Guest", email: "guest@giftkart.com" },
            theme: { color: "#9e3f42" }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const handleCardPayment = async (cardData) => {
        setIsProcessing(true);
        // Save delivery preferences
        try {
            await axios.post('/occasion-delivery/request', {
                ...deliveryPrefs,
                orderId: `ORD_${Date.now()}`
            });
        } catch (e) { console.error("Failed to save delivery prefs", e); }

        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            setTimeout(() => navigate('/orders'), 4000);
        }, 2500);
    };

    if (isSuccess) {
        return (
            <div className="success-screen">
                <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                    className="success-content"
                >
                    <GiftBoxAnimation />
                    <h1>Order Placed! 🎁</h1>
                    <p>Your gift is being crafted with love. You'll receive updates on your email.</p>
                    <div className="redirect-timer">Redirecting to your orders...</div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <Navbar />

            <main className="checkout-container">
                <div className="checkout-sidebar">
                    <button className="back-link" onClick={() => navigate(-1)}>
                        <ChevronLeft size={18} /> <span>Return to Studio</span>
                    </button>

                    <div className="order-summary">
                        <h3>Order Summary</h3>
                        <div className="summary-card">
                            <div className="summary-item">
                                <span>{item}</span>
                                <strong>₹{amount}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Artisan Service Fee</span>
                                <strong>₹99</strong>
                            </div>
                            {coupon && (
                                <div className="summary-item" style={{ color: '#10b981' }}>
                                    <span>Coupon ({coupon.code})</span>
                                    <strong>−₹{discount}</strong>
                                </div>
                            )}
                            <div className="summary-total">
                                <span>Total Amount</span>
                                <strong>₹{finalAmount}</strong>
                            </div>
                        </div>

                        {/* Coupon Section */}
                        <div style={{ marginTop: '1.5rem' }}>
                            {!coupon ? (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <div style={{ flex: 1, position: 'relative' }}>
                                        <Tag size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
                                        <input
                                            value={couponCode}
                                            onChange={e => { setCouponCode(e.target.value); setCouponError(''); }}
                                            onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                                            placeholder="Coupon code"
                                            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.7rem 0.75rem 0.7rem 2.2rem', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                                        />
                                    </div>
                                    <button
                                        onClick={applyCoupon}
                                        disabled={couponLoading}
                                        style={{ background: 'var(--gradient-primary)', color: '#fff', border: 'none', borderRadius: '12px', padding: '0 1rem', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                    >
                                        {couponLoading ? '...' : 'Apply'}
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '0.75rem 1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.85rem', fontWeight: '700' }}>
                                        <Tag size={14} /> {coupon.code} — ₹{discount} off
                                    </div>
                                    <button onClick={() => { setCoupon(null); setCouponCode(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52525b' }}>
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            {couponError && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem' }}>{couponError}</p>}
                        </div>

                        <div className="trust-badge">
                            <Lock size={14} /> <span>End-to-End Encrypted</span>
                        </div>
                    </div>
                </div>

                <div className="payment-area">
                    <div className="payment-header">
                        <ShieldCheck size={24} color="var(--accent)" />
                        <h2>Artisan Payment Vault</h2>
                        <p>Complete your purchase using our secure encrypted gateway.</p>
                    </div>

                    {scheduledAddress && (
                        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--accent)', background: 'var(--bg-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent)', marginBottom: '1rem' }}>
                                <CheckCircle2 size={20} />
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Pre-filled Shipping Address</h3>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: '1.6' }}>
                                <p style={{ fontWeight: 'bold', color: 'var(--text)', marginBottom: '0.25rem' }}>{scheduledAddress.name}</p>
                                <p>{scheduledAddress.address}</p>
                                <p>{scheduledAddress.city}, {scheduledAddress.state} - {scheduledAddress.pincode}</p>
                                <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.8 }}>📞 {scheduledAddress.phone}</p>
                            </div>
                        </div>
                    )}

                    <div className="delivery-preferences glass-panel" style={{ padding: '2rem', marginBottom: '3rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: '800' }}>Delivery Preferences</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', color: '#71717a' }}>Occasion</label>
                                <select 
                                    value={deliveryPrefs.occasion} 
                                    onChange={e => setDeliveryPrefs({...deliveryPrefs, occasion: e.target.value})}
                                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '12px', color: 'var(--text)' }}
                                >
                                    <option value="birthday">Birthday</option>
                                    <option value="anniversary">Anniversary</option>
                                    <option value="wedding">Wedding</option>
                                    <option value="valentine">Valentine's Day</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', color: '#71717a' }}>Delivery Date</label>
                                <input 
                                    type="date" 
                                    value={deliveryPrefs.preferredDeliveryDate} 
                                    onChange={e => setDeliveryPrefs({...deliveryPrefs, preferredDeliveryDate: e.target.value})}
                                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '12px', color: 'var(--text)' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', color: '#71717a' }}>Preferred Time Slot</label>
                                <select 
                                    value={deliveryPrefs.preferredTimeSlot} 
                                    onChange={e => setDeliveryPrefs({...deliveryPrefs, preferredTimeSlot: e.target.value})}
                                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '12px', color: 'var(--text)' }}
                                >
                                    <option value="morning_9_12">Morning (9 AM - 12 PM)</option>
                                    <option value="afternoon_12_3">Afternoon (12 PM - 3 PM)</option>
                                    <option value="evening_6_9">Evening (6 PM - 9 PM)</option>
                                    <option value="midnight">Midnight Delivery (+₹150)</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.5rem' }}>
                                <input 
                                    type="checkbox" 
                                    checked={deliveryPrefs.isSurprise} 
                                    onChange={e => setDeliveryPrefs({...deliveryPrefs, isSurprise: e.target.checked})}
                                    style={{ width: '20px', height: '20px', accentColor: 'var(--accent)' }}
                                />
                                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>This is a surprise gift! 🤫</span>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', color: '#71717a' }}>Special Instructions</label>
                            <textarea 
                                value={deliveryPrefs.specialInstructions} 
                                onChange={e => setDeliveryPrefs({...deliveryPrefs, specialInstructions: e.target.value})}
                                placeholder="Any specific notes for the artisan or delivery person?"
                                style={ { width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '12px', color: 'var(--text)', minHeight: '80px' }}
                            />
                        </div>
                    </div>

                    <div className="payment-form-container">
                        <CreditCardForm 
                            onSubmit={handleCardPayment} 
                            onRazorpayClick={handleRazorpay}
                            isProcessing={isProcessing}
                            isRazorpayProcessing={isProcessing}
                        />
                    </div>

                    <div className="payment-footer">
                        <Info size={14} /> 
                        <p>Your payment information is never stored on our servers. All transactions are processed via PCI-DSS compliant partners.</p>
                    </div>
                </div>
            </main>

            <style>{`
                .checkout-page {
                    min-height: 100vh;
                    background: var(--bg);
                    color: var(--text);
                    padding-top: 100px;
                }

                .checkout-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 400px 1fr;
                    gap: 5rem;
                    padding: 4rem 2rem;
                }

                .payment-header {
                    margin-bottom: 3rem;
                }

                .payment-header h2 {
                    font-size: 2rem;
                    font-weight: 900;
                    margin: 1rem 0 0.5rem;
                }

                .payment-header p {
                    color: #71717a;
                    font-size: 0.95rem;
                }

                .back-link {
                    background: transparent;
                    border: none;
                    color: #71717a;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 700;
                    cursor: pointer;
                    margin-bottom: 3rem;
                }

                .order-summary h3 {
                    font-size: 1.5rem;
                    font-weight: 900;
                    margin-bottom: 2rem;
                }

                .summary-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 2rem;
                }

                .summary-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }

                .summary-total {
                    margin-top: 2rem;
                    padding-top: 2rem;
                    border-top: 1px dashed var(--border);
                    display: flex;
                    justify-content: space-between;
                    font-size: 1.2rem;
                    font-weight: 800;
                }

                .summary-total strong { color: var(--accent); }

                .trust-badge {
                    margin-top: 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    color: #52525b;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                /* Payment Area */
                .method-tabs {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 3rem;
                    background: var(--bg-secondary);
                    padding: 0.5rem;
                    border-radius: 100px;
                    border: 1px solid var(--border);
                }

                .method-tab {
                    flex: 1;
                    padding: 0.8rem;
                    border-radius: 100px;
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    font-weight: 800;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .method-tab.active {
                    background: var(--text);
                    color: var(--bg);
                }

                .payment-form-container {
                    min-height: 400px;
                }

                .razorpay-prompt {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 32px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2rem;
                }

                .rzp-visual h3 { font-size: 1.5rem; font-weight: 900; margin: 1rem 0 0.5rem; }
                .rzp-visual p { color: var(--text-muted); font-size: 0.95rem; max-width: 300px; margin: 0 auto; line-height: 1.6; }

                .rzp-btn {
                    background: #3399cc;
                    color: white;
                    border: none;
                    padding: 1rem 3rem;
                    border-radius: 100px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .rzp-btn:hover { transform: scale(1.05); box-shadow: 0 10px 20px rgba(51, 153, 204, 0.2); }

                .payment-footer {
                    margin-top: 4rem;
                    display: flex;
                    gap: 0.75rem;
                    color: #3f3f46;
                    font-size: 0.8rem;
                    line-height: 1.5;
                }

                /* Success Screen */
                .success-screen {
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg);
                    color: var(--text);
                    text-align: center;
                }

                .success-content h1 { font-size: 3rem; font-weight: 900; margin: 2rem 0 1rem; }
                .success-content p { color: #a1a1aa; font-size: 1.2rem; max-width: 500px; }
                .redirect-timer { margin-top: 3rem; color: #52525b; font-family: 'Space Mono', monospace; font-size: 0.8rem; letter-spacing: 0.1em; }

                @media (max-width: 968px) {
                    .checkout-container { grid-template-columns: 1fr; gap: 3rem; }
                    .checkout-sidebar { order: 2; }
                    .payment-area { order: 1; }
                }
            `}</style>
        </div>
    );
};

export default Checkout;
