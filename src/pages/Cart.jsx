import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ShoppingBag, Wallet, CreditCard, ShieldCheck, Trash2, Plus, Minus, Loader, MapPin } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const Cart = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [useWallet, setUseWallet] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [address, setAddress] = useState({
    street: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001'
  });

  const shipping = cartItems.length > 0 ? 50 : 0;
  const total = subtotal > 0 ? subtotal + shipping - discount : 0;
  const amountToPay = useWallet ? Math.max(0, total - walletBalance) : total;

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);

    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch cart
      const cartRes = await axios.get('/cart');
      if (cartRes.data.success) {
        setCartItems(cartRes.data.data.activeItems || []);
        setSubtotal(cartRes.data.data.subtotal || 0);
      }

      // Fetch wallet balance
      const profileRes = await axios.get('/profile/me');
      if (profileRes.data.success) {
        setWalletBalance(profileRes.data.wallet?.balance || 0);
        
        // Check if fulfilling a specific schedule
        const activeSchedule = JSON.parse(localStorage.getItem('activeSchedule'));
        if (activeSchedule && activeSchedule.address) {
            setAddress({
                street: activeSchedule.address.address || '',
                city: activeSchedule.address.city || '',
                state: activeSchedule.address.state || '',
                pincode: activeSchedule.address.pincode || ''
            });
            info(`Fulfilling gift for ${activeSchedule.recipient}`);
        } else if (profileRes.data.profile?.buyerProfile?.shippingAddress) {
            const addr = profileRes.data.profile.buyerProfile.shippingAddress;
            setAddress({
                street: addr.street || '123 Main St',
                city: addr.city || 'Mumbai',
                state: addr.state || 'Maharashtra',
                pincode: addr.zip || '400001'
            });
        }
      }
    } catch (err) {
      console.error("Failed to fetch cart/wallet", err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(`/cart/items/${itemId}/quantity`, { quantity: newQuantity });
      // Update local state immediately for better UX
      const updatedItems = cartItems.map(item => 
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedItems);
      // Recalculate subtotal
      const newSubtotal = updatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      setSubtotal(newSubtotal);
    } catch (err) {
      error("Failed to update quantity");
      fetchData(); // Sync back with server on error
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`/cart/items/${itemId}`);
      success("Item removed from cart");
      // Update local state
      const updatedItems = cartItems.filter(item => item._id !== itemId);
      setCartItems(updatedItems);
      const newSubtotal = updatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      setSubtotal(newSubtotal);
    } catch (err) {
      error("Failed to remove item");
      fetchData();
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    setVerifyingCode(true);
    try {
      const res = await axios.post('/referral/verify', { code: promoCode.trim() });
      if (res.data.success) {
        const disc = Math.round(subtotal * (res.data.discountPercent / 100));
        setDiscount(disc);
        success(res.data.message);
      }
    } catch (err) {
      error(err.response?.data?.message || "Invalid or expired code");
      setDiscount(0);
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      error("Your cart is empty!");
      return;
    }

    if (!address.street || !address.city || !address.pincode) {
        error("Please provide a complete shipping address.");
        return;
    }

    setProcessing(true);
    try {
      const activeSchedule = JSON.parse(localStorage.getItem('activeSchedule'));
      
      const orderPayload = {
        products: cartItems.map(item => ({ 
          productId: item.product._id || item.product, 
          quantity: item.quantity 
        })),
        shippingAddress: address,
        paymentMethod: amountToPay === 0 ? "wallet" : "razorpay",
        useWalletBalance: useWallet,
        isScheduledGift: activeSchedule?.isScheduledGift || false,
        scheduleId: activeSchedule?.id || null
      };

      const orderRes = await axios.post('/payment/create', orderPayload);
      
      if (amountToPay > 0 && orderRes.data.data.razorpayOrder) {
         const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: orderRes.data.data.razorpayOrder.amount,
            currency: "INR",
            order_id: orderRes.data.data.razorpayOrder.id,
            name: "GiftKart",
            description: "Gift Purchase",
            handler: async (response) => {
               try {
                 await axios.post('/payment/verify', {
                   razorpay_order_id: response.razorpay_order_id,
                   razorpay_payment_id: response.razorpay_payment_id,
                   razorpay_signature: response.razorpay_signature,
                   orderId: orderRes.data.data.order._id
                 });
                 // Clear cart after successful checkout
                 await axios.delete('/cart/clear');
                 localStorage.removeItem('activeSchedule');
                 success('Payment successful and verified!');
                 navigate('/buyer-dashboard');
               } catch (verifyErr) {
                 error('Payment verification failed.');
               }
            },
            prefill: {
                name: orderRes.data.data.order.buyer?.displayName || "",
                email: orderRes.data.data.order.buyer?.email || ""
            },
            theme: { color: "#8b5cf6" }
         };
         const rzp = new window.Razorpay(options);
         rzp.on('payment.failed', function (response){
             error("Payment failed: " + response.error.description);
         });
         rzp.open();
      } else if (amountToPay === 0) {
         await axios.delete('/cart/clear');
         localStorage.removeItem('activeSchedule');
         success('Order Placed Successfully via Wallet!');
         navigate('/buyer-dashboard');
      }

    } catch (err) {
      console.error("Checkout failed", err);
      error(err.response?.data?.message || 'Checkout failed. Please ensure the backend is running.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Loader className="animate-spin" size={40} color="var(--accent-primary)" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <main className="container animate-fade-in" style={{ padding: '2rem 1rem', flex: 1 }}>
        <h1 className="dashboard-title" style={{ fontWeight: '900', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShoppingBag size={28} /> Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="glass-panel" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
            <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Your cart is empty</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>Looks like you haven't added anything to your cart yet.</p>
            <button onClick={() => navigate('/buyer-dashboard')} className="btn btn-primary">Start Shopping</button>
          </div>
        ) : (
          <div className="cart-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
            {/* Left: Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', borderRadius: '24px' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Items ({cartItems.length})</h3>
                  <button onClick={() => axios.delete('/cart/clear').then(fetchData)} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '700' }}>Clear All</button>
                </div>
                
                {cartItems.map((item) => (
                  <div key={item._id} style={{ display: 'flex', gap: '1rem', padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
                    <img 
                      src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/100'} 
                      alt={item.product?.name} 
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', background: 'var(--bg-tertiary)' }} 
                    />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: '150px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.2rem' }}>{item.product?.name}</h4>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>₹{item.price} each</span>
                        </div>
                        <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>₹{item.price * item.quantity}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                          <button onClick={() => updateQuantity(item._id, item.quantity - 1)} style={{ padding: '0.3rem 0.6rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <Minus size={12} />
                          </button>
                          <span style={{ padding: '0 0.4rem', fontWeight: '700', minWidth: '24px', textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, item.quantity + 1)} style={{ padding: '0.3rem 0.6rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <Plus size={12} />
                          </button>
                        </div>

                        <button onClick={() => removeItem(item._id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: '600' }}>
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Address */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={18} color="var(--accent-primary)" /> Delivery Address
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Street Address</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={address.street} 
                      onChange={(e) => setAddress({...address, street: e.target.value})}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">City</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={address.city} 
                        onChange={(e) => setAddress({...address, city: e.target.value})}
                      />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Pincode</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={address.pincode} 
                        onChange={(e) => setAddress({...address, pincode: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Summary & Payment */}
            <div className="cart-summary" style={{ position: 'sticky', top: '2rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: '800' }}>Order Summary</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span>Price ({cartItems.length} items)</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span>Delivery</span>
                    <span style={{ color: 'var(--success)', fontWeight: '700' }}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>
                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontSize: '0.9rem', fontWeight: '700' }}>
                      <span>Discount (Promo)</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                </div>

                {/* Promo Code Section */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Referral / Promo Code" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      style={{ flex: 1, marginBottom: 0, textTransform: 'uppercase', letterSpacing: '1px' }}
                    />
                    <button 
                      onClick={applyPromoCode}
                      disabled={verifyingCode || !promoCode}
                      className="btn btn-secondary"
                      style={{ padding: '0 1rem', fontSize: '0.8rem' }}
                    >
                      {verifyingCode ? <Loader className="animate-spin" size={14} /> : 'Apply'}
                    </button>
                  </div>
                </div>

                {/* Wallet Toggle */}
                <div style={{ 
                  background: 'rgba(139, 92, 246, 0.05)', 
                  border: '1px solid rgba(139, 92, 246, 0.2)', 
                  padding: '1rem', borderRadius: '16px', marginBottom: '1.25rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Wallet color="var(--accent-primary)" size={18} />
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '0.85rem', margin: 0 }}>Use Balance</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>₹{walletBalance}</p>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={useWallet} 
                      onChange={(e) => setUseWallet(e.target.checked)}
                      disabled={walletBalance === 0}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                    />
                  </div>
                  {useWallet && walletBalance > 0 && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontSize: '0.85rem', fontWeight: '700' }}>
                      <span>Deducted</span>
                      <span>-₹{Math.min(walletBalance, total)}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '700' }}>Total</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)' }}>₹{amountToPay}</span>
                </div>

                <button 
                  onClick={handleCheckout} 
                  disabled={processing}
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', fontWeight: '800' }}
                >
                  {processing ? <Loader className="animate-spin" size={20} /> : (
                    <><CreditCard size={20} /> {amountToPay === 0 ? 'Place Order' : 'Pay Now'}</>
                  )}
                </button>
                
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <ShieldCheck size={16} color="var(--success)" /> Secure checkout
                </div>
              </div>
              
              <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Secure payment powered by Razorpay.
              </p>
            </div>
          </div>
        )}
      </main>


    </div>
  );
};

export default Cart;

