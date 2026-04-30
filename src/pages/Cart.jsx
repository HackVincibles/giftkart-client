import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ShoppingBag, Wallet, CreditCard, ShieldCheck, Trash2, Plus, Minus, Loader, MapPin, ArrowRight } from 'lucide-react';
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
    street: '', city: '', state: '', pincode: ''
  });

  const shipping = cartItems.length > 0 ? 0 : 0; // Kindred offers free shipping
  const total = subtotal > 0 ? subtotal + shipping - discount : 0;
  const amountToPay = useWallet ? Math.max(0, total - walletBalance) : total;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const cartRes = await axios.get('/cart');
      if (cartRes.data.success) {
        setCartItems(cartRes.data.data.activeItems || []);
        setSubtotal(cartRes.data.data.subtotal || 0);
      }
      const profileRes = await axios.get('/profile/me');
      if (profileRes.data.success) {
        setWalletBalance(profileRes.data.wallet?.balance || 0);
        const addr = profileRes.data.profile?.buyerProfile?.shippingAddress;
        if (addr) setAddress({ street: addr.street, city: addr.city, state: addr.state, pincode: addr.zip });
      }
      
      // Check for scheduled gift address
      const scheduled = localStorage.getItem('activeSchedule');
      if (scheduled) {
        const data = JSON.parse(scheduled);
        if (data.address) {
          setAddress({
            street: data.address.address,
            city: data.address.city,
            state: data.address.state,
            pincode: data.address.pincode
          });
        }
      }
    } catch {} finally { setLoading(false); }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      return removeItem(itemId);
    }
    try {
      await axios.put(`/cart/items/${itemId}/quantity`, { quantity: newQuantity });
      const updatedItems = cartItems.map(item => item._id === itemId ? { ...item, quantity: newQuantity } : item);
      setCartItems(updatedItems);
      setSubtotal(updatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0));
    } catch (err) { 
      console.error(err);
      error("Update failed"); 
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`/cart/items/${itemId}`);
      success("Item removed");
      const updatedItems = cartItems.filter(item => item._id !== itemId);
      setCartItems(updatedItems);
      setSubtotal(updatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0));
    } catch { error("Remove failed"); }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    setVerifyingCode(true);
    try {
      const res = await axios.post('/referral/verify', { code: promoCode.trim() });
      if (res.data.success) {
        setDiscount(Math.round(subtotal * (res.data.discountPercent / 100)));
        success(res.data.message);
      }
    } catch { error("Invalid code"); setDiscount(0); }
    finally { setVerifyingCode(false); }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return error("Cart is empty");
    if (!address.street || !address.city || !address.pincode) return error("Missing address");

    setProcessing(true);
    try {
        // We pass the cart details to the checkout page
        navigate('/checkout', { 
            state: { 
                amount: total, 
                item: `${cartItems.length} Artisan Item${cartItems.length > 1 ? 's' : ''}`,
                cartItems,
                address,
                useWallet
            } 
        });
    } catch { 
        error('Checkout failed'); 
    } finally { 
        setProcessing(false); 
    }
  };

  if (loading) return (
    <div className="kl-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Navbar />
      <Loader className="animate-spin" size={32} color="var(--text-light)" />
    </div>
  );

  return (
    <div className="kl-root">
      <Navbar />
      
      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '3rem' }}>Your Bag</h1>

        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your bag is currently empty.</p>
            <button onClick={() => navigate('/buyer-dashboard')} className="btn btn-primary">Continue Shopping</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '5rem', alignItems: 'start' }}>
            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {cartItems.map((item) => (
                  <div key={item._id} style={{ display: 'flex', gap: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <img src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/150'} alt="" style={{ width: '120px', height: '150px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: '400' }}>{item.product?.name}</h4>
                          <span style={{ fontWeight: '400' }}>₹{item.price * item.quantity}</span>
                        </div>
                        <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', marginTop: '0.4rem' }}>Unit Price: ₹{item.price}</p>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', padding: '0.2rem 0.6rem', border: '1px solid var(--border)' }}>
                          <button type="button" onClick={(e) => { e.preventDefault(); updateQuantity(item._id, item.quantity - 1); }} style={{ padding: '0.4rem', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}><Minus size={14} color="var(--text)" /></button>
                          <span style={{ width: '30px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600' }}>{item.quantity}</span>
                          <button type="button" onClick={(e) => { e.preventDefault(); updateQuantity(item._id, item.quantity + 1); }} style={{ padding: '0.4rem', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}><Plus size={14} color="var(--text)" /></button>
                        </div>
                        <button onClick={() => removeItem(item._id)} style={{ color: 'var(--text-light)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Address */}
              <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><MapPin size={18} /> Shipping Destination</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '0.6rem', display: 'block' }}>Street Address</label>
                    <input type="text" value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '0.6rem', display: 'block' }}>City</label>
                      <input type="text" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '0.6rem', display: 'block' }}>Pincode</label>
                      <input type="text" value={address.pincode} onChange={(e) => setAddress({...address, pincode: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ position: 'sticky', top: '8rem' }}>
              <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}><span>Subtotal</span><span>₹{subtotal}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}><span>Shipping</span><span>Free</span></div>
                  {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent)' }}><span>Discount</span><span>-₹{discount}</span></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', color: 'var(--text)', paddingTop: '1rem', fontWeight: '400' }}><span>Total</span><span>₹{total}</span></div>
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="text" placeholder="Promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} style={{ flex: 1, marginBottom: 0 }} />
                        <button onClick={applyPromoCode} disabled={verifyingCode} className="btn btn-secondary" style={{ padding: '0 1.2rem' }}>{verifyingCode ? '...' : 'Apply'}</button>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2.5rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Wallet size={18} />
                            <div>
                                <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>Wallet Credit</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Balance: ₹{walletBalance}</p>
                            </div>
                        </div>
                        <input type="checkbox" checked={useWallet} onChange={(e) => setUseWallet(e.target.checked)} disabled={walletBalance === 0} style={{ width: '18px', height: '18px', accentColor: 'var(--text)' }} />
                    </div>
                </div>

                <button onClick={handleCheckout} disabled={processing} className="btn btn-primary" style={{ width: '100%', padding: '1.2rem' }}>
                  {processing ? 'Processing...' : amountToPay === 0 ? 'Complete Order' : 'Proceed to Payment'} <ArrowRight size={18} />
                </button>
                
                <div style={{ textAlign: 'center', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-light)', fontSize: '0.7rem' }}>
                    <ShieldCheck size={14} /> Secure transaction
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Cart;
