import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { ShoppingBag, Heart, Calendar, Wallet, Search, Package, ArrowRight, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products');
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
        const res = await axios.get('/wishlist');
        if (res.data.success) {
            const ids = new Set(res.data.data.products.map(p => p.product._id));
            setWishlistIds(ids);
        }
    } catch (err) {
        console.error('Wishlist fetch error:', err);
    }
  };

  const toggleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
        if (wishlistIds.has(productId)) {
            await axios.delete(`/wishlist/${productId}`);
            setWishlistIds(prev => {
                const next = new Set(prev);
                next.delete(productId);
                return next;
            });
            success("Removed from favorites");
        } else {
            await axios.post('/wishlist/add', { productId });
            setWishlistIds(prev => new Set(prev).add(productId));
            success("Added to favorites!");
        }
    } catch (err) {
        error("Failed to update favorites");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navbar />
      
      <main className="container animate-fade-in" style={{ padding: '3rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '0.5rem', letterSpacing: '-0.04em' }}>Welcome, {user?.displayName}!</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Ready to find the perfect gift today?</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/gifting-ai" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1.5rem', borderRadius: '14px', fontSize: '1rem', fontWeight: '700' }}>
              <Search size={20} /> Ask Gifting AI
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '5rem' }}>
          <Link to="/orders" className="glass-panel hover-scale" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', transition: 'all 0.3s', borderRadius: '24px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <ShoppingBag color="#3b82f6" size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>My Orders</h3>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.95rem' }}>Track and manage orders</p>
          </Link>

          <Link to="/auto-gifting" className="glass-panel hover-scale" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', transition: 'all 0.3s', borderRadius: '24px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Calendar color="var(--success)" size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>AI Calendar</h3>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.95rem' }}>Automate your gifting</p>
          </Link>

          <Link to="/wishlist" className="glass-panel hover-scale" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', transition: 'all 0.3s', borderRadius: '24px' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Heart color="#ef4444" size={32} fill="#ef4444" />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Wishlist</h3>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.95rem' }}>Your saved favorites</p>
          </Link>

          <Link to="/profile" className="glass-panel hover-scale" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', transition: 'all 0.3s', borderRadius: '24px' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Wallet color="var(--accent-primary)" size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Wallet</h3>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.95rem' }}>Credits and Profile</p>
          </Link>
        </div>

        <div style={{ marginTop: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.03em' }}>
            <Package color="var(--accent-primary)" size={32} /> Trending Gifts
          </h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem' }}>
                <Loader className="animate-spin" size={40} color="var(--accent-primary)" />
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Curating marketplace...</p>
            </div>
          ) : products.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2.5rem' }}>
              {products.map(product => (
                <div key={product._id} className="glass-panel hover-scale" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '24px', border: '1px solid var(--border-light)', position: 'relative' }}>
                  
                  {/* Heart Toggle */}
                  <button 
                    onClick={(e) => toggleWishlist(e, product._id)}
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 10, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: wishlistIds.has(product._id) ? '#ef4444' : 'white', transition: 'all 0.2s' }}
                  >
                    <Heart size={20} fill={wishlistIds.has(product._id) ? '#ef4444' : 'transparent'} />
                  </button>

                  <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '240px', overflow: 'hidden' }}>
                      <img src={product.images?.[0]?.url || 'https://via.placeholder.com/400x300'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '1px' }}>{product.category}</span>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{product.name}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', flex: 1, lineHeight: '1.6' }}>{product.description?.substring(0, 100)}...</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)' }}>₹{product.basePrice}</span>
                        <div className="btn btn-secondary" style={{ padding: '0.6rem 1rem', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }}>
                          View <ArrowRight size={18} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px' }}>
              <Package size={48} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No products yet</h3>
              <p style={{ color: 'var(--text-secondary)' }}>The marketplace is currently being updated. Check back soon!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BuyerDashboard;
