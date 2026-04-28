import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ShoppingBag, ArrowRight, Wallet, CreditCard, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const Cart = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [useWallet, setUseWallet] = useState(false);

  // Mock Cart Data
  const cartItems = [
    {
      id: '1',
      name: 'Custom Engraved Wooden Frame',
      price: 1200,
      quantity: 1,
      customizations: { 'Name to Engrave': 'Aditya & Sarah', 'Upload Photo': 'photo.jpg' },
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=200'
    }
  ];

  const walletBalance = 500;
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 50;
  const total = subtotal + shipping;
  const amountToPay = useWallet ? Math.max(0, total - walletBalance) : total;

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      // 1. Create order on backend (which generates Razorpay order if amountToPay > 0)
      /*
      const orderRes = await axios.post('/payment/create', {
        products: cartItems.map(item => ({ productId: item.id, quantity: item.quantity })),
        shippingAddress: { street: "123 Main St", city: "Mumbai", pincode: "400001" },
        paymentMethod: amountToPay === 0 ? "wallet" : "razorpay",
        useWalletBalance: useWallet
      });
      
      // 2. Open Razorpay if payment needed
      if (amountToPay > 0) {
         const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: orderRes.data.amount,
            currency: "INR",
            order_id: orderRes.data.razorpayOrderId,
            handler: async (response) => {
               // 3. Verify Payment
               await axios.post('/payment/verify', response);
               navigate('/buyer-dashboard');
            }
         };
         const rzp = new window.Razorpay(options);
         rzp.open();
      } else {
         navigate('/buyer-dashboard');
      }
      */
      
      // Simulating checkout success
      setTimeout(() => {
        alert('Order Placed Successfully! (Razorpay Mock)');
        navigate('/buyer-dashboard');
        setLoading(false);
      }, 1500);

    } catch (err) {
      console.error("Checkout failed", err);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <main className="container animate-fade-in" style={{ padding: '3rem 2rem', flex: 1 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingBag /> Secure Checkout
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>Order Summary</h3>
              
              {cartItems.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '1.5rem', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <img src={item.image} alt={item.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{item.name}</h4>
                      <span style={{ fontWeight: 'bold' }}>₹{item.price}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {Object.entries(item.customizations).map(([key, val]) => (
                        <span key={key}><strong>{key}:</strong> {val}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>Shipping Address</h3>
              <div className="input-group">
                <label className="input-label">Full Address</label>
                <textarea className="input-field" rows="3" placeholder="Enter your delivery address" defaultValue="123 Main St, Mumbai, 400001"></textarea>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Payment</h3>
            
            {/* Wallet Integration */}
            <div style={{ 
              background: 'rgba(139, 92, 246, 0.1)', border: '1px solid var(--accent-primary)', 
              padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Wallet color="var(--accent-primary)" size={24} />
                <div>
                  <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>GiftKart Wallet</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Available: ₹{walletBalance}</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={useWallet} 
                onChange={(e) => setUseWallet(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Shipping</span>
                <span>₹{shipping}</span>
              </div>
              {useWallet && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                  <span>Wallet Applied</span>
                  <span>-₹{Math.min(walletBalance, total)}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>To Pay</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{amountToPay}</span>
            </div>

            <button 
              onClick={handleCheckout} 
              disabled={loading}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              {loading ? 'Processing...' : (
                <><CreditCard size={20} /> Pay via Razorpay</>
              )}
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <ShieldCheck size={16} color="var(--success)" /> Secured by Razorpay
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;
