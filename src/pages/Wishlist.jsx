import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Heart, ShoppingCart, Trash2, ArrowRight, Sparkles, Gift, Clock, Tag, Share2, Link as LinkIcon, Lock, Globe, Check } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { success, error } = useToast();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get('/wishlist');
      if (res.data.success) {
        setWishlist(res.data.data);
        setIsPublic(res.data.data.isPublic || false);
        setShareUrl(res.data.data.shareUrl || '');
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePublic = async () => {
    try {
        const newStatus = !isPublic;
        const res = await axios.put('/wishlist/share', { 
            isPublic: newStatus 
        });
        if (res.data.success) {
            setIsPublic(newStatus);
            setShareUrl(res.data.data.shareUrl);
            success(newStatus ? "Wishlist is now public!" : "Wishlist is now private");
        }
    } catch (err) {
        error("Failed to update sharing settings");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await axios.delete(`/wishlist/${productId}`);
      if (res.data.success) {
        setWishlist(res.data.data);
        success("Removed from wishlist");
      }
    } catch (err) {
      error("Failed to remove item");
    }
  };

  const addToCart = async (productId) => {
    try {
      await axios.post('/cart/add', { productId, quantity: 1 });
      success("Added to cart!");
    } catch (err) {
      error("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navbar />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                <Heart size={32} color="#ef4444" fill="#ef4444" />
            </div>
            <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.04em' }}>Your Favorites</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Items you've saved for later or discovered through AI.</p>
            </div>
        </div>

        {!wishlist || wishlist.products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--bg-tertiary)', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
            <div style={{ marginBottom: '1.5rem', display: 'inline-block', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '50%' }}>
                <Gift size={48} color="var(--text-muted)" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Your wishlist is empty</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
              Discover amazing gifts through our AI recommendation engine or browse the marketplace to save your favorites.
            </p>
            <button onClick={() => navigate('/gifting-ai')} className="btn btn-primary">Try Gifting AI</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {wishlist.products.map((item) => (
              <div key={item.product._id} className="glass-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: '220px' }}>
                    <img 
                        src={item.product.images?.[0]?.url || 'https://via.placeholder.com/400x300'} 
                        alt={item.product.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <button 
                        onClick={() => removeFromWishlist(item.product._id)}
                        style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                        <Trash2 size={18} />
                    </button>
                    {item.priority === 'high' && (
                        <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--accent-primary)', color: 'white', padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            HIGH PRIORITY
                        </div>
                    )}
                </div>

                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>{item.product.name}</h3>
                        <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-primary)' }}>₹{item.product.basePrice}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                        <Clock size={14} /> Added on {new Date(item.addedAt).toLocaleDateString()}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                        <button 
                            onClick={() => addToCart(item.product._id)} 
                            className="btn btn-primary" 
                            style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <ShoppingCart size={18} /> Add to Cart
                        </button>
                        <button 
                            onClick={() => navigate(`/product/${item.product._id}`)} 
                            className="btn btn-secondary" 
                            style={{ width: '48px', height: '48px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
